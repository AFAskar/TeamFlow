<?php

namespace App\Http\Controllers;

use App\Http\Requests\Label\StoreLabelRequest;
use App\Http\Requests\Label\UpdateLabelRequest;
use App\Http\Resources\LabelResource;
use App\Models\Label;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @group Labels
 *
 * APIs for managing labels. Labels are team-scoped and can be applied to tasks for categorization.
 */
class LabelController extends Controller
{
    public function index(Request $request, string $teamId): Response
    {
        $labels = Label::where('team_id', $teamId)
            ->with('creator')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('labels/index', [
            'labels' => LabelResource::collection($labels),
            'teamId' => $teamId,
        ]);
    }

    public function store(StoreLabelRequest $request): JsonResponse|RedirectResponse
    {
        $label = Label::create([
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'team_id' => $request->validated('team_id'),
            'created_by' => $request->user()->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'label' => new LabelResource($label),
            ], 201);
        }

        return back()->with('success', 'Label created successfully.');
    }

    public function update(UpdateLabelRequest $request, Label $label): JsonResponse|RedirectResponse
    {
        $label->update($request->validated());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'label' => new LabelResource($label),
            ]);
        }

        return back()->with('success', 'Label updated successfully.');
    }

    public function destroy(Request $request, Label $label): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $isMember = $user->teams()->where('teams.id', $label->team_id)->exists();

        if (! $isMember) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            return back()->with('error', 'Unauthorized');
        }

        $label->delete();

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Label deleted successfully.');
    }
}
