<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskComment\StoreTaskCommentRequest;
use App\Http\Resources\TaskCommentResource;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * @group Task Comments
 *
 * APIs for managing comments on tasks. Comments support threading via reply_to.
 */
class TaskCommentController extends Controller
{
    public function store(StoreTaskCommentRequest $request, ?Task $task = null): JsonResponse|RedirectResponse
    {
        $taskId = $task?->id ?? $request->validated('task_id');

        $comment = TaskComment::create([
            'task_id' => $taskId,
            'comment' => $request->validated('comment') ?? $request->validated('content'),
            'reply_to' => $request->validated('reply_to'),
            'created_by' => $request->user()->id,
        ]);

        $comment->load('creator');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'comment' => new TaskCommentResource($comment),
            ], 201);
        }

        return back()->with('success', 'Comment added successfully.');
    }

    public function update(Request $request, TaskComment $comment): JsonResponse|RedirectResponse
    {
        if ($comment->created_by !== $request->user()->id) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'You can only edit your own comments.'], 403);
            }

            return back()->with('error', 'You can only edit your own comments.');
        }

        $request->validate([
            'comment' => ['required', 'string', 'max:5000'],
        ]);

        $comment->update([
            'comment' => $request->input('comment'),
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'comment' => new TaskCommentResource($comment),
            ]);
        }

        return back()->with('success', 'Comment updated successfully.');
    }

    public function destroy(Request $request, TaskComment $comment): JsonResponse|RedirectResponse
    {
        if ($comment->created_by !== $request->user()->id) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'You can only delete your own comments.'], 403);
            }

            return back()->with('error', 'You can only delete your own comments.');
        }

        $comment->delete();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Comment deleted successfully.');
    }
}
