<?php

namespace App\Http\Requests\Task;

use App\Enums\PriorityLevel;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        $task = $this->route('task');
        $user = $this->user();

        return $user->projects()->where('projects.id', $task->project_id)->exists();
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', Rule::enum(TaskStatus::class)],
            'priority' => ['nullable', Rule::enum(PriorityLevel::class)],
            'due_date' => ['nullable', 'date'],
            'assigned_to' => ['nullable', 'uuid', 'exists:users,id'],
            'parent_id' => ['nullable', 'uuid', 'exists:tasks,id'],
            'labels' => ['nullable', 'array'],
            'labels.*' => ['uuid', 'exists:labels,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Task name is required.',
            'name.max' => 'Task name cannot exceed 255 characters.',
            'assigned_to.exists' => 'The selected assignee does not exist.',
            'parent_id.exists' => 'The selected parent task does not exist.',
        ];
    }
}
