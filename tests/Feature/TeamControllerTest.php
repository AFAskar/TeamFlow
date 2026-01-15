<?php

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use App\Models\UserTeam;

beforeEach(function () {
    $this->user = User::factory()->create();
});

// Helper to create team membership
function createMembership(User $user, Team $team, TeamRole $role): void
{
    UserTeam::create([
        'user_id' => $user->id,
        'team_id' => $team->id,
        'team_role' => $role->value,
    ]);
}

// Index Tests
test('guests cannot access teams index', function () {
    $this->get(route('teams.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view teams index', function () {
    $this->actingAs($this->user)
        ->get(route('teams.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('teams/index'));
});

test('users only see teams they belong to', function () {
    $ownTeam = Team::factory()->create(['created_by' => $this->user->id]);
    createMembership($this->user, $ownTeam, TeamRole::Owner);

    $otherTeam = Team::factory()->create();

    $this->actingAs($this->user)
        ->get(route('teams.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('teams/index')
            ->has('teams.data', 1)
        );
});

// Create/Store Tests
test('users can view team creation form', function () {
    $this->actingAs($this->user)
        ->get(route('teams.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('teams/create'));
});

test('users can create a team', function () {
    $this->actingAs($this->user)
        ->post(route('teams.store'), [
            'name' => 'My New Team',
            'description' => 'A description for the team',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('teams', [
        'name' => 'My New Team',
        'description' => 'A description for the team',
        'created_by' => $this->user->id,
    ]);

    $team = Team::where('name', 'My New Team')->first();
    $this->assertDatabaseHas('user_teams', [
        'user_id' => $this->user->id,
        'team_id' => $team->id,
        'team_role' => TeamRole::Owner->value,
    ]);
});

test('team creation requires a name', function () {
    $this->actingAs($this->user)
        ->post(route('teams.store'), [
            'description' => 'A description',
        ])
        ->assertSessionHasErrors('name');
});

// Show Tests
test('team members can view team details', function () {
    $team = Team::factory()->create(['created_by' => $this->user->id]);
    createMembership($this->user, $team, TeamRole::Owner);

    $this->actingAs($this->user)
        ->get(route('teams.show', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('teams/show')
            ->has('team')
        );
});

test('non-members cannot view team details', function () {
    $team = Team::factory()->create();

    $this->actingAs($this->user)
        ->get(route('teams.show', $team))
        ->assertForbidden();
});

// Edit/Update Tests
test('team owners can view edit form', function () {
    $team = Team::factory()->create(['created_by' => $this->user->id]);
    createMembership($this->user, $team, TeamRole::Owner);

    $this->actingAs($this->user)
        ->get(route('teams.edit', $team))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('teams/edit'));
});

test('team admins can view edit form', function () {
    $team = Team::factory()->create();
    createMembership($this->user, $team, TeamRole::Admin);

    $this->actingAs($this->user)
        ->get(route('teams.edit', $team))
        ->assertOk();
});

test('regular members cannot view edit form', function () {
    $team = Team::factory()->create();
    createMembership($this->user, $team, TeamRole::Member);

    $this->actingAs($this->user)
        ->get(route('teams.edit', $team))
        ->assertForbidden();
});

test('team owners can update team', function () {
    $team = Team::factory()->create(['created_by' => $this->user->id]);
    createMembership($this->user, $team, TeamRole::Owner);

    $this->actingAs($this->user)
        ->put(route('teams.update', $team), [
            'name' => 'Updated Team Name',
            'description' => 'Updated description',
        ])
        ->assertRedirect(route('teams.show', $team));

    $this->assertDatabaseHas('teams', [
        'id' => $team->id,
        'name' => 'Updated Team Name',
    ]);
});

// Delete Tests
test('team owners can delete team', function () {
    $team = Team::factory()->create(['created_by' => $this->user->id]);
    createMembership($this->user, $team, TeamRole::Owner);

    $this->actingAs($this->user)
        ->delete(route('teams.destroy', $team))
        ->assertRedirect(route('teams.index'));

    // Team uses SoftDeletes, so check it's soft deleted
    $this->assertSoftDeleted('teams', ['id' => $team->id]);
});

test('non-owners cannot delete team', function () {
    $team = Team::factory()->create();
    createMembership($this->user, $team, TeamRole::Admin);

    $this->actingAs($this->user)
        ->delete(route('teams.destroy', $team))
        ->assertForbidden();
});

// Leave Team Tests
test('members can leave a team', function () {
    $team = Team::factory()->create();
    createMembership($this->user, $team, TeamRole::Member);

    $this->actingAs($this->user)
        ->post(route('teams.leave', $team))
        ->assertRedirect(route('teams.index'));

    $this->assertDatabaseMissing('user_teams', [
        'user_id' => $this->user->id,
        'team_id' => $team->id,
        'deleted_at' => null,
    ]);
});

test('owners cannot leave their team', function () {
    $team = Team::factory()->create(['created_by' => $this->user->id]);
    createMembership($this->user, $team, TeamRole::Owner);

    $this->actingAs($this->user)
        ->post(route('teams.leave', $team))
        ->assertRedirect();

    $this->assertDatabaseHas('user_teams', [
        'user_id' => $this->user->id,
        'team_id' => $team->id,
    ]);
});

// Transfer Ownership Tests
test('owners can transfer ownership', function () {
    $team = Team::factory()->create(['created_by' => $this->user->id]);
    $newOwner = User::factory()->create();

    createMembership($this->user, $team, TeamRole::Owner);
    createMembership($newOwner, $team, TeamRole::Member);

    $this->actingAs($this->user)
        ->post(route('teams.transfer-ownership', $team), [
            'new_owner_id' => $newOwner->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('user_teams', [
        'user_id' => $newOwner->id,
        'team_id' => $team->id,
        'team_role' => TeamRole::Owner->value,
    ]);

    $this->assertDatabaseHas('user_teams', [
        'user_id' => $this->user->id,
        'team_id' => $team->id,
        'team_role' => TeamRole::Admin->value,
    ]);
});

// Update Member Role Tests
test('admins can update member roles', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();

    createMembership($this->user, $team, TeamRole::Admin);
    createMembership($member, $team, TeamRole::Member);

    $this->actingAs($this->user)
        ->patch(route('teams.members.update-role', $team), [
            'user_id' => $member->id,
            'role' => 'Admin',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('user_teams', [
        'user_id' => $member->id,
        'team_id' => $team->id,
        'team_role' => 'Admin',
    ]);
});

// Remove Member Tests
test('admins can remove members', function () {
    $team = Team::factory()->create();
    $member = User::factory()->create();

    createMembership($this->user, $team, TeamRole::Admin);
    createMembership($member, $team, TeamRole::Member);

    $this->actingAs($this->user)
        ->delete(route('teams.members.remove', $team), [
            'user_id' => $member->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('user_teams', [
        'user_id' => $member->id,
        'team_id' => $team->id,
        'deleted_at' => null,
    ]);
});

test('cannot remove team owner', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $team = Team::factory()->create(['created_by' => $owner->id]);

    createMembership($owner, $team, TeamRole::Owner);
    createMembership($admin, $team, TeamRole::Admin);

    $this->actingAs($admin)
        ->delete(route('teams.members.remove', $team), [
            'user_id' => $owner->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('user_teams', [
        'user_id' => $owner->id,
        'team_id' => $team->id,
    ]);
});
