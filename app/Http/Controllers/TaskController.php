<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Http\Requests\Task\ReorderTasksRequest;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Http\Resources\LabelResource;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Task;
use App\Models\TaskLabel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @group Tasks
 *
 * APIs for managing tasks within projects. Tasks support status tracking, priority levels, due dates, and assignments.
 */
class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Task::query()
            ->whereHas('project', function ($q) use ($request) {
                $q->whereHas('members', fn ($m) => $m->where('user_id', $request->user()->id));
            })
            ->with(['project.team', 'assignee', 'labels', 'creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('assignee')) {
            $query->where('assigned_to', $request->input('assignee'));
        }

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->input('project_id'));
        }

        if ($request->filled('due_date_from')) {
            $query->whereDate('due_date', '>=', $request->input('due_date_from'));
        }

        if ($request->filled('due_date_to')) {
            $query->whereDate('due_date', '<=', $request->input('due_date_to'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $sortField = $request->input('sort', 'updated_at');
        $sortDirection = $request->input('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $tasks = $query->paginate(20)->withQueryString();

        return Inertia::render('tasks/index', [
            'tasks' => TaskResource::collection($tasks),
            'filters' => $request->only([
                'status', 'priority', 'assignee', 'project_id',
                'due_date_from', 'due_date_to', 'search', 'sort', 'direction',
            ]),
            'statuses' => TaskStatus::cases(),
        ]);
    }

    public function create(Request $request): Response
    {
        $projects = $request->user()
            ->projects()
            ->with('team.labels')
            ->get();

        return Inertia::render('tasks/create', [
            'projects' => ProjectResource::collection($projects),
        ]);
    }

    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $maxPosition = Task::where('project_id', $request->validated('project_id'))
            ->where('status', $request->validated('status') ?? TaskStatus::Unplanned->value)
            ->whereNull('parent_id')
            ->max('position') ?? -1;

        $task = Task::create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'project_id' => $request->validated('project_id'),
            'status' => $request->validated('status') ?? TaskStatus::Unplanned,
            'priority' => $request->validated('priority'),
            'due_date' => $request->validated('due_date'),
            'assigned_to' => $request->validated('assigned_to'),
            'parent_id' => $request->validated('parent_id'),
            'created_by' => $request->user()->id,
            'position' => $maxPosition + 1,
        ]);

        if ($request->has('labels')) {
            foreach ($request->validated('labels') as $labelId) {
                TaskLabel::create([
                    'task_id' => $task->id,
                    'label_id' => $labelId,
                ]);
            }
        }

        AuditLog::create([
            'action' => 'created',
            'entity_type' => 'Task',
            'entity_id' => $task->id,
            'old_values' => null,
            'new_values' => $task->toArray(),
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return redirect()
            ->route('projects.show', $task->project_id)
            ->with('success', 'Task created successfully.');
    }

    public function show(Request $request, Task $task): Response
    {
        $this->authorizeTaskAccess($task, $request->user());

        $task->load([
            'project.team',
            'creator',
            'assignee',
            'labels',
            'subtasks.assignee',
            'comments.creator',
            'attachments.user',
        ])->loadCount(['subtasks', 'comments', 'attachments']);

        $labels = $task->project->team->labels()->get();
        $members = $task->project->members()->get();

        return Inertia::render('tasks/show', [
            'task' => new TaskResource($task),
            'labels' => LabelResource::collection($labels),
            'members' => UserResource::collection($members),
        ]);
    }

    public function edit(Request $request, Task $task): Response
    {
        $this->authorizeTaskAccess($task, $request->user());

        $task->load(['project.team.labels', 'labels']);

        $members = $task->project->members()->get();

        return Inertia::render('tasks/edit', [
            'task' => new TaskResource($task),
            'labels' => LabelResource::collection($task->project->team->labels),
            'members' => UserResource::collection($members),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $oldValues = $task->toArray();

        $task->update($request->safe()->except('labels'));

        if ($request->has('labels')) {
            TaskLabel::where('task_id', $task->id)->delete();
            foreach ($request->validated('labels') as $labelId) {
                TaskLabel::create([
                    'task_id' => $task->id,
                    'label_id' => $labelId,
                ]);
            }
        }

        AuditLog::create([
            'action' => 'updated',
            'entity_type' => 'Task',
            'entity_id' => $task->id,
            'old_values' => $oldValues,
            'new_values' => $task->fresh()->toArray(),
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return back()->with('success', 'Task updated successfully.');
    }

    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): JsonResponse
    {
        $oldStatus = $task->status;

        $task->update([
            'status' => $request->validated('status'),
            'position' => $request->validated('position') ?? $task->position,
        ]);

        AuditLog::create([
            'action' => 'status_changed',
            'entity_type' => 'Task',
            'entity_id' => $task->id,
            'old_values' => ['status' => $oldStatus?->value],
            'new_values' => ['status' => $request->validated('status')],
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'task' => new TaskResource($task->fresh(['assignee', 'labels'])),
        ]);
    }

    public function reorder(ReorderTasksRequest $request): JsonResponse
    {
        foreach ($request->validated('tasks') as $taskData) {
            Task::where('id', $taskData['id'])
                ->update([
                    'position' => $taskData['position'],
                    'status' => $taskData['status'] ?? null,
                ]);
        }

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, Task $task): RedirectResponse
    {
        $this->authorizeTaskAccess($task, $request->user());

        $projectId = $task->project_id;

        AuditLog::create([
            'action' => 'deleted',
            'entity_type' => 'Task',
            'entity_id' => $task->id,
            'old_values' => $task->toArray(),
            'new_values' => null,
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        $task->delete();

        return redirect()
            ->route('projects.show', $projectId)
            ->with('success', 'Task deleted successfully.');
    }

    public function myTasks(Request $request): Response
    {
        $tasks = Task::where('assigned_to', $request->user()->id)
            ->with(['project.team', 'labels'])
            ->orderByRaw("CASE 
                WHEN status = 'In-Progress' THEN 1 
                WHEN status = 'Pending' THEN 2 
                WHEN status = 'Unplanned' THEN 3 
                WHEN status = 'Done' THEN 4 
                ELSE 5 END")
            ->orderBy('due_date')
            ->paginate(20);

        return Inertia::render('tasks/my-tasks', [
            'tasks' => TaskResource::collection($tasks),
        ]);
    }

    private function authorizeTaskAccess(Task $task, $user): void
    {
        $isMember = $user->projects()->where('projects.id', $task->project_id)->exists();

        if (! $isMember) {
            abort(403, 'You do not have access to this task.');
        }
    }
}
