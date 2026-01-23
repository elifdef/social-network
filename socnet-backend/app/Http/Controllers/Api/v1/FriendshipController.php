<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Resources\PublicUserResource;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;

class FriendshipController extends Controller
{
    // надсилання заявки в друзі
    public function sendRequest(Request $request)
    {
        // для розуміння:
        // А - користувач 1
        // В - користувач 2
        $targetUser = User::where('username', $request->username)->firstOrFail();
        $me = $request->user();

        // якщо кинув заявку сам собі
        if ($me->id === $targetUser->id)
        {
            return response()->json(['message' => 'You cannot friend yourself XD'], 400);
        }

        // перевірка чи вже є якісь відносини між А і В або навпаки
        $existing = Friendship::where(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $me->id)->where('friend_id', $targetUser->id);
        })->orWhere(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $targetUser->id)->where('friend_id', $me->id);
        })->first();

        if ($existing)
        {
            // якщо А і В уже друзі
            if ($existing->status == Friendship::STATUS_ACCEPTED)
            {
                return response()->json(['message' => 'Already friends'], 409);
            }
            // якщо уже є заявка або від А або від В
            if ($existing->status == Friendship::STATUS_PENDING)
            {
                return response()->json(['message' => 'Request already pending'], 409);
            }
            // якщо А заблокував В або навпаки
            if ($existing->status == Friendship::STATUS_BLOCKED)
            {
                return response()->json(['message' => 'Unable to send request'], 403);
            }
        }

        Friendship::create([
            'user_id' => $me->id,
            'friend_id' => $targetUser->id,
            'status' => Friendship::STATUS_PENDING
        ]);

        return response()->json(['status' => true, 'message' => 'Friend request sent']);
    }

    // приймання заявки в друзі
    public function acceptRequest(Request $request)
    {
        $targetUser = User::where('username', $request->username)->firstOrFail();
        $me = $request->user();
        $friendship = Friendship::where('user_id', $targetUser->id)
            ->where('friend_id', $me->id)
            ->where('status', Friendship::STATUS_PENDING)
            ->first();

        if (!$friendship)
        {
            return response()->json(['message' => 'No pending request found'], 404);
        }

        $friendship->update(['status' => Friendship::STATUS_ACCEPTED]);

        return response()->json(['status' => true, 'message' => 'Friend request accepted']);
    }

    // видалення заявки або видалення з друзів
    public function destroy(Request $request, string $username)
    {
        $targetUser = User::where('username', $username)->firstOrFail();
        $me = $request->user();

        Friendship::where(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $me->id)->where('friend_id', $targetUser->id);
        })->orWhere(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $targetUser->id)->where('friend_id', $me->id);
        })->delete();

        return response()->json(['status' => true, 'message' => 'Friend removed']);
    }

    // блокування користувача
    public function block(Request $request)
    {
        $targetUser = User::where('username', $request->username)->firstOrFail();
        $me = $request->user();

        Friendship::where(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $me->id)->where('friend_id', $targetUser->id);
        })->orWhere(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $targetUser->id)->where('friend_id', $me->id);
        })->delete();

        Friendship::create([
            'user_id' => $me->id,
            'friend_id' => $targetUser->id,
            'status' => Friendship::STATUS_BLOCKED
        ]);

        return response()->json(['status' => true, 'message' => 'User blocked']);
    }

    // отримання списку друзів
    public function listFriends(Request $request)
    {
        $me = $request->user();

        // Логіка:
        // 1. Шукаєм тих кого Я додав
        // 2. Шукаєм тих хто МЕНЕ додав

        $friends = User::where(function ($query) use ($me)
        {
            $query->whereHas('friendOf', function ($q) use ($me)
            {
                $q->where('user_id', $me->id)
                    ->where('status', Friendship::STATUS_ACCEPTED);
            });
        })
            ->orWhere(function ($query) use ($me)
            {
                $query->whereHas('friendsOfMine', function ($q) use ($me)
                {
                    $q->where('friend_id', $me->id)
                        ->where('status', Friendship::STATUS_ACCEPTED);
                });
            })
            ->get();

        return response()->json(['status' => true, 'data' => $friends]);
    }

    // для підрахунку кількості заявок у друзі
    public function getCounts(Request $request)
    {
        $me = $request->user();
        $requestsCount = Friendship::where('friend_id', $me->id)
            ->where('status', Friendship::STATUS_PENDING)
            ->count();
        return response()->json(['requests_count' => $requestsCount]);
    }

    // для отримання списку користувачів які НАМ кинули заявку в др
    public function requests(Request $request)
    {
        $me = $request->user();
        $users = User::whereHas('friendsOfMine', function ($q) use ($me)
        {
            $q->where('friend_id', $me->id)
                ->where('status', Friendship::STATUS_PENDING);
        })->get();

        return PublicUserResource::collection($users);
    }

    // для отримання списку користувачів які у нас в ЧС
    public function blocked(Request $request)
    {
        $me = $request->user();
        $users = User::whereHas('friendOf', function ($q) use ($me)
        {
            $q->where('user_id', $me->id)
                ->where('status', Friendship::STATUS_BLOCKED);
        })->get();
        return PublicUserResource::collection($users);
    }

    // для видалення з ЧС
    public function unblock(Request $request, string $username)
    {
        $targetUser = User::where('username', $username)->firstOrFail();
        $me = $request->user();
        $deleted = Friendship::where('user_id', $me->id)
            ->where('friend_id', $targetUser->id)
            ->where('status', Friendship::STATUS_BLOCKED)
            ->delete();

        if ($deleted)
        {
            return response()->json(['status' => true, 'message' => 'User unblocked']);
        }

        return response()->json(['message' => 'User was not in blacklist'], 404);
    }
}
