<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Mailer\Exception\TransportException;
use App\Http\Middleware\UpdateLastSeen;
use App\Http\Middleware\CheckIfMuted;
use App\Http\Middleware\CheckIfBanned;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware)
    {
        $middleware->api(append: [UpdateLastSeen::class]);
        $middleware->alias([
            'not_muted' => CheckIfMuted::class,
            'not_banned' => CheckIfBanned::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions)
    {
        // змушує Laravel віддавати JSON помилки
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e)
        {
            if ($request->is('api', 'api/*'))
            {
                return true;
            }
            return $request->expectsJson();
        });

        // при неавторизованому
        $exceptions->render(function (AuthenticationException $e, Request $request)
        {
            if ($request->is('api/*') || $request->expectsJson())
            {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthenticated. Please provide a valid token.'
                ], 401);
            }
        });

        // при знайденому маршруту
        $exceptions->render(function (NotFoundHttpException $e, Request $request)
        {
            if ($request->is('api', 'api/*') || $request->expectsJson())
            {
                return response()->json([
                    'status' => false,
                    'message' => 'Record or endpoint not found.'
                ], 404);
            }
        });

        // доступ до чогось заборонено
        $exceptions->render(function (AccessDeniedHttpException $e, Request $request)
        {
            if ($request->is('api/*') || $request->expectsJson())
            {
                return response()->json([
                    'status' => false,
                    'message' => $e->getMessage() ?: 'This action is unauthorized.'
                ], 403);
            }
        });

        // при ліміті запитів
        $exceptions->render(function (ThrottleRequestsException $e, Request $request)
        {
            if ($request->is('api/*') || $request->expectsJson())
            {
                return response()->json([
                    'status' => false,
                    'message' => 'Too many attempts. Try again later.',
                    'seconds_remaining' => $e->getHeaders()['Retry-After'] ?? null
                ], 429);
            }
        });

        // при помилці відправки пошти
        $exceptions->render(function (TransportException $e, Request $request)
        {
            if ($request->is('api/*') || $request->expectsJson())
            {
                return response()->json([
                    'status' => false,
                    'message' => 'Error on the part of the email service.'
                ], 500);
            }
        });

    })->create();