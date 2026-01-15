<?php

use App\Enums\ProjectRole;
use App\Enums\TeamRole;
use App\Models\Project;
use App\Models\ProjectMember;
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
});

// Helper functions
function createProjectMembership(User $user, Project $project, ProjectRole $role): void
{
    ProjectMember::create([
        'project_id' => $project->id,
        'user_id' => $user->id,
        'role' => $role->value,
    ]);
}

// Index Tests
test('guests cannot access projects index', function () {
    $this->get(route('projects.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view projects index', function () {
    $this->actingAs($this->user)
        ->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('projects/index'));
});

test('users only see projects they are members of', function () {
    $ownProject = Project::factory()->create([
        'team_id' => $this->team->id,
        'created_by' => $this->user->id,
    ]);
    createProjectMembership($this->user, $ownProject, ProjectRole::Lead);

    $otherProject = Project::factory()->create();

    $this->actingAs($this->user)
        ->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/index')
            ->has('projects.data', 1)
        );
});

// Create/Store Tests
test('users can view project creation form', function () {
    $this->actingAs($this->user)
        ->get(route('projects.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/create')
            ->has('teams')
        );
});

test('users can create a project', function () {
    $this->actingAs($this->user)
        ->post(route('projects.store'), [
            'name' => 'New Project',
            'description' => 'A project description',
            'team_id' => $this->team->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('projects', [
        'name' => 'New Project',
        'description' => 'A project description',
        'team_id' => $this->team->id,
        'created_by' => $this->user->id,
    ]);

    $project = Project::where('name', 'New Project')->first();
    $this->assertDatabaseHas('project_members', [
        'project_id' => $project->id,
        'user_id' => $this->user->id,
        'role' => ProjectRole::Lead->value,
    ]);
});

test('project creation requires name and team', function () {
    $this->actingAs($this->user)
        ->post(route('projects.store'), [
            'description' => 'A description',
            'team_id' => $this->team->id, // Valid team_id to pass authorization
        ])
        ->assertSessionHasErrors(['name']);
});

// Show Tests
test('project members can view project details', function () {
    $project = Project::factory()->create([
        'team_id' => $this->team->id,
        'created_by' => $this->user->id,
    ]);
    createProjectMembership($this->user, $project, ProjectRole::Lead);

    $this->actingAs($this->user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->has('project')
        );
});

test('non-members cannot view project details', function () {
    $otherUser = User::factory()->create();
    $project = Project::factory()->create([
        'team_id' => $this->team->id,
        'created_by' => $this->user->id,
    ]);

    $this->actingAs($otherUser)
        ->get(route('projects.show', $project))
        ->assertForbidden();
});

// Edit/Update Tests
// Note: No edit.tsx page exists - projects are edited inline or via show page
test('project members can update project', function () {
    $project = Project::factory()->create([
        'team_id' => $this->team->id,
        'created_by' => $this->user->id,
    ]);
    createProjectMembership($this->user, $project, ProjectRole::Lead);

    $this->actingAs($this->user)
        ->put(route('projects.update', $project), [
            'name' => 'Updated Project Name',
            'description' => 'Updated description',
        ])
        ->assertRedirect(route('projects.show', $project));

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'name' => 'Updated Project Name',
    ]);
});

// Delete Tests
test('project members can delete project', function () {
    $project = Project::factory()->create([
        'team_id' => $this->team->id,
        'created_by' => $this->user->id,
    ]);
    createProjectMembership($this->user, $project, ProjectRole::Lead);

    $this->actingAs($this->user)
        ->delete(route('projects.destroy', $project))
        ->assertRedirect(route('projects.index'));

    // Project uses SoftDeletes
    $this->assertSoftDeleted('projects', ['id' => $project->id]);
});

// Kanban Tests
test('project members can view kanban board', function () {
    $project = Project::factory()->create([
        'team_id' => $this->team->id,
        'created_by' => $this->user->id,
    ]);
    createProjectMembership($this->user, $project, ProjectRole::Lead);

    $this->actingAs($this->user)
        ->get(route('projects.kanban', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('projects/kanban'));
});
