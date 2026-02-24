<?php

use App\Http\Controllers\Api\v1\PostController;
use App\Http\Controllers\Api\v1\LikeController;
use App\Http\Controllers\Api\v1\CommentController;
use Illuminate\Support\Facades\Route;

// публічне отримання постів/коментарів/лайків (120 запитів/мін)
Route::middleware('throttle:120,1')->controller(PostController::class)->group(function ()
{
    // пости
    Route::get('/users/{username}/posts', 'index');     // всі пости користувача
    Route::get('/posts/{post}', 'show');                // один пост по ID

    // коментарі
    Route::get('/posts/{post}/comments', [CommentController::class, 'index']);
});

// дії залогіненого користувача  (180 запитів / мін)
Route::middleware(['auth:sanctum', 'throttle:180,1'])->group(function ()
{
    Route::get('/feed', [PostController::class, 'feed']);
    Route::get('/feed/global', [PostController::class, 'globalFeed']);

    // щоб писати пости/коментарі/ставити лайки потрібно підтвердити пошту
    Route::middleware('verified')->group(function () {
        // пости
        Route::post('/posts', [PostController::class, 'store']);
        Route::put('/posts/{post}', [PostController::class, 'update']);
        Route::delete('/posts/{post}', [PostController::class, 'destroy']);

        // лайки
        Route::post('/posts/{post}/like', [LikeController::class, 'toggle']);

        // коментарі
        Route::controller(CommentController::class)->group(function() {
            Route::post('/posts/{post}/comments', 'store');
            Route::delete('/comments/{comment}', 'destroy');
        });
    });
});