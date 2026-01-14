<?php

namespace App\Http\Requests\Task;

use App\Enums\PriorityLevel;
use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        $projectId = $this->input('project_id');
        $user = $this->user();

        return $user->projects()->where('projects.id', $projectId)->exists();
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'project_id' => ['required', 'uuid', 'exists:projects,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', Rule::enum(TaskStatus::class)],
            'priority' => ['nullable', Rule::enum(PriorityLevel::class)],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
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
            'project_id.required' => 'Please select a project for this task.',
            'project_id.exists' => 'The selected project does not exist.',
            'due_date.after_or_equal' => 'Due date must be today or a future date.',
            'assigned_to.exists' => 'The selected assignee does not exist.',
            'parent_id.exists' => 'The selected parent task does not exist.',
        ];
    }
}
