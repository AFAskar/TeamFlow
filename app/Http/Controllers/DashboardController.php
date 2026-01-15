<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\TeamResource;
use App\Models\AuditLog;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @group Dashboard
 *
 * APIs for dashboard data. Provides statistics and recent activity for users and teams.
 */
class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $myTasks = Task::where('assigned_to', $user->id)
            ->whereNot('status', TaskStatus::Done)
            ->with(['project.team', 'labels'])
            ->orderBy('due_date')
            ->limit(10)
            ->get();

        $teams = $user->teams()
            ->withCount(['members', 'projects'])
            ->limit(5)
            ->get();

        $projects = $user->projects()
            ->with('team')
            ->withCount('tasks')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();

        $taskStats = [
            'total' => Task::whereHas('project.members', fn ($q) => $q->where('user_id', $user->id))->count(),
            'completed' => Task::whereHas('project.members', fn ($q) => $q->where('user_id', $user->id))
                ->where('status', TaskStatus::Done)
                ->count(),
            'in_progress' => Task::whereHas('project.members', fn ($q) => $q->where('user_id', $user->id))
                ->where('status', TaskStatus::InProgress)
                ->count(),
            'overdue' => Task::whereHas('project.members', fn ($q) => $q->where('user_id', $user->id))
                ->whereNot('status', TaskStatus::Done)
                ->whereNotNull('due_date')
                ->where('due_date', '<', now())
                ->count(),
            'my_assigned' => Task::where('assigned_to', $user->id)
                ->whereNot('status', TaskStatus::Done)
                ->count(),
        ];

        $recentActivity = AuditLog::whereIn('entity_type', ['Task', 'Project', 'Team'])
            ->whereHas('user', fn ($q) => $q->whereHas('teams', fn ($t) => $t->whereIn('teams.id', $user->teams()->pluck('teams.id'))))
            ->with('user')
            ->orderBy('done_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'username' => $log->user->username,
                    'avatar' => $log->user->avatar_token_url,
                ] : null,
                'done_at' => $log->done_at?->toISOString(),
            ]);

        return Inertia::render('dashboard', [
            'myTasks' => TaskResource::collection($myTasks),
            'teams' => TeamResource::collection($teams),
            'projects' => ProjectResource::collection($projects),
            'taskStats' => $taskStats,
            'recentActivity' => $recentActivity,
        ]);
    }

    public function teamDashboard(Request $request, string $teamId): Response
    {
        $user = $request->user();
        $isMember = $user->teams()->where('teams.id', $teamId)->exists();

        if (! $isMember) {
            abort(403, 'You are not a member of this team.');
        }

        $projects = $user->projects()
            ->whereHas('team', fn ($q) => $q->where('id', $teamId))
            ->with('creator')
            ->withCount('tasks')
            ->get();

        $projectIds = $projects->pluck('id');

        $taskStats = [
            'total' => Task::whereIn('project_id', $projectIds)->count(),
            'completed' => Task::whereIn('project_id', $projectIds)->where('status', TaskStatus::Done)->count(),
            'in_progress' => Task::whereIn('project_id', $projectIds)->where('status', TaskStatus::InProgress)->count(),
            'pending' => Task::whereIn('project_id', $projectIds)->where('status', TaskStatus::Pending)->count(),
        ];

        $memberProductivity = Task::whereIn('project_id', $projectIds)
            ->where('status', TaskStatus::Done)
            ->whereNotNull('assigned_to')
            ->selectRaw('assigned_to, COUNT(*) as completed_count')
            ->groupBy('assigned_to')
            ->with('assignee:id,username,avatar_token_url')
            ->orderByDesc('completed_count')
            ->limit(10)
            ->get();

        return Inertia::render('teams/dashboard', [
            'teamId' => $teamId,
            'projects' => ProjectResource::collection($projects),
            'taskStats' => $taskStats,
            'memberProductivity' => $memberProductivity,
        ]);
    }
}
