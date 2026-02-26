<?php

use App\Http\Controllers\Api\v1\AdminController;
use Illuminate\Support\Facades\Route;

// Додали not_banned
Route::middleware(['auth:sanctum', 'not_banned'])->group(function ()
{
    Route::prefix('admin')->group(function ()
    {
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::get('/users/{user:username}', [AdminController::class, 'getUserProfile']);
        Route::post('/users/{user:username}/mute', [AdminController::class, 'toggleMute']);
        Route::post('/users/{user:username}/ban', [AdminController::class, 'toggleBan']);
        Route::get('/posts', [AdminController::class, 'getPosts']);
    });
});