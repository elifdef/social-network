<?php

namespace App\Http\Resources;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentUser = $request->user('sanctum');
        $status = $this->getFriendshipStatusWith($currentUser);

        // якщо забанені
        if ($this->is_banned) {
            return [
                'id' => $this->id,
                'username' => $this->username,
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'avatar' => $this->avatar_url,
                'bio' => null,
                'gender' => null,
                'birth_date' => null,
                'created_at' => null,
                'is_setup_complete' => true,
                'friendship_status' => $status,
                'country' => null,
                'is_banned' => true,
            ];
        }

        // якщо кинули в ЧС
        if ($status === 'blocked_by_target')
        {
            return [
                'id' => $this->id,
                'username' => $this->username,
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'avatar' => $this->avatar_url,
                'bio' => null,
                'gender' => null,
                'birth_date' => null,
                'created_at' => null,
                'is_setup_complete' => true,
                'friendship_status' => $status,
                'country' => null,
                'is_banned' => (bool)$this->is_banned,
            ];
        }
        return [
            'id' => $this->id,
            'username' => $this->username,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'avatar' => $this->avatar_url,
            'bio' => $this->bio,
            'gender' => $this->gender,
            'created_at' => $this->created_at,
            'birth_date' => $this->birth_date,
            'is_online' => $this->is_online,
            'last_seen' => $this->last_seen_at,
            'country' => $this->country,
            'is_setup_complete' => (bool)$this->is_setup_complete,
            'role' => $this->role,
            'friendship_status' => $status,
            'is_banned' => (bool)$this->is_banned,

            // Лічильники
            'friends_count' => $this->getAllFriendIds()->count(),
            'followers_count' => $this->receivedFriendships()->wherePivot('status', Friendship::STATUS_PENDING)->count()
        ];
    }
}