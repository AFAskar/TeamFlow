<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskAttachment\StoreTaskAttachmentRequest;
use App\Http\Resources\TaskAttachmentResource;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * @group Task Attachments
 *
 * APIs for managing file attachments on tasks. Supports images and documents.
 */
class TaskAttachmentController extends Controller
{
    /**
     * Upload attachments to a task.
     *
     * Upload one or more files to attach to a task.
     */
    public function store(StoreTaskAttachmentRequest $request): JsonResponse|RedirectResponse
    {
        $task = Task::findOrFail($request->validated('task_id'));

        // Verify user has access to the task's project
        $hasAccess = $task->project->members()
            ->where('user_id', $request->user()->id)
            ->exists();

        if (! $hasAccess) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'You do not have access to this task.'], 403);
            }

            return back()->with('error', 'You do not have access to this task.');
        }

        $attachments = [];

        foreach ($request->file('files') as $file) {
            $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs(
                'attachments/'.$task->id,
                $filename,
                'public'
            );

            $attachment = TaskAttachment::create([
                'user_id' => $request->user()->id,
                'task_id' => $task->id,
                's3_uri' => $path,
                'filename' => $filename,
                'original_filename' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'disk' => 'public',
            ]);

            $attachment->load('user');
            $attachments[] = $attachment;
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => count($attachments).' file(s) uploaded successfully.',
                'attachments' => TaskAttachmentResource::collection($attachments),
            ], 201);
        }

        return back()->with('success', count($attachments).' file(s) uploaded successfully.');
    }

    /**
     * Download an attachment.
     */
    public function download(Request $request, TaskAttachment $attachment): mixed
    {
        // Verify user has access to the task's project
        $hasAccess = $attachment->task->project->members()
            ->where('user_id', $request->user()->id)
            ->exists();

        if (! $hasAccess) {
            abort(403, 'You do not have access to this attachment.');
        }

        return Storage::disk($attachment->disk)->download(
            $attachment->s3_uri,
            $attachment->original_filename
        );
    }

    /**
     * Delete an attachment.
     */
    public function destroy(Request $request, TaskAttachment $attachment): JsonResponse|RedirectResponse
    {
        // Verify user has access - either they uploaded it or are a project member
        $isUploader = $attachment->user_id === $request->user()->id;
        $hasAccess = $attachment->task->project->members()
            ->where('user_id', $request->user()->id)
            ->exists();

        if (! $isUploader && ! $hasAccess) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'You do not have permission to delete this attachment.'], 403);
            }

            return back()->with('error', 'You do not have permission to delete this attachment.');
        }

        // Delete the file from storage
        Storage::disk($attachment->disk)->delete($attachment->s3_uri);

        // Delete the database record
        $attachment->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Attachment deleted successfully.',
            ]);
        }

        return back()->with('success', 'Attachment deleted successfully.');
    }
}
