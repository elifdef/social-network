<?php

use App\Http\Controllers\Api\v1\UserController;
use App\Http\Resources\PublicUserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// публічне отримання БАЗОВОЇ інформації профілю (120 запитів/мін)
Route::middleware('throttle:120,1')->controller(UserController::class)->group(function ()
{
    Route::get('users/{username}', 'show');
});

// приватні налаштування (150 запитів/мін)
Route::middleware(['auth:sanctum', 'throttle:150,1'])->group(function ()
{
    // отримання РОЗШИРЕНОЇ інформації профілю
    Route::get('me', function (Request $request)
    {
        return (new PublicUserResource($request->user()))->resolve();
    });

    // редагування профілю
    Route::patch('users/{username}', [UserController::class, 'update']);
    Route::put('/user/email', [UserController::class, 'updateEmail']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);
    Route::get('/users', [UserController::class, 'index']);
});