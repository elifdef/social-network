<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIfBanned
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // якщо юзер авторизований і ЗАБАНЕНИЙ
        if ($request->user() && $request->user()->is_banned)
            return response()->json([
                'status'=> false,
                'message' => 'Your account has been blocked for breaking the rules.'
            ], 403);

        return $next($request);
    }
}
