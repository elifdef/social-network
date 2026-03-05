<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Str;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewRepostNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $user;
    public $post;

    public function __construct(User $user, Post $post)
    {
        $this->user = $user;
        $this->post = $post; // ОРИГІНАЛЬНИЙ пост
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $snippet = $this->post->content ? Str::limit(strip_tags($this->post->content), 40) : null;

        return [
            'type' => 'repost',
            'user_id' => $this->user->id,
            'user_username' => $this->user->username,
            'user_first_name' => $this->user->first_name,
            'user_last_name' => $this->user->last_name,
            'user_avatar' => $this->user->avatar_url ?? $this->user->avatar,
            'user_gender' => $this->user->gender,
            'post_id' => $this->post->id,
            'post_snippet' => $snippet,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}