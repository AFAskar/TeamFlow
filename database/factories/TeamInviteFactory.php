<?php

namespace Database\Factories;

use App\Enums\InviteStatus;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TeamInvite>
 */
class TeamInviteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'invitee_email' => fake()->optional()->safeEmail(),
            'expiry' => fake()->dateTimeBetween('now', '+7 days'),
            'status' => fake()->randomElement(InviteStatus::cases()),
            'usage_limit' => fake()->numberBetween(1, 10),
            'used_count' => 0,
            'created_by' => User::factory(),
        ];
    }
}
