<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'chat_id', 'sender_id', 'shared_post_id', 'encrypted_payload',
        'is_system', 'is_edited', 'is_pinned', 'reply_to_id'
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function sharedPost()
    {
        return $this->belongsTo(Post::class, 'shared_post_id');
    }

    public function repliedMessage()
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }
}