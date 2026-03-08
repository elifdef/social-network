<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\User;
use App\Services\ChatEncryptionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $sender;
    public $message;
    public $chatSlug;
    public $chatDek;

    public function __construct(User $sender, Message $message, string $chatSlug, string $chatDek)
    {
        $this->sender = $sender;
        $this->message = $message;
        $this->chatSlug = $chatSlug;
        $this->chatDek = $chatDek; // зашифрований ключ чату
    }


    public function via(object $notifiable): array
    {
        return ['broadcast'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        // розшифровуємо повідомлення, щоб показати його в тості
        $payload = ChatEncryptionService::decryptPayload($this->message->encrypted_payload, $this->chatDek);

        $text = $payload['text'] ?? '';
        $hasFiles = !empty($payload['files']);

        $fileType = null;
        if ($hasFiles && empty($text))
        {
            $extension = strtolower(pathinfo($payload['files'][0], PATHINFO_EXTENSION));
            if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp']))
            {
                $fileType = 'image';
            } elseif (in_array($extension, ['mp4', 'mov', 'webm']))
            {
                $fileType = 'video';
            } else
            {
                $fileType = 'file';
            }
        }

        return new BroadcastMessage([
            'type' => 'new_message',
            'user_id' => $this->sender->id,
            'user_username' => $this->sender->username,
            'user_first_name' => $this->sender->first_name,
            'user_last_name' => $this->sender->last_name,
            'user_avatar' => $this->sender->avatar_url,
            'user_gender' => $this->sender->gender,
            'chat_slug' => $this->chatSlug,
            'message_text' => $text,
            'file_type' => $fileType // 'image', 'video', 'file'
        ]);
    }
}