<?php

use App\Http\Controllers\Api\v1\Admin\DashboardController;
use App\Http\Controllers\Api\v1\AdminController;
use Illuminate\Support\Facades\Route;

// Додали not_banned
Route::middleware(['auth:sanctum', 'not_banned'])->group(function ()
{
    Route::prefix('admin')->group(function ()
    {
        // інформація
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::get('/posts', [AdminController::class, 'getPosts']);
        Route::get('/users/{user:username}', [AdminController::class, 'getUserProfile']);

        // дії над користувачами
        Route::post('/users/{user:username}/mute', [AdminController::class, 'toggleMute']);
        Route::post('/users/{user:username}/ban', [AdminController::class, 'toggleBan']);

        // статистика
        Route::get('/dashboard', [DashboardController::class, 'getStats']);
    });
});