<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Task
 */
class TaskResource extends JsonResource
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
            'status' => $this->status?->value,
            'priority' => $this->priority?->value,
            'due_date' => $this->due_date?->toISOString(),
            'position' => $this->position,
            'project' => $this->whenLoaded('project', fn () => (new ProjectResource($this->project))->resolve()),
            'creator' => $this->whenLoaded('creator', fn () => (new UserResource($this->creator))->resolve()),
            'assignee' => $this->whenLoaded('assignee', fn () => (new UserResource($this->assignee))->resolve()),
            'parent' => $this->whenLoaded('parent', fn () => (new TaskResource($this->parent))->resolve()),
            'subtasks' => $this->whenLoaded('subtasks', fn () => TaskResource::collection($this->subtasks)->resolve()),
            'subtasks_count' => $this->whenCounted('subtasks'),
            'labels' => $this->whenLoaded('labels', fn () => LabelResource::collection($this->labels)->resolve()),
            'comments' => $this->whenLoaded('comments', fn () => TaskCommentResource::collection($this->comments)->resolve()),
            'comments_count' => $this->whenCounted('comments'),
            'attachments' => $this->whenLoaded('attachments', fn () => TaskAttachmentResource::collection($this->attachments)->resolve()),
            'attachments_count' => $this->whenCounted('attachments'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
