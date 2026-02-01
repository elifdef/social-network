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
        $request->validate(['username' => 'required|string']);
        $targetUser = User::where('username', $request->username)->firstOrFail();
        $me = $request->user();

        // Перевірка пошти
        if (!$me->hasVerifiedEmail())
            return response()->json(['message' => 'Email not confirmed.'], 403);

        // якщо кинув заявку сам собі
        if ($me->id === $targetUser->id)
            return response()->json(['message' => 'You cannot friend yourself XD'], 400);

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
                return response()->json(['message' => 'Already friends'], 409);

            // якщо уже є заявка або від А або від В
            if ($existing->status == Friendship::STATUS_PENDING)
                return response()->json(['message' => 'Request already pending'], 409);

            // якщо А заблокував В або навпаки
            if ($existing->status == Friendship::STATUS_BLOCKED)
                return response()->json(['message' => 'Unable to send request'], 403);
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
        $request->validate(['username' => 'required|string']);
        $targetUser = User::where('username', $request->username)->firstOrFail();
        $me = $request->user();

        // Шукаємо заявку де User_id == ТОЙ ХТО ПРОСИТЬ а Friend_id == Я
        $friendship = Friendship::where('user_id', $targetUser->id)
            ->where('friend_id', $me->id)
            ->where('status', Friendship::STATUS_PENDING)
            ->first();

        if (!$friendship)
            return response()->json(['message' => 'No pending request found'], 404);

        $friendship->update(['status' => Friendship::STATUS_ACCEPTED]);

        return response()->json(['status' => true, 'message' => 'Friend request accepted']);
    }

    // видалення заявки або видалення з друзів
    public function destroy(Request $request, string $username)
    {
        $targetUser = User::where('username', $username)->firstOrFail();
        $me = $request->user();

        // видаляємо запис незалежно від того, хто його створив
        Friendship::where(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $me->id)->where('friend_id', $targetUser->id);
        })->orWhere(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $targetUser->id)->where('friend_id', $me->id);
        })->delete();

        return response()->json(['status' => true, 'message' => 'Relationship removed']);
    }

    // блокування користувача
    public function block(Request $request)
    {
        $request->validate(['username' => 'required|string']);

        $targetUser = User::where('username', $request->username)->firstOrFail();
        $me = $request->user();

        if ($me->id === $targetUser->id)
            return response()->json(['message' => 'Cannot block yourself 1000-7'], 400);

        // видаляємо будь-які старі відносини (дружбу або заявки)
        Friendship::where(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $me->id)->where('friend_id', $targetUser->id);
        })->orWhere(function ($q) use ($me, $targetUser)
        {
            $q->where('user_id', $targetUser->id)->where('friend_id', $me->id);
        })->delete();

        // новий запис про блокування, де ініціатор - Я
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

        // Використовуємо whereHas для фільтрації
        $friends = User::where(function ($query) use ($me)
        {
            // той кого я додав і вони прийняли
            $query->whereHas('friendOf', function ($q) use ($me)
            {
                $q->where('user_id', $me->id)
                    ->where('status', Friendship::STATUS_ACCEPTED);
            });
        })
            ->orWhere(function ($query) use ($me)
            {
                // той хто мене додав і я прийняв
                $query->whereHas('friendsOfMine', function ($q) use ($me)
                {
                    $q->where('friend_id', $me->id)
                        ->where('status', Friendship::STATUS_ACCEPTED);
                });
            })
            ->get();

        return PublicUserResource::collection($friends);
    }

    // для отримання моїх підписок
    public function sentRequests(Request $request)
    {
        $me = $request->user();
        $users = User::whereHas('friendOf', function ($q) use ($me)
        {
            $q->where('user_id', $me->id)
                ->where('status', Friendship::STATUS_PENDING);
        })->get();
        return PublicUserResource::collection($users);
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

        // Видаляємо ТІЛЬКИ якщо Я заблокував (user_id == me)
        $deleted = Friendship::where('user_id', $me->id)
            ->where('friend_id', $targetUser->id)
            ->where('status', Friendship::STATUS_BLOCKED)
            ->delete();

        if ($deleted)
            return response()->json(['status' => true, 'message' => 'User unblocked']);

        return response()->json(['message' => 'User was not in blacklist'], 404);
    }

    // для отримання теперішнього статусу дружби
    public function getFriendshipStatus($currentUserId, $targetUserId)
    {
        $friendship = Friendship::where(function ($q) use ($currentUserId, $targetUserId)
        {
            $q->where('user_id', $currentUserId)->where('friend_id', $targetUserId);
        })->orWhere(function ($q) use ($currentUserId, $targetUserId)
        {
            $q->where('user_id', $targetUserId)->where('friend_id', $currentUserId);
        })->first();

        if (!$friendship)
            return 'none';

        return match ($friendship->status)
        {
            Friendship::STATUS_ACCEPTED => 'friends',
            Friendship::STATUS_PENDING =>
            $friendship->user_id === $currentUserId ? 'pending_sent' : 'pending_received',
            Friendship::STATUS_BLOCKED =>
            $friendship->user_id === $currentUserId ? 'blocked_by_me' : 'blocked_by_target',
            default => 'none',
        };
    }
}