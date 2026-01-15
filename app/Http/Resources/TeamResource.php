<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Team
 */
class TeamResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'creator' => $this->whenLoaded('creator', fn () => (new UserResource($this->creator))->resolve()),
            'members' => $this->whenLoaded('members', fn () => UserResource::collection($this->members)->resolve()),
            'members_count' => $this->whenCounted('members'),
            'projects_count' => $this->whenCounted('projects'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
