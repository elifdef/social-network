<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Resources\AdminUserResource;
use App\Models\User;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\PostResource;
use Illuminate\Support\Facades\Gate;
use App\Enums\Role;

class AdminController extends Controller
{
    // профіль конкретного користувача
    public function getUserProfile(User $user)
    {
        Gate::authorize('manage-users');
        $user->loadCount(['posts', 'comments', 'likes'])
            ->load(['loginHistories' => function ($q)
            {
                $q->limit(10);
            }, 'moderationLogs.admin']);

        return new AdminUserResource($user);
    }

    // отримати список усіх користувачів (з пошуком)
    public function getUsers(Request $request)
    {
        Gate::authorize('manage-users');

        $query = User::query();

        // Якщо передали параметр пошуку (username або email)
        if ($request->has('search') && !empty($request->search))
        {
            $search = $request->search;
            $query->where('username', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        }

        $users = $query->withCount('posts')
            ->latest()
            ->paginate(20);

        return AdminUserResource::collection($users);
    }

    // мут
    public function toggleMute(Request $request, User $user): JsonResponse
    {
        Gate::authorize('manage-users');

        if ($user->role->value >= $request->user()->role->value)
            return response()->json([
                'status' => false,
                'message' => 'You do not have permission to mute this user.'
            ], 403);

        $user->is_muted = !$user->is_muted;
        $user->save();

        $action = $user->is_muted ? 'muted' : 'unmuted';

        // лог
        $user->moderationLogs()->create([
            'admin_id' => $request->user()->id,
            'action' => $action,
            'reason' => $request->input('reason', 'Reason not specified')
        ]);

        return response()->json([
            'status' => true,
            'message' => "User successfully $action.",
            'is_muted' => $user->is_muted
        ]);
    }

    public function toggleBan(Request $request, User $user): JsonResponse
    {
        Gate::authorize('manage-users');
        if ($user->role->value >= $request->user()->role->value)
            return response()->json([
                'status' => false,
                'message' => 'You do not have permission to ban this user.'
            ], 403);

        $user->is_banned = !$user->is_banned;
        $user->save();

        if ($user->is_banned)
        {
            $user->tokens()->delete();
        }

        $action = $user->is_banned ? 'banned' : 'unbanned';

        // лог
        $user->moderationLogs()->create([
            'admin_id' => $request->user()->id,
            'action' => $action,
            'reason' => $request->input('reason', 'Reason not specified')
        ]);

        return response()->json([
            'status' => true,
            'message' => "Account successfully $action.",
            'is_banned' => $user->is_banned
        ]);
    }

    public function getPosts(Request $request)
    {
        Gate::authorize('delete-any-content');

        $query = Post::with('user')->withCount(['likes', 'comments'])->latest();
        if ($request->has('username') && !empty($request->username))
            $query->whereHas('user', function ($q) use ($request)
            {
                $q->where('username', $request->username);
            });

        $posts = $query->paginate(config('posts.max_paginate', 20));
        return PostResource::collection($posts);
    }
}
