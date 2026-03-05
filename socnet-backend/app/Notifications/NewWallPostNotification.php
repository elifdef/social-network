<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Str;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewWallPostNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $author;
    public $post;

    public function __construct(User $author, Post $post)
    {
        $this->author = $author;
        $this->post = $post;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $snippet = $this->post->content ? Str::limit(strip_tags($this->post->content), 40) : null;

        return [
            'type' => 'wall_post',
            'user_id' => $this->author->id,
            'user_username' => $this->author->username,
            'user_first_name' => $this->author->first_name,
            'user_last_name' => $this->author->last_name,
            'user_avatar' => $this->author->avatar_url,
            'user_gender' => $this->author->gender,
            'post_id' => $this->post->id,
            'post_snippet' => $snippet,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}