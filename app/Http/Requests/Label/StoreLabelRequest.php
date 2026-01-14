<?php

namespace App\Http\Requests\Label;

use Illuminate\Foundation\Http\FormRequest;

class StoreLabelRequest extends FormRequest
{
    public function authorize(): bool
    {
        $teamId = $this->input('team_id');
        $user = $this->user();

        return $user->teams()->where('teams.id', $teamId)->exists();
    }

    /**
     * @return array<string, array<string>>
     */
    public function rules(): array
    {
        return [
            'team_id' => ['required', 'uuid', 'exists:teams,id'],
            'name' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'team_id.required' => 'Please select a team for this label.',
            'team_id.exists' => 'The selected team does not exist.',
            'name.required' => 'Label name is required.',
            'name.max' => 'Label name cannot exceed 50 characters.',
            'description.max' => 'Description cannot exceed 255 characters.',
        ];
    }
}
