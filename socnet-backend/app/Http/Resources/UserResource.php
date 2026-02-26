<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'gender' => $this->gender,
            'birth_date' => $this->birth_date,
            'country' => $this->country,
            'is_setup_complete' => (bool)$this->is_setup_complete,
            'email_verified_at' => $this->email_verified_at,
            'role' => $this->role,
            'created_at' => $this->created_at,
            'is_banned' => (bool)$this->is_banned,

            // якщо забанений -> дістаємо останню причину з логів
            'ban_reason' => $this->when($this->is_banned, function () {
                return $this->moderationLogs()
                    ->where('action', 'banned')
                    ->latest()
                    ->value('reason');
            }),
        ];
    }
}
