<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Resources\UserBasicResource;
use App\Models\Chat;
use App\Models\ChatParticipant;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use App\Services\ChatEncryptionService;
use App\Http\Resources\PostResource;
use App\Events\MessageDeletedEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function index()
    {
        $myId = Auth::id();

        $chats = Chat::whereHas('participants', function ($q) use ($myId)
        {
            $q->where('user_id', $myId);
        })
            ->with(['participants' => function ($q) use ($myId)
            {
                $q->where('user_id', '!=', $myId)->with('user');
            }, 'messages' => function ($q)
            {
                $q->latest()->limit(1);
            }])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($chat) use ($myId)
            {
                $lastMsg = $chat->messages->first();
                $targetParticipant = $chat->participants->first();

                $firstMsg = Message::where('chat_id', $chat->id)->oldest()->first();
                $initiatorId = $firstMsg ? $firstMsg->sender_id : null;

                $lastMsgText = '';
                $lastMsgSenderId = null;

                if ($lastMsg)
                {
                    $lastMsgSenderId = $lastMsg->sender_id;
                    $payload = ChatEncryptionService::decryptPayload($lastMsg->encrypted_payload, $chat->encrypted_dek);
                    $lastMsgText = $payload['text'] ?? (empty($payload['files']) ? 'Post' : 'Media');
                }

                return [
                    'slug' => $chat->slug,
                    'created_at' => $chat->created_at,
                    'initiator_id' => $initiatorId,
                    'updated_at' => $chat->updated_at,
                    'target_user' => (new UserBasicResource($targetParticipant ? $targetParticipant->user : null))->resolve(),
                    'last_message' => $lastMsgText,
                    'last_message_sender_id' => $lastMsgSenderId,
                    'unread_count' => 0
                ];
            });

        return response()->json($chats);
    }

    public function getOrCreateChat(Request $request)
    {
        $request->validate(['target_user_id' => 'required|exists:users,id']);
        $myId = Auth::id();
        $targetId = $request->target_user_id;

        $chat = Chat::where('type', 'private')
            ->whereHas('participants', fn($q) => $q->where('user_id', $myId))
            ->whereHas('participants', fn($q) => $q->where('user_id', $targetId))
            ->first();

        if (!$chat)
        {
            $chat = Chat::create([
                'slug' => Str::random(12),
                'type' => 'private',
                'encrypted_dek' => ChatEncryptionService::generateEncryptedChatKey()
            ]);

            ChatParticipant::insert([
                ['chat_id' => $chat->id, 'user_id' => $myId, 'created_at' => now(), 'updated_at' => now()],
                ['chat_id' => $chat->id, 'user_id' => $targetId, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        return response()->json(['chat_slug' => $chat->slug]);
    }

    public function sendMessage(Request $request, $slug)
    {
        $request->validate([
            'text' => 'nullable|string|max:4096',
            'shared_post_id' => 'nullable|exists:posts,id',
            'reply_to_id' => 'nullable|exists:messages,id',
            'media' => 'nullable|array|max:10',
            'media.*' => 'file|max:' . config('uploads.max_size', 51200)
        ]);

        if (!$request->text && !$request->hasFile('media') && !$request->shared_post_id)
        {
            return response()->json(['error' => 'Message cannot be empty'], 422);
        }

        $chat = Chat::where('slug', $slug)->firstOrFail();

        /** @var \App\Models\User $user */
        $user = $request->user();

        if (!$chat->participants()->where('user_id', $user->id)->exists())
        {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $savedFiles = [];
        if ($request->hasFile('media'))
        {
            foreach ($request->file('media') as $file)
            {
                $filename = Str::random(64) . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs($user->username . '/messages', $filename, 'public');
                $savedFiles[] = $path;
            }
        }

        $payload = [
            'text' => $request->text ?? '',
            'files' => $savedFiles
        ];

        $encryptedPayload = ChatEncryptionService::encryptPayload($payload, $chat->encrypted_dek);

        $message = Message::create([
            'chat_id' => $chat->id,
            'sender_id' => $user->id,
            'shared_post_id' => $request->shared_post_id,
            'reply_to_id' => $request->reply_to_id,
            'encrypted_payload' => $encryptedPayload,
            'is_system' => false
        ]);

        $targetParticipant = $chat->participants()->where('user_id', '!=', $user->id)->first();

        if ($targetParticipant)
        {
            $targetParticipant->user->notify(new NewMessageNotification(
                $user,
                $message,
                $chat->slug,
                $chat->encrypted_dek
            ));
        }

        $chat->touch();

        return response()->json(['success' => true, 'message_id' => $message->id]);
    }

    public function updateMessage(Request $request, $slug, $messageId)
    {
        $request->validate([
            'text' => 'nullable|string|max:4096',
            'deleted_media' => 'nullable|array',
            'deleted_media.*' => 'string',
            'media' => 'nullable|array|max:10',
            'media.*' => 'file|max:' . config('uploads.max_size', 51200)
        ]);

        $chat = Chat::where('slug', $slug)->firstOrFail();
        $message = Message::where('id', $messageId)->where('chat_id', $chat->id)->firstOrFail();

        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($message->sender_id !== $user->id)
        {
            return response()->json(['error' => 'Not your message'], 403);
        }

        $oldPayload = ChatEncryptionService::decryptPayload($message->encrypted_payload, $chat->encrypted_dek);
        $currentFiles = $oldPayload['files'] ?? [];

        if ($request->has('deleted_media'))
        {
            foreach ($request->deleted_media as $fileToDelete)
            {
                if (in_array($fileToDelete, $currentFiles))
                {
                    Storage::disk('public')->delete($fileToDelete);
                    $currentFiles = array_diff($currentFiles, [$fileToDelete]);
                }
            }
            $currentFiles = array_values($currentFiles);
        }

        if ($request->hasFile('media'))
        {
            foreach ($request->file('media') as $file)
            {
                $filename = Str::random(64) . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs($user->username . '/messages', $filename, 'public');
                $currentFiles[] = $path;
            }
        }

        if (empty($request->text) && empty($currentFiles) && !$message->shared_post_id)
        {
            return response()->json(['error' => 'Message cannot be empty'], 422);
        }

        $newPayload = [
            'text' => $request->text ?? '',
            'files' => $currentFiles
        ];

        $message->update([
            'encrypted_payload' => ChatEncryptionService::encryptPayload($newPayload, $chat->encrypted_dek),
            'is_edited' => true
        ]);

        return response()->json(['success' => true, 'edited_at' => $message->updated_at]);
    }

    public function getMessages($slug)
    {
        $chat = Chat::where('slug', $slug)->firstOrFail();

        if (!$chat->participants()->where('user_id', Auth::id())->exists())
        {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $messages = Message::with(['sharedPost.user', 'sharedPost.attachments', 'repliedMessage.sender'])
            ->where('chat_id', $chat->id)
            ->orderBy('created_at', 'desc')
            ->paginate(30);

        $messages->getCollection()->transform(function ($msg) use ($chat)
        {
            $payload = ChatEncryptionService::decryptPayload($msg->encrypted_payload, $chat->encrypted_dek);

            $fileUrls = [];
            if (!empty($payload['files']))
            {
                foreach ($payload['files'] as $file)
                {
                    $fileUrls[] = [
                        'name' => basename($file),
                        'url' => asset('storage/' . $file)
                    ];
                }
            }

            $replyData = null;
            if ($msg->repliedMessage)
            {
                $replyPayload = ChatEncryptionService::decryptPayload($msg->repliedMessage->encrypted_payload, $chat->encrypted_dek);
                $replyData = [
                    'id' => $msg->repliedMessage->id,
                    'text' => $replyPayload['text'] ?? 'Медіафайл',
                    'sender_name' => current(explode(' ', $msg->repliedMessage->sender->first_name))
                ];
            }

            return [
                'id' => $msg->id,
                'sender_id' => $msg->sender_id,
                'text' => $payload['text'] ?? '',
                'files' => $fileUrls,
                'shared_post' => $msg->shared_post_id ? (new PostResource($msg->sharedPost))->resolve() : null,
                'reply_to' => $replyData,
                'is_pinned' => $msg->is_pinned,
                'created_at' => $msg->created_at,
                'is_edited' => $msg->is_edited,
                'edited_at' => $msg->is_edited ? $msg->updated_at : null,
                'isMine' => $msg->sender_id === Auth::id()
            ];
        });

        return response()->json($messages);
    }

    public function destroyMessage($slug, $messageId)
    {
        $chat = Chat::where('slug', $slug)->firstOrFail();
        $message = Message::where('id', $messageId)->where('chat_id', $chat->id)->firstOrFail();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($message->sender_id !== $user->id)
        {
            return response()->json(['error' => 'Not your message'], 403);
        }

        $payload = ChatEncryptionService::decryptPayload($message->encrypted_payload, $chat->encrypted_dek);

        if (!empty($payload['files']))
        {
            foreach ($payload['files'] as $file)
            {
                Storage::disk('public')->delete($file);
            }
        }

        $message->delete();

        $targetParticipant = $chat->participants()->where('user_id', '!=', $user->id)->first();
        if ($targetParticipant)
        {
            broadcast(new MessageDeletedEvent($chat->slug, $messageId, $targetParticipant->user_id));
        }

        return response()->json(['success' => true]);
    }

    public function destroyChat($slug, Request $request)
    {
        $chat = Chat::where('slug', $slug)->firstOrFail();

        if (!$chat->participants()->where('user_id', Auth::id())->exists())
        {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($request->for_both)
        {
            $chat->delete();
        } else
        {
            $chat->participants()->where('user_id', Auth::id())->delete();
        }

        return response()->json(['success' => true]);
    }

    public function togglePinMessage($slug, $messageId, Request $request)
    {
        $chat = Chat::where('slug', $slug)->firstOrFail();
        $message = Message::where('id', $messageId)->where('chat_id', $chat->id)->firstOrFail();

        /** @var \App\Models\User $user */
        $user = $request->user();

        if (!$chat->participants()->where('user_id', $user->id)->exists())
        {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $message->update(['is_pinned' => !$message->is_pinned]);

        $targetParticipant = $chat->participants()->where('user_id', '!=', $user->id)->first();
        if ($targetParticipant)
        {
            $targetParticipant->user->notify(new NewMessageNotification(
                $user,
                $message,
                $chat->slug,
                $chat->encrypted_dek
            ));
        }

        return response()->json(['success' => true, 'is_pinned' => $message->is_pinned]);
    }
}