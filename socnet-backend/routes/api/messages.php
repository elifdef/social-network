<?php

use App\Http\Controllers\Api\v1\ChatController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::middleware(['auth:sanctum', 'not_banned', 'verified', 'not_muted'])
    ->prefix('chat')
    ->group(function ()
    {
        Route::get('/', [ChatController::class, 'index']);
        Route::post('/init', [ChatController::class, 'getOrCreateChat']);
        Route::get('/{slug}/messages', [ChatController::class, 'getMessages']);
        Route::post('/{slug}/message', [ChatController::class, 'sendMessage']);
        Route::post('/{slug}/message/{messageId}/update', [ChatController::class, 'updateMessage']);
        Route::delete('/{slug}/message/{messageId}', [ChatController::class, 'destroyMessage']);
        Route::delete('/chat/{slug}', [ChatController::class, 'destroyChat']);
        Route::post('/{slug}/message/{id}/pin', [ChatController::class, 'togglePinMessage']);
    });