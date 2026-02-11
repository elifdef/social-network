<?php

namespace App\Http\Resources;

use App\Models\Friendship;
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
        if ($status === 'blocked_by_target')
        {
            return [
                'id' => $this->id,
                'username' => $this->username,
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'avatar' => null,
                'bio' => null,
                'gender'=> null,
                'birth_date' => null,
                'created_at' => null,
                'is_setup_complete' => true,
                'friendship_status' => $status,
                'country' => null
            ];
        }
        return [
            // $this посилається на об'єкт User
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->when($currentUser && $currentUser->id === $this->id, $this->email),
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'gender' => $this->gender,
            'created_at' => $this->created_at,
            'birth_date' => $this->birth_date,
            'is_online' => $this->is_online,
            'last_seen' => $this->last_seen_at,
            'country' => $this->whenLoaded('country', function ()
            {
                return [
                    'id' => $this->country->id,
                    'name' => $this->country->name,
                    'emoji' => $this->country->emoji,
                    'code' => $this->country->iso2,
                ];
            }),
            'is_setup_complete' => (bool)$this->is_setup_complete,
            'email_verified_at' => $this->email_verified_at,
            'friendship_status' => $status,
            'friends_count' => $this->getAllFriendIds()->count(),
            'followers_count' => $this->receivedFriendships()->wherePivot('status', Friendship::STATUS_PENDING)->count()
        ];
    }
}
