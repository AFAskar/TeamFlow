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

// Index Tests
test('guests cannot access tasks index', function () {
    $this->get(route('tasks.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view tasks index', function () {
    $this->actingAs($this->user)
        ->get(route('tasks.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('tasks/index'));
});

test('users only see tasks from projects they are members of', function () {
    $ownTask = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
    ]);

    $otherProject = Project::factory()->create();
    $otherTask = Task::factory()->create(['project_id' => $otherProject->id]);

    $this->actingAs($this->user)
        ->get(route('tasks.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('tasks/index')
            ->has('tasks.data', 1)
        );
});

test('tasks can be filtered by status', function () {
    Task::factory()->create([
        'project_id' => $this->project->id,
        'status' => TaskStatus::InProgress,
        'created_by' => $this->user->id,
    ]);
    Task::factory()->create([
        'project_id' => $this->project->id,
        'status' => TaskStatus::Done,
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('tasks.index', ['status' => TaskStatus::InProgress->value]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('tasks.data', 1)
        );
});

// Create/Store Tests
test('users can view task creation form', function () {
    $this->actingAs($this->user)
        ->get(route('tasks.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('tasks/create')
            ->has('projects')
        );
});

test('users can create a task', function () {
    $this->actingAs($this->user)
        ->post(route('tasks.store'), [
            'name' => 'New Task',
            'description' => 'A task description',
            'project_id' => $this->project->id,
            'priority' => PriorityLevel::Medium->value,
        ])
        ->assertRedirect(route('projects.show', $this->project));

    $this->assertDatabaseHas('tasks', [
        'name' => 'New Task',
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
    ]);

    $this->assertDatabaseHas('audit_log', [
        'action' => 'created',
        'entity_type' => 'Task',
    ]);
});

test('task creation requires name and project', function () {
    $this->actingAs($this->user)
        ->post(route('tasks.store'), [
            'description' => 'A description',
            'project_id' => $this->project->id, // Valid project_id to pass authorization
        ])
        ->assertSessionHasErrors(['name']);
});

// Show Tests
test('project members can view task details', function () {
    $task = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('tasks.show', $task))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('tasks/show')
            ->has('task')
        );
});

test('non-members cannot view task details', function () {
    $otherUser = User::factory()->create();
    $task = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($otherUser)
        ->get(route('tasks.show', $task))
        ->assertForbidden();
});

// Update Tests
test('project members can update task', function () {
    $task = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->put(route('tasks.update', $task), [
            'name' => 'Updated Task Name',
            'priority' => PriorityLevel::High->value,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('tasks', [
        'id' => $task->id,
        'name' => 'Updated Task Name',
        'priority' => PriorityLevel::High->value,
    ]);
});

test('task update creates audit log', function () {
    $task = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->put(route('tasks.update', $task), [
            'name' => 'Updated Task Name',
        ]);

    $this->assertDatabaseHas('audit_log', [
        'action' => 'updated',
        'entity_type' => 'Task',
        'entity_id' => $task->id,
    ]);
});

// Update Status Tests
test('project members can update task status', function () {
    $task = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'status' => TaskStatus::Unplanned,
    ]);

    $this->actingAs($this->user)
        ->patch(route('tasks.update-status', $task), [
            'status' => TaskStatus::InProgress->value,
        ])
        ->assertOk()
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('tasks', [
        'id' => $task->id,
        'status' => TaskStatus::InProgress->value,
    ]);
});

// Reorder Tests
test('project members can reorder tasks', function () {
    $task1 = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'position' => 0,
        'status' => TaskStatus::Unplanned,
    ]);
    $task2 = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'position' => 1,
        'status' => TaskStatus::Unplanned,
    ]);

    $this->actingAs($this->user)
        ->post(route('tasks.reorder'), [
            'tasks' => [
                ['id' => $task1->id, 'position' => 1, 'status' => TaskStatus::Unplanned->value],
                ['id' => $task2->id, 'position' => 0, 'status' => TaskStatus::Unplanned->value],
            ],
        ])
        ->assertOk()
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('tasks', [
        'id' => $task1->id,
        'position' => 1,
    ]);
    $this->assertDatabaseHas('tasks', [
        'id' => $task2->id,
        'position' => 0,
    ]);
});

// Delete Tests
test('project members can delete task', function () {
    $task = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->delete(route('tasks.destroy', $task))
        ->assertRedirect(route('projects.show', $this->project));

    // Task uses SoftDeletes
    $this->assertSoftDeleted('tasks', ['id' => $task->id]);

    $this->assertDatabaseHas('audit_log', [
        'action' => 'deleted',
        'entity_type' => 'Task',
        'entity_id' => $task->id,
    ]);
});

// My Tasks Tests
test('users can view their assigned tasks', function () {
    $assignedTask = Task::factory()->create([
        'project_id' => $this->project->id,
        'assigned_to' => $this->user->id,
        'created_by' => $this->user->id,
    ]);
    $unassignedTask = Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('tasks.my-tasks'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('tasks/my-tasks')
            ->has('tasks.data', 1)
        );
});
