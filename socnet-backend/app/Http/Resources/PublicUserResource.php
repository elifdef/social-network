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
        $status = $this->getFriendshipStatus($request->user('sanctum'));
        if ($status === 'blocked_by_target')
        {
            return [
                'id' => $this->id,
                'username' => $this->username,
                'first_name' => $this->first_name,
                'last_name' => $this->last_name,
                'avatar' => null,
                'bio' => null,
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
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'created_at' => $this->created_at->format('d.m.Y'), // 05.01.2026
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
            'friendship_status' => $this->getFriendshipStatus($request->user('sanctum')),
            'friends_count' =>
                $this->friendOf()->wherePivot('status', Friendship::STATUS_ACCEPTED)->count() +
                $this->friendsOfMine()->wherePivot('status', Friendship::STATUS_ACCEPTED)->count(),
            'followers_count' =>
                $this->friendOf()->wherePivot('status', Friendship::STATUS_PENDING)->count(),
        ];
    }

    /**
     * Визначає статус відносин відносно поточного авторизованого користувача.
     */
    protected function getFriendshipStatus($currentUser)
    {
        // якщо це не залогінений або це ми самі
        if (!$currentUser || $currentUser->id === $this->id)
            return 'none';

        // перевіряємо обидва напрямки: А -> В або В -> А
        $friendship = Friendship::where(function ($q) use ($currentUser)
        {
            $q->where('user_id', $currentUser->id)->where('friend_id', $this->id);
        })->orWhere(function ($q) use ($currentUser)
        {
            $q->where('user_id', $this->id)->where('friend_id', $currentUser->id);
        })->first();

        if (!$friendship)
            return 'none';

        if ($friendship->status === Friendship::STATUS_ACCEPTED)
            return 'friends';

        if ($friendship->status === Friendship::STATUS_PENDING)
        {
            if ($friendship->user_id === $currentUser->id)
                return 'pending_sent'; // якщо А "відправив"
            return 'pending_received'; // якщо А "отримав"
        }

        if ($friendship->status == Friendship::STATUS_BLOCKED)
        {
            // я заблокував його
            if ($friendship->user_id === $currentUser->id)
                return 'blocked_by_me';
            //він заблокував мене
            return 'blocked_by_target';
        }
        return 'none';
    }
}
