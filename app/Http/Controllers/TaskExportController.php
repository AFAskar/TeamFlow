<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * @group Task Exports
 *
 * APIs for exporting tasks to various formats (CSV, PDF).
 */
class TaskExportController extends Controller
{
    /**
     * Export tasks to CSV format.
     *
     * Exports a filtered list of tasks that the authenticated user has access to.
     *
     * @queryParam status string Filter by task status. Example: In-Progress
     * @queryParam priority string Filter by priority level. Example: High
     * @queryParam project_id string Filter by project UUID. Example: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
     * @queryParam search string Search in task name and description. Example: bug fix
     */
    public function csv(Request $request): StreamedResponse
    {
        $tasks = $this->getFilteredTasks($request);
        $context = $request->input('context', 'global');

        $filename = "{$context}-tasks-export-".now()->format('Y-m-d-His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($tasks) {
            $handle = fopen('php://output', 'w');

            // CSV Header
            fputcsv($handle, [
                'ID',
                'Name',
                'Description',
                'Status',
                'Priority',
                'Due Date',
                'Project',
                'Team',
                'Assigned To',
                'Created By',
                'Created At',
                'Updated At',
            ]);

            // CSV Data
            foreach ($tasks as $task) {
                fputcsv($handle, [
                    $task->id,
                    $task->name,
                    strip_tags($task->description ?? ''),
                    $task->status?->value ?? '',
                    $task->priority?->value ?? '',
                    $task->due_date?->format('Y-m-d') ?? '',
                    $task->project?->name ?? '',
                    $task->project?->team?->name ?? '',
                    $task->assignee?->name ?? '',
                    $task->creator?->name ?? '',
                    $task->created_at?->format('Y-m-d H:i:s') ?? '',
                    $task->updated_at?->format('Y-m-d H:i:s') ?? '',
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Export tasks to PDF format.
     *
     * Exports a filtered list of tasks that the authenticated user has access to as a PDF document.
     *
     * @queryParam status string Filter by task status. Example: In-Progress
     * @queryParam priority string Filter by priority level. Example: High
     * @queryParam project_id string Filter by project UUID. Example: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
     * @queryParam search string Search in task name and description. Example: bug fix
     */
    public function pdf(Request $request): Response
    {
        $tasks = $this->getFilteredTasks($request);
        $user = $request->user();
        $context = $request->input('context', 'global');

        $pdf = Pdf::loadView('exports.tasks-pdf', [
            'tasks' => $tasks,
            'user' => $user,
            'generatedAt' => now(),
            'filters' => $request->only(['status', 'priority', 'project_id', 'search']),
        ]);

        $filename = "{$context}-tasks-export-".now()->format('Y-m-d-His').'.pdf';

        return $pdf->download($filename);
    }

    /**
     * Get filtered tasks based on request parameters and context.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, Task>
     */
    private function getFilteredTasks(Request $request)
    {
        $user = $request->user();
        $context = $request->input('context', 'global');
        $contextId = $request->input('context_id');

        $query = Task::query()->with(['project.team', 'assignee', 'creator']);

        // Apply context-based filters
        match ($context) {
            'user' => $query->where('assigned_to', $user->id),
            'team' => $query->whereHas('project', fn ($q) => $q->where('team_id', $contextId)),
            'project' => $query->where('project_id', $contextId),
            default => $query->whereHas('project', fn ($q) => $q->whereHas('members', fn ($m) => $m->where('user_id', $user->id))),
        };

        // Only include tasks from projects user is a member of (for security)
        if ($context !== 'user') {
            $query->whereHas('project', function ($q) use ($user) {
                $q->whereHas('members', fn ($m) => $m->where('user_id', $user->id));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('updated_at', 'desc')->get();
    }
}
