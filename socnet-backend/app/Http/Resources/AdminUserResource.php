<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
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
            'username' => $this->username,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'avatar' => $this->avatar_url,
            'bio' => $this->bio,
            'role' => $this->role,
            'is_muted' => (bool)$this->is_muted,
            'is_banned' => (bool)$this->is_banned,
            'last_seen' => $this->last_seen_at,
            'created_at' => $this->created_at,
            'posts_count' => $this->whenCounted('posts'),
             'comments_count' => $this->whenCounted('comments'),
             'likes_count' => $this->whenCounted('likes'),

            'login_history' => $this->whenLoaded('loginHistories'),
            'moderation_logs' => $this->whenLoaded('moderationLogs', function ()
            {
                return $this->moderationLogs->map(function ($log)
                {
                    return [
                        'id' => $log->id,
                        'action' => $log->action,
                        'reason' => $log->reason,
                        'created_at' => $log->created_at,
                        'admin_name' => $log->admin ? $log->admin->first_name . ' ' . $log->admin->last_name : 'Your mom'
                    ];
                });
            }),
        ];
    }
}