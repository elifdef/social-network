<?php

use App\Http\Resources\PublicUserResource;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\FriendshipController;
use App\Http\Controllers\Api\v1\VerificationController;
use App\Http\Controllers\Api\v1\PostController;

Route::prefix('v1')->group(function ()
{
    // публічні маршрути
    // 12 запитів/хв
    Route::middleware('throttle:12,1')->controller(AuthController::class)->group(function ()
    {
        Route::post('sign-up', 'register');
        Route::post('sign-in', 'login');
    });

    // 120 запитів/хв
    Route::middleware('throttle:120,1')->controller(UserController::class)->group(function ()
    {
        // отримання свого або чужого профілю з мінімальними даними
        Route::get('users/{username}', 'show');

        // отримання поста
        Route::get('/users/{username}/posts', [PostController::class, 'index']);
    });

    // захищені маршрути
    Route::middleware(['auth:sanctum'])->group(function ()
    {
        Route::post('/user/ping', function () {
            return response()->noContent();
        });

        Route::post('/email/verification-notification', function (Request $request)
        {
            if ($request->user()->hasVerifiedEmail())
            {
                return response()->json(['message' => 'Already confirmed'], 204);
            }

            $request->user()->sendEmailVerificationNotification();
            return response()->json(['message' => 'Лист успішно відправлено.']);
        })->middleware('throttle:6,1'); // 6 листів/хв

        // загальні дії користувачів
        // 180 запитів/хв
        Route::middleware('throttle:180,1')->group(function ()
        {
            Route::post('sign-out', [AuthController::class, 'logout']);

            // отримання свого профілю з детальними даними
            Route::get('me', function (Request $request)
            {
                return (new PublicUserResource($request->user()->load('country')))->resolve();
            });

            // підтвердження пошти (перехід по посиланню)
            Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');

            // список країн (кешований)
            Route::get('/countries', function ()
            {
                return Cache::remember('countries_list', 86400, function ()
                {
                    return Country::select('id', 'name', 'emoji')->get();
                });
            });

            // редагування користувачів
            Route::patch('users/{username}', [UserController::class, 'update']);
            Route::put('/user/email', [UserController::class, 'updateEmail']);
            Route::put('/user/password', [UserController::class, 'updatePassword']);
            Route::get('/users', [UserController::class, 'index']);

            // ті хто підтвердили пошту
            Route::middleware('verified')->group(function ()
            {
                // Друзі
                Route::prefix('friends')->controller(FriendshipController::class)->group(function ()
                {
                    Route::get('/', 'listFriends');
                    Route::get('requests', 'requests');
                    Route::get('sent', 'sentRequests');
                    Route::get('count', 'getCounts');
                    Route::get('blocked', 'blocked');
                    Route::delete('blocked/{username}', 'unblock');
                    Route::post('add', 'sendRequest');
                    Route::post('accept', 'acceptRequest');
                    Route::post('block', 'block');
                    Route::delete('{username}', 'destroy');
                });

                // Пости
                Route::post('/posts', [PostController::class, 'store']);
                Route::put('/posts/{post}', [PostController::class, 'update']);
                Route::delete('/posts/{post}', [PostController::class, 'destroy']);
            });
        });
    });
});

// щоб ларавел не перекидував на сторінку логін якої немає
Route::get('/login', function ()
{
    return response()->json([
        'status' => false,
        'message' => 'Unauthenticated. Please login.'
    ], 401);
})->name('login');
