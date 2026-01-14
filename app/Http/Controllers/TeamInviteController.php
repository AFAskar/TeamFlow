<?php

namespace App\Http\Controllers;

use App\Enums\InviteStatus;
use App\Enums\TeamRole;
use App\Http\Requests\TeamInvite\StoreTeamInviteRequest;
use App\Http\Resources\TeamInviteResource;
use App\Models\AuditLog;
use App\Models\TeamInvite;
use App\Models\UserTeam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class TeamInviteController extends Controller
{
    public function index(Request $request, string $teamId): Response
    {
        $invites = TeamInvite::where('team_id', $teamId)
            ->with(['team', 'creator'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('team-invites/index', [
            'invites' => TeamInviteResource::collection($invites),
            'teamId' => $teamId,
        ]);
    }

    public function store(StoreTeamInviteRequest $request): RedirectResponse
    {
        $expiryDays = $request->validated('expiry_days') ?? 7;

        $invite = TeamInvite::create([
            'team_id' => $request->validated('team_id'),
            'invitee_email' => $request->validated('invitee_email'),
            'status' => InviteStatus::PENDING,
            'usage_limit' => $request->validated('usage_limit') ?? 1,
            'used_count' => 0,
            'expiry' => now()->addDays($expiryDays),
            'created_by' => $request->user()->id,
        ]);

        if ($request->validated('invitee_email')) {
            // TODO: Send invitation email
            // Mail::to($request->validated('invitee_email'))
            //     ->queue(new TeamInviteMail($invite));
        }

        return back()->with('success', 'Invitation created successfully.');
    }

    public function accept(Request $request, TeamInvite $invite): RedirectResponse
    {
        if ($invite->status !== InviteStatus::PENDING) {
            return redirect()->route('dashboard')->with('error', 'This invitation is no longer valid.');
        }

        if ($invite->expiry && $invite->expiry->isPast()) {
            $invite->update(['status' => InviteStatus::EXPIRED]);

            return redirect()->route('dashboard')->with('error', 'This invitation has expired.');
        }

        if ($invite->usage_limit && $invite->used_count >= $invite->usage_limit) {
            return redirect()->route('dashboard')->with('error', 'This invitation has reached its usage limit.');
        }

        if ($invite->invitee_email && $invite->invitee_email !== $request->user()->email) {
            return redirect()->route('dashboard')->with('error', 'This invitation was sent to a different email address.');
        }

        $alreadyMember = UserTeam::where('user_id', $request->user()->id)
            ->where('team_id', $invite->team_id)
            ->exists();

        if ($alreadyMember) {
            return redirect()
                ->route('teams.show', $invite->team_id)
                ->with('info', 'You are already a member of this team.');
        }

        UserTeam::create([
            'user_id' => $request->user()->id,
            'team_id' => $invite->team_id,
            'team_role' => TeamRole::Member,
        ]);

        $invite->increment('used_count');

        if ($invite->usage_limit && $invite->used_count >= $invite->usage_limit) {
            $invite->update(['status' => InviteStatus::ACCEPTED]);
        }

        AuditLog::create([
            'action' => 'joined_team',
            'entity_type' => 'Team',
            'entity_id' => $invite->team_id,
            'old_values' => null,
            'new_values' => ['user_id' => $request->user()->id, 'invite_id' => $invite->id],
            'done_by' => $request->user()->id,
            'done_at' => now(),
        ]);

        return redirect()
            ->route('teams.show', $invite->team_id)
            ->with('success', 'You have joined the team successfully.');
    }

    public function decline(Request $request, TeamInvite $invite): RedirectResponse
    {
        if ($invite->invitee_email && $invite->invitee_email !== $request->user()->email) {
            return redirect()->route('dashboard')->with('error', 'This invitation was sent to a different email address.');
        }

        $invite->update(['status' => InviteStatus::DECLINED]);

        return redirect()->route('dashboard')->with('success', 'Invitation declined.');
    }

    public function revoke(Request $request, TeamInvite $invite): RedirectResponse
    {
        $user = $request->user();
        $isAdminOrOwner = $user->teams()
            ->where('teams.id', $invite->team_id)
            ->whereIn('team_role', [TeamRole::Owner->value, TeamRole::Admin->value])
            ->exists();

        if (! $isAdminOrOwner) {
            return back()->with('error', 'You do not have permission to revoke this invitation.');
        }

        $invite->update(['status' => InviteStatus::REVOKED]);

        return back()->with('success', 'Invitation revoked successfully.');
    }

    public function show(TeamInvite $invite): Response
    {
        $invite->load('team');

        return Inertia::render('team-invites/show', [
            'invite' => new TeamInviteResource($invite),
        ]);
    }
}
