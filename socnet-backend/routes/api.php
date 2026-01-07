<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\Api\v1\AuthController;

Route::prefix('v1')->group(function ()
{
    // не требує токена
    Route::middleware('throttle:6,1')->group(function ()
    {
        Route::post('sign-up', [AuthController::class, 'register']);
        Route::post('sign-in', [AuthController::class, 'login']);
    });

    // не требує токена але більше дозволено запитів
    Route::middleware('throttle:60,1')->group(function ()
    {
        Route::get('users/{username}', [UserController::class, 'show']);
    });

    // требує токен
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function ()
    {
        Route::patch('users/{username}', [UserController::class, 'update']);
        Route::post('sign-out', [AuthController::class, 'logout']);
    });
});
