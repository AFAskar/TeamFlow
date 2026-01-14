<?php

namespace App\Http\Requests\TaskComment;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $taskId = $this->route('task')?->id ?? $this->input('task_id');
        $user = $this->user();
        $task = $taskId instanceof Task ? $taskId : Task::find($taskId);

        if (! $task) {
            return false;
        }

        return $user->projects()->where('projects.id', $task->project_id)->exists();
    }

    /**
     * @return array<string, array<string>>
     */
    public function rules(): array
    {
        return [
            'task_id' => ['required_without:task', 'nullable', 'uuid', 'exists:tasks,id'],
            'comment' => ['required_without:content', 'nullable', 'string', 'max:5000'],
            'content' => ['required_without:comment', 'nullable', 'string', 'max:5000'],
            'reply_to' => ['nullable', 'uuid', 'exists:task_comments,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'task_id.exists' => 'The selected task does not exist.',
            'comment.max' => 'Comment cannot exceed 5000 characters.',
            'content.max' => 'Comment cannot exceed 5000 characters.',
            'reply_to.exists' => 'The parent comment does not exist.',
        ];
    }
}
