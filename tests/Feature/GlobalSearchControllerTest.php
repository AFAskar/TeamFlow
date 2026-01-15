<?php

use App\Enums\ProjectRole;
use App\Enums\TeamRole;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Models\UserTeam;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->team = Team::factory()->create([
        'created_by' => $this->user->id,
        'name' => 'Searchable Team',
    ]);
    UserTeam::create([
        'user_id' => $this->user->id,
        'team_id' => $this->team->id,
        'team_role' => TeamRole::Owner->value,
    ]);
    $this->project = Project::factory()->create([
        'team_id' => $this->team->id,
        'created_by' => $this->user->id,
        'name' => 'Searchable Project',
    ]);
    ProjectMember::create([
        'project_id' => $this->project->id,
        'user_id' => $this->user->id,
        'role' => ProjectRole::Lead->value,
    ]);
});

test('guests cannot access global search', function () {
    $this->getJson(route('search'))
        ->assertUnauthorized();
});

test('authenticated users can search', function () {
    $this->actingAs($this->user)
        ->getJson(route('search', ['q' => 'test']))
        ->assertOk()
        ->assertJsonStructure([
            'results' => [
                'teams',
                'projects',
                'tasks',
            ],
        ]);
});

test('search returns matching teams', function () {
    $this->actingAs($this->user)
        ->getJson(route('search', ['q' => 'Searchable Team']))
        ->assertOk()
        ->assertJsonPath('results.teams.0.name', 'Searchable Team');
});

test('search returns matching projects', function () {
    $this->actingAs($this->user)
        ->getJson(route('search', ['q' => 'Searchable Project']))
        ->assertOk()
        ->assertJsonPath('results.projects.0.name', 'Searchable Project');
});

test('search returns matching tasks', function () {
    Task::factory()->create([
        'project_id' => $this->project->id,
        'created_by' => $this->user->id,
        'name' => 'Searchable Task',
    ]);

    $this->actingAs($this->user)
        ->getJson(route('search', ['q' => 'Searchable Task']))
        ->assertOk()
        ->assertJsonPath('results.tasks.0.name', 'Searchable Task');
});

test('search only returns accessible resources', function () {
    $otherUser = User::factory()->create();
    $otherTeam = Team::factory()->create([
        'created_by' => $otherUser->id,
        'name' => 'Inaccessible Team',
    ]);

    $this->actingAs($this->user)
        ->getJson(route('search', ['q' => 'Inaccessible']))
        ->assertOk()
        ->assertJsonPath('results.teams', []);
});

test('search returns empty for no matches', function () {
    $this->actingAs($this->user)
        ->getJson(route('search', ['q' => 'nonexistentquery123456']))
        ->assertOk()
        ->assertJson([
            'results' => [
                'teams' => [],
                'projects' => [],
                'tasks' => [],
            ],
        ]);
});
