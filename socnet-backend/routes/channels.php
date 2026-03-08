<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Chat;

// вказуємо як саме авторизувати вебсокети (через sanctum по API)
Broadcast::routes(['prefix' => 'api', 'middleware' => ['auth:sanctum']]);

// канал сповіщень юзера
Broadcast::channel('App.Models.User.{id}', function ($user, $id)
{
    return (int)$user->id === (int)$id;
});

// канал чату
Broadcast::channel('chat.{slug}', function ($user, $slug)
{
    $chat = Chat::where('slug', $slug)->first();

    if (!$chat)
    {
        return false;
    }

    // дозволяємо підключення ТІЛЬКИ якщо юзер є учасником цього чату
    return $chat->participants()->where('user_id', $user->id)->exists();
});