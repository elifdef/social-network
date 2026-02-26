<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIfMuted
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !$user->is_muted)
            return $next($request);

        return response()->json([
            'status' => false,
            'message' => $this->resolveMutedMessage($request),
            'reason' => 'account_muted',
        ], 403);
    }

    private function resolveMutedMessage(Request $request): string
    {
        $path = $request->path();
        return match (true)
        {
            $this->isFriendRoute($path) => 'You cannot manage friends or send requests while muted.',
            $this->isContentRoute($path) => $this->resolveContentMessage($request->method()),
            $this->isUserRoute($path) => 'User actions (block/unblock) are disabled while muted.',
            $this->isProfileRoute($path) => 'Profile changes are not allowed during mute.',
            default => 'All further actions are restricted due to read-only mode.',
        };
    }

    private function isFriendRoute(string $path): bool
    {
        return str_contains($path, 'friends') ||
            str_contains($path, 'friendship');
    }

    private function isContentRoute(string $path): bool
    {
        return str_contains($path, 'posts') ||
            str_contains($path, 'comments');
    }

    private function isUserRoute(string $path): bool
    {
        return str_contains($path, 'block') ||
            str_contains($path, 'users/');
    }

    private function isProfileRoute(string $path): bool
    {
        return str_contains($path, 'settings') ||
            str_contains($path, 'profile');
    }

    private function resolveContentMessage(string $method): string
    {
        return match ($method)
        {
            'POST' => 'You are temporarily not allowed to publish posts or comments.',
            'DELETE' => 'You cannot delete content while muted.',
            'PUT', 'PATCH' => 'Content editing is disabled during mute.',
            default => 'Content interaction is restricted.',
        };
    }
}
