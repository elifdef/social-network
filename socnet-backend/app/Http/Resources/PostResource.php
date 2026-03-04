<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
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
            'content' => $this->content,
            'entities' => $this->entities,
            'original_post_id' => $this->original_post_id,
            'attachments' => $this->whenLoaded('attachments', function ()
            {
                return $this->attachments->map(function ($attachment)
                {
                    return [
                        'id' => $attachment->id,
                        'type' => $attachment->type,
                        'url' => $attachment->file_url,
                        'sort_order' => $attachment->sort_order
                    ];
                });
            }),

            'created_at' => $this->created_at->toISOString(),
            'user' => new UserBasicResource($this->whenLoaded('user')),
            'likes_count' => $this->likes_count ?? 0,
            'comments_count' => $this->comments_count ?? 0,
            'reposts_count' => $this->reposts_count ?? 0,
            'is_liked' => (bool)$this->is_liked,

            'original_post' => new PostResource($this->whenLoaded('originalPost'))
        ];
    }
}
