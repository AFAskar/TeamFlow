<?php

namespace App\Http\Controllers;

use App\Enums\TeamRole;
use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Models\AuditLog;
use App\Models\Team;
use App\Models\UserTeam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request): Response
    {
        $teams = $request->user()
            ->teams()
            ->withCount(['members', 'projects'])
            ->with('creator')
            ->orderBy('name')
            ->paginate(12);

        return Inertia::render('teams/index', [
            'teams' => TeamResource::collection($teams),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('teams/create');
    }

    public function store(StoreTeamRequest $request): RedirectResponse
    {
        $team = Team::create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'created_by' => $request->user()->id,
        ]);

        UserTeam::create([
            'user_id' => $request->user()->id,
            'team_id' => $team->id,
            'team_role' => TeamRole::Owner,
        ]);

        AuditLog::create([
            'action' => 'created',
            'entity_type' => 'Team',
            'entity_id' => $team->id,
            'old_values' => null,
            'new_values' => $team->toArray(),
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return redirect()
            ->route('teams.show', $team)
            ->with('success', 'Team created successfully.');
    }

    public function show(Team $team): Response
    {
        $this->authorizeTeamAccess($team);

        $team->load(['creator', 'members', 'projects.creator'])
            ->loadCount(['members', 'projects']);

        return Inertia::render('teams/show', [
            'team' => new TeamResource($team),
        ]);
    }

    public function edit(Team $team): Response
    {
        $this->authorizeTeamAccess($team, [TeamRole::Owner, TeamRole::Admin]);

        return Inertia::render('teams/edit', [
            'team' => new TeamResource($team),
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team): RedirectResponse
    {
        $oldValues = $team->toArray();

        $team->update($request->validated());

        AuditLog::create([
            'action' => 'updated',
            'entity_type' => 'Team',
            'entity_id' => $team->id,
            'old_values' => $oldValues,
            'new_values' => $team->fresh()->toArray(),
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return redirect()
            ->route('teams.show', $team)
            ->with('success', 'Team updated successfully.');
    }

    public function destroy(Request $request, Team $team): RedirectResponse
    {
        $this->authorizeTeamAccess($team, [TeamRole::Owner]);

        AuditLog::create([
            'action' => 'deleted',
            'entity_type' => 'Team',
            'entity_id' => $team->id,
            'old_values' => $team->toArray(),
            'new_values' => null,
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        $team->delete();

        return redirect()
            ->route('teams.index')
            ->with('success', 'Team deleted successfully.');
    }

    public function leave(Request $request, Team $team): RedirectResponse
    {
        $userTeam = UserTeam::where('user_id', $request->user()->id)
            ->where('team_id', $team->id)
            ->first();

        if (! $userTeam) {
            return back()->with('error', 'You are not a member of this team.');
        }

        if ($userTeam->team_role === TeamRole::Owner->value) {
            return back()->with('error', 'Team owner cannot leave the team. Transfer ownership first.');
        }

        $userTeam->delete();

        return redirect()
            ->route('teams.index')
            ->with('success', 'You have left the team.');
    }

    public function transferOwnership(Request $request, Team $team): RedirectResponse
    {
        $this->authorizeTeamAccess($team, [TeamRole::Owner]);

        $request->validate([
            'new_owner_id' => ['required', 'uuid', 'exists:users,id'],
        ]);

        $newOwnerId = $request->input('new_owner_id');

        $newOwnerMembership = UserTeam::where('team_id', $team->id)
            ->where('user_id', $newOwnerId)
            ->first();

        if (! $newOwnerMembership) {
            return back()->with('error', 'The selected user is not a member of this team.');
        }

        UserTeam::where('team_id', $team->id)
            ->where('user_id', $request->user()->id)
            ->update(['team_role' => TeamRole::Admin]);

        $newOwnerMembership->update(['team_role' => TeamRole::Owner]);

        $team->update(['created_by' => $newOwnerId]);

        AuditLog::create([
            'action' => 'ownership_transferred',
            'entity_type' => 'Team',
            'entity_id' => $team->id,
            'old_values' => ['owner' => $request->user()->id],
            'new_values' => ['owner' => $newOwnerId],
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return back()->with('success', 'Ownership transferred successfully.');
    }

    public function updateMemberRole(Request $request, Team $team): RedirectResponse
    {
        $this->authorizeTeamAccess($team, [TeamRole::Owner, TeamRole::Admin]);

        $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'role' => ['required', 'string', 'in:Admin,Member'],
        ]);

        $membership = UserTeam::where('team_id', $team->id)
            ->where('user_id', $request->input('user_id'))
            ->first();

        if (! $membership) {
            return back()->with('error', 'User is not a member of this team.');
        }

        if ($membership->team_role === TeamRole::Owner->value) {
            return back()->with('error', 'Cannot change the role of the team owner.');
        }

        $membership->update(['team_role' => $request->input('role')]);

        return back()->with('success', 'Member role updated successfully.');
    }

    public function removeMember(Request $request, Team $team): RedirectResponse
    {
        $this->authorizeTeamAccess($team, [TeamRole::Owner, TeamRole::Admin]);

        $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
        ]);

        $membership = UserTeam::where('team_id', $team->id)
            ->where('user_id', $request->input('user_id'))
            ->first();

        if (! $membership) {
            return back()->with('error', 'User is not a member of this team.');
        }

        if ($membership->team_role === TeamRole::Owner->value) {
            return back()->with('error', 'Cannot remove the team owner.');
        }

        $membership->delete();

        return back()->with('success', 'Member removed successfully.');
    }

    /**
     * @param  array<TeamRole>  $allowedRoles
     */
    private function authorizeTeamAccess(Team $team, array $allowedRoles = []): void
    {
        $user = request()->user();
        $membership = UserTeam::where('user_id', $user->id)
            ->where('team_id', $team->id)
            ->first();

        if (! $membership) {
            abort(403, 'You are not a member of this team.');
        }

        if (! empty($allowedRoles)) {
            $hasAllowedRole = false;
            foreach ($allowedRoles as $role) {
                if ($membership->team_role === $role->value) {
                    $hasAllowedRole = true;
                    break;
                }
            }

            if (! $hasAllowedRole) {
                abort(403, 'You do not have permission to perform this action.');
            }
        }
    }
}
