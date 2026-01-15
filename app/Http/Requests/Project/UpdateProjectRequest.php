<?php

namespace App\Http\Requests\Project;

use App\Enums\ProjectRole;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');
        $user = $this->user();

        return $project->members()
            ->where('project_members.user_id', $user->id)
            ->whereIn('project_members.role', [ProjectRole::Lead->value, ProjectRole::TechnicalLead->value])
            ->exists()
            || $project->created_by === $user->id;
    }

    /**
     * @return array<string, array<string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Project name is required.',
            'name.max' => 'Project name cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 2000 characters.',
        ];
    }
}
