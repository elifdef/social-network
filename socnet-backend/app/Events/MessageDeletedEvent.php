<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDeletedEvent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public $chat_slug;
    public $message_id;
    private $target_user_id;

    public function __construct($chatSlug, $messageId, $targetUserId)
    {
        $this->chat_slug = $chatSlug;
        $this->message_id = $messageId;
        $this->target_user_id = $targetUserId;
    }

    public function broadcastOn()
    {
        // відправляємо в приватний канал співрозмовника
        return new PrivateChannel('App.Models.User.' . $this->target_user_id);
    }

    public function broadcastAs()
    {
        return 'message_deleted';
    }
}