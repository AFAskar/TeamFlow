<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    /**
     * Perform global search across teams, projects, and tasks.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $query = $request->input('q');
        $user = $request->user();

        // Get user's team IDs
        $teamIds = $user->teams()->pluck('teams.id');

        // Search teams
        $teams = Team::whereIn('id', $teamIds)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'description'])
            ->map(fn ($team) => [
                'id' => $team->id,
                'name' => $team->name,
                'description' => $team->description,
                'type' => 'team',
                'url' => route('teams.show', $team->id),
            ]);

        // Search projects in user's teams
        $projects = Project::whereIn('team_id', $teamIds)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'description', 'team_id'])
            ->map(fn ($project) => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'type' => 'project',
                'url' => route('projects.show', $project->id),
            ]);

        // Get project IDs user has access to
        $projectIds = Project::whereIn('team_id', $teamIds)->pluck('id');

        // Search tasks in accessible projects
        $tasks = Task::whereIn('project_id', $projectIds)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->limit(5)
            ->get(['id', 'name', 'description', 'status', 'project_id'])
            ->map(fn ($task) => [
                'id' => $task->id,
                'name' => $task->name,
                'description' => $task->description,
                'status' => $task->status?->value,
                'type' => 'task',
                'url' => route('tasks.show', $task->id),
            ]);

        return response()->json([
            'results' => [
                'teams' => $teams,
                'projects' => $projects,
                'tasks' => $tasks,
            ],
            'total' => $teams->count() + $projects->count() + $tasks->count(),
        ]);
    }
}
