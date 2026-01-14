<?php

namespace App\Http\Requests\TeamInvite;

use App\Enums\TeamRole;
use Illuminate\Foundation\Http\FormRequest;

class StoreTeamInviteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $teamId = $this->input('team_id');
        $user = $this->user();

        return $user->teams()
            ->where('teams.id', $teamId)
            ->whereIn('team_role', [TeamRole::Owner->value, TeamRole::Admin->value])
            ->exists();
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'team_id' => ['required', 'uuid', 'exists:teams,id'],
            'invitee_email' => ['nullable', 'email', 'max:255'],
            'usage_limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'expiry_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'team_id.required' => 'Team is required.',
            'team_id.exists' => 'The selected team does not exist.',
            'invitee_email.email' => 'Please enter a valid email address.',
            'usage_limit.min' => 'Usage limit must be at least 1.',
            'usage_limit.max' => 'Usage limit cannot exceed 100.',
            'expiry_days.min' => 'Expiry must be at least 1 day.',
            'expiry_days.max' => 'Expiry cannot exceed 365 days.',
        ];
    }
}
