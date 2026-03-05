<?php

use App\Http\Controllers\Api\v1\ActivityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'not_banned'])->group(function ()
{
    Route::prefix('activity')->group(function ()
    {
        Route::get('/liked', [ActivityController::class, 'likedPosts']);
        Route::get('/reposts', [ActivityController::class, 'reposts']);
        Route::get('/comments', [ActivityController::class, 'comments']);
        Route::get('/counts', [ActivityController::class, 'getCounts']);
    });
});