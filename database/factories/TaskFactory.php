<?php

namespace Database\Factories;

use App\Enums\PriorityLevel;
use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(),
            'project_id' => Project::factory(),
            'description' => fake()->optional()->paragraph(),
            'status' => fake()->randomElement(TaskStatus::cases()),
            'priority' => fake()->randomElement(PriorityLevel::cases()),
            'due_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'position' => fake()->numberBetween(0, 100),
            'parent_id' => null,
            'created_by' => User::factory(),
            'assigned_to' => fake()->boolean(70) ? User::factory() : null,
        ];
    }

    public function withParent(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => Task::factory(),
        ]);
    }
}
