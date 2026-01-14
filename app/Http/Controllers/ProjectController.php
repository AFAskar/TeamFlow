<?php

namespace App\Http\Controllers;

use App\Enums\ProjectRole;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\LabelResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\TeamResource;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Project;
use App\Models\ProjectMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = $request->user()
            ->projects()
            ->with(['team', 'creator'])
            ->withCount(['members', 'tasks'])
            ->orderBy('updated_at', 'desc')
            ->paginate(12);

        return Inertia::render('projects/index', [
            'projects' => ProjectResource::collection($projects),
        ]);
    }

    public function create(Request $request): Response
    {
        $teams = $request->user()
            ->teams()
            ->select('teams.id', 'teams.name')
            ->get();

        return Inertia::render('projects/create', [
            'teams' => TeamResource::collection($teams),
        ]);
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = Project::create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'team_id' => $request->validated('team_id'),
            'created_by' => $request->user()->id,
        ]);

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
            'role' => ProjectRole::Lead,
        ]);

        AuditLog::create([
            'action' => 'created',
            'entity_type' => 'Project',
            'entity_id' => $project->id,
            'old_values' => null,
            'new_values' => $project->toArray(),
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'Project created successfully.');
    }

    public function show(Request $request, Project $project): Response
    {
        $this->authorizeProjectAccess($project, $request->user());

        $project->load([
            'team',
            'creator',
            'members',
            'tasks' => fn ($query) => $query->whereNull('parent_id')->orderBy('position'),
            'tasks.assignee',
            'tasks.labels',
            'tasks.subtasks',
        ])->loadCount(['members', 'tasks']);

        $labels = $project->team->labels()->get();

        return Inertia::render('projects/show', [
            'project' => new ProjectResource($project),
            'tasks' => TaskResource::collection($project->tasks),
            'labels' => LabelResource::collection($labels),
            'members' => UserResource::collection($project->members),
        ]);
    }

    public function edit(Request $request, Project $project): Response
    {
        $this->authorizeProjectAccess($project, $request->user());

        return Inertia::render('projects/edit', [
            'project' => new ProjectResource($project->load('team')),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $oldValues = $project->toArray();

        $project->update($request->validated());

        AuditLog::create([
            'action' => 'updated',
            'entity_type' => 'Project',
            'entity_id' => $project->id,
            'old_values' => $oldValues,
            'new_values' => $project->fresh()->toArray(),
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'Project updated successfully.');
    }

    public function destroy(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeProjectAccess($project, $request->user());

        if ($project->created_by !== $request->user()->id) {
            return back()->with('error', 'Only the project creator can delete this project.');
        }

        AuditLog::create([
            'action' => 'deleted',
            'entity_type' => 'Project',
            'entity_id' => $project->id,
            'old_values' => $project->toArray(),
            'new_values' => null,
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        $project->delete();

        return redirect()
            ->route('projects.index')
            ->with('success', 'Project archived successfully.');
    }

    public function restore(Request $request, string $id): RedirectResponse
    {
        $project = Project::withTrashed()->findOrFail($id);
        $this->authorizeProjectAccess($project, $request->user());

        if ($project->created_by !== $request->user()->id) {
            return back()->with('error', 'Only the project creator can restore this project.');
        }

        $project->restore();

        AuditLog::create([
            'action' => 'restored',
            'entity_type' => 'Project',
            'entity_id' => $project->id,
            'old_values' => null,
            'new_values' => $project->toArray(),
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'Project restored successfully.');
    }

    public function addMember(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeProjectAccess($project, $request->user());

        $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'role' => ['required', 'string', 'in:Lead,TechnicalLead,Member'],
        ]);

        $exists = ProjectMember::where('project_id', $project->id)
            ->where('user_id', $request->input('user_id'))
            ->exists();

        if ($exists) {
            return back()->with('error', 'User is already a project member.');
        }

        $isTeamMember = $project->team->members()
            ->where('users.id', $request->input('user_id'))
            ->exists();

        if (! $isTeamMember) {
            return back()->with('error', 'User must be a team member first.');
        }

        ProjectMember::create([
            'project_id' => $project->id,
            'user_id' => $request->input('user_id'),
            'role' => $request->input('role'),
        ]);

        return back()->with('success', 'Member added to project.');
    }

    public function removeMember(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeProjectAccess($project, $request->user());

        $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
        ]);

        if ($project->created_by === $request->input('user_id')) {
            return back()->with('error', 'Cannot remove the project creator.');
        }

        ProjectMember::where('project_id', $project->id)
            ->where('user_id', $request->input('user_id'))
            ->delete();

        return back()->with('success', 'Member removed from project.');
    }

    public function kanban(Request $request, Project $project): Response
    {
        $this->authorizeProjectAccess($project, $request->user());

        $project->load([
            'team',
            'tasks' => fn ($query) => $query->whereNull('parent_id')->orderBy('position'),
            'tasks.assignee',
            'tasks.labels',
            'tasks.subtasks',
        ]);

        $labels = $project->team->labels()->get();
        $members = $project->members()->get();

        return Inertia::render('projects/kanban', [
            'project' => new ProjectResource($project),
            'tasks' => TaskResource::collection($project->tasks),
            'labels' => LabelResource::collection($labels),
            'members' => UserResource::collection($members),
        ]);
    }

    private function authorizeProjectAccess(Project $project, $user): void
    {
        $isMember = $user->projects()->where('projects.id', $project->id)->exists();

        if (! $isMember) {
            $isTeamMember = $user->teams()->where('teams.id', $project->team_id)->exists();
            if (! $isTeamMember) {
                abort(403, 'You do not have access to this project.');
            }
        }
    }
}
