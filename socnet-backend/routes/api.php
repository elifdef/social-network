<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::prefix('v1')->group(function ()
{
    require __DIR__ . '/api/auth.php';
    require __DIR__ . '/api/users.php';
    require __DIR__ . '/api/friends.php';
    require __DIR__ . '/api/posts.php';
    require __DIR__ . '/api/admin.php';
    require __DIR__ . '/api/notifications.php';
    require __DIR__ . '/api/activity.php';
});

// щоб ларавел не перекидував на сторінку логін якої немає
Route::get('/login', function ()
{
    return response()->json([
        'status' => false,
        'message' => 'Unauthenticated. Please login.'
    ], 401);
})->name('login');
