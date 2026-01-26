<?php

use App\Http\Resources\PublicUserResource;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\FriendshipController;

Route::prefix('v1')->group(function ()
{
    // 6 запитів/хв без токена
    Route::middleware('throttle:6,1')->controller(AuthController::class)->group(function ()
    {
        Route::post('sign-up', 'register');
        Route::post('sign-in', 'login');
    });

    // 120 запитів/хв
    Route::middleware('throttle:120,1')->controller(UserController::class)->group(function ()
    {
        Route::get('users/{username}', 'show');
    });

    // 120 запитів/хв з токеном
    Route::middleware(['auth:sanctum', 'throttle:120,1'])->group(function ()
    {
        Route::post('sign-out', [AuthController::class, 'logout']);
        Route::get('me', function (Request $request)
        {
            return (new PublicUserResource($request->user()->load('country')))->resolve();
        });

        Route::get('/countries', function () {
            return Cache::remember('countries_list', 86400, function () {
                return Country::select('id', 'name', 'emoji')->get();
            });
        });

        Route::patch('users/{username}', [UserController::class, 'update']);
        Route::get('/users', [UserController::class, 'index']);

        Route::prefix('friends')->controller(FriendshipController::class)->group(function ()
        {
            Route::get('/', 'listFriends');
            Route::get('requests', 'requests');
            Route::get('count', 'getCounts');
            Route::get('blocked', 'blocked');
            Route::delete('blocked/{username}', 'unblock');
            Route::post('add', 'sendRequest');
            Route::post('accept', 'acceptRequest');
            Route::post('block', 'block');
            Route::delete('{username}', 'destroy');
        });
    });
});

// щоб ларавел не перекидував на сторінку логін якої немає
Route::get('/login', function () {
    return response()->json([
        'status' => false,
        'message' => 'Unauthenticated. Please login.'
    ], 401);
})->name('login');
