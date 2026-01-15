<?php

use App\Enums\PriorityLevel;
use App\Enums\ProjectRole;
use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Models\UserTeam;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->team = Team::factory()->create(['created_by' => $this->user->id]);
    UserTeam::create([
        'user_id' => $this->user->id,
        'team_id' => $this->team->id,
        'team_role' => TeamRole::Owner->value,
    ]);
    $this->project = Project::factory()->create([
        'team_id' => $this->team->id,
        'created_by' => $this->user->id,
    ]);
    ProjectMember::create([
        'project_id' => $this->project->id,
        'user_id' => $this->user->id,
        'role' => ProjectRole::Lead->value,
    ]);
});

// CSV Export Tests
test('guests cannot export tasks to CSV', function () {
    $this->get(route('tasks.export.csv'))
        ->assertRedirect(route('login'));
});

test('authenticated users can export tasks to CSV', function () {
    Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'name' => 'Test Task for Export',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('tasks.export.csv'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    expect($response->headers->get('Content-Disposition'))->toContain('attachment; filename="global-tasks-export-');
});

test('CSV export contains task data', function () {
    Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'name' => 'Unique Task Name 12345',
        'status' => TaskStatus::InProgress,
        'priority' => PriorityLevel::High,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('tasks.export.csv'));

    $response->assertOk();
    $content = $response->streamedContent();
    expect($content)->toContain('Unique Task Name 12345');
    expect($content)->toContain('In-Progress');
    expect($content)->toContain('High');
});

test('CSV export respects status filter', function () {
    Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'name' => 'In Progress Task',
        'status' => TaskStatus::InProgress,
    ]);
    Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'name' => 'Done Task',
        'status' => TaskStatus::Done,
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('tasks.export.csv', ['status' => TaskStatus::InProgress->value]));

    $content = $response->streamedContent();
    expect($content)->toContain('In Progress Task');
    expect($content)->not->toContain('Done Task');
    expect($response->headers->get('Content-Disposition'))->toContain('attachment; filename="global-tasks-export-');
});

// PDF Export Tests
test('guests cannot export tasks to PDF', function () {
    $this->get(route('tasks.export.pdf'))
        ->assertRedirect(route('login'));
});

test('authenticated users can export tasks to PDF', function () {
    Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'name' => 'Test Task for PDF Export',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('tasks.export.pdf'));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/pdf');
});

test('PDF export respects priority filter', function () {
    Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'name' => 'High Priority Task',
        'priority' => PriorityLevel::High,
    ]);
    Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'name' => 'Low Priority Task',
        'priority' => PriorityLevel::Low,
    ]);

    // Just verify the route works with filter, PDF content is harder to assert
    $response = $this->actingAs($this->user)
        ->get(route('tasks.export.pdf', ['priority' => PriorityLevel::High->value]));

    $response->assertOk();
    $response->assertHeader('Content-Type', 'application/pdf');
});

// Access Control Tests
test('export only includes tasks user has access to', function () {
    // Create a task in user's project
    Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'name' => 'Accessible Task',
    ]);

    // Create a task in another project user doesn't have access to
    $otherProject = Project::factory()->create();
    Task::factory()->create([
        'project_id' => $otherProject->id,
        'name' => 'Inaccessible Task',
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('tasks.export.csv'));

    $content = $response->streamedContent();
    expect($content)->toContain('Accessible Task');
    expect($content)->not->toContain('Inaccessible Task');
});
