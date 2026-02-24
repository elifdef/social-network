<?php

use App\Http\Controllers\Api\v1\FriendshipController;
use Illuminate\Support\Facades\Route;

// маршрути які требують авторизації (180 запитів/мін)
Route::middleware(['auth:sanctum', 'throttle:180,1'])
    ->prefix('friends')
    ->controller(FriendshipController::class)
    ->group(function ()
    {
        Route::get('/', 'listFriends');                 // список друзів
        Route::get('requests', 'requests');             // вхідні заявки
        Route::get('sent', 'sentRequests');             // вихідні заявки
        Route::get('blocked', 'blocked');               // список заблокованих
    });

// так само, але щоб добавити друга, видалити або заблокувати треба підтвердити почту
Route::middleware(['auth:sanctum', 'verified', 'throttle:180,1'])
    ->prefix('friends')
    ->controller(FriendshipController::class)
    ->group(function ()
    {
        Route::post('add', 'sendRequest');              // додати друга
        Route::post('accept', 'acceptRequest');         // прийняти друга
        Route::delete('{username}', 'destroy');         // видалити друга
        Route::post('block', 'block');                  // заблокувати
        Route::delete('blocked/{username}', 'unblock'); // розблокувати
    });