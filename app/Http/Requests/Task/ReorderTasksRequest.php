<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class ReorderTasksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'tasks' => ['required', 'array', 'min:1'],
            'tasks.*.id' => ['required', 'uuid', 'exists:tasks,id'],
            'tasks.*.position' => ['required', 'integer', 'min:0'],
            'tasks.*.status' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tasks.required' => 'Tasks list is required.',
            'tasks.array' => 'Tasks must be an array.',
            'tasks.*.id.required' => 'Task ID is required.',
            'tasks.*.id.exists' => 'One or more tasks do not exist.',
            'tasks.*.position.required' => 'Task position is required.',
        ];
    }
}
