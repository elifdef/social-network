<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\FileStorageService;
use App\Http\Resources\PostResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use App\Notifications\NewWallPostNotification;
use App\Notifications\NewRepostNotification;

class PostController extends Controller
{
    protected $fileService;
    protected const POST_RELATIONS = [
        'user',
        'targetUser',
        'attachments',
        'originalPost.user',
        'originalPost.attachments',
        'originalPost.originalPost.user',
        'originalPost.originalPost.attachments'
    ];

    /**
     * Ініціалізація додаткового сервісу для завантаження файлів.
     * Тут враховано тип завантажуваного файлу і куди.
     */
    public function __construct(FileStorageService $fileService)
    {
        $this->fileService = $fileService;
    }

    /**
     * Повертає список даних постів конкретного користувача по його юзернейму.
     * Якщо власник поста заблокував нас, то ми не бачимо цей список.
     *
     * @param Request $request
     * @param string $username
     * @return JsonResponse|AnonymousResourceCollection
     */
    public function index(Request $request, string $username): JsonResponse|AnonymousResourceCollection
    {
        $targetUser = User::where('username', $username)->firstOrFail();
        $currentUser = $request->user('sanctum');

        if ($currentUser && $currentUser->isBlockedByTarget($currentUser->id, $targetUser->id))
        {
            return response()->json(['status' => false, 'message' => 'The user has restricted your access.'], 403);
        }

        // Беремо пости, де target_user_id = цей юзер АБО (user_id = цей юзер І target_user_id is null)
        $query = Post::where(function ($q) use ($targetUser)
        {
            $q->where('target_user_id', $targetUser->id)
                ->orWhere(function ($q2) use ($targetUser)
                {
                    $q2->where('user_id', $targetUser->id)->whereNull('target_user_id');
                });
        })
            ->with(self::POST_RELATIONS)
            ->withCount(['likes', 'comments', 'reposts'])
            ->whereHas('user', function ($query)
            {
                $query->where('is_banned', false);
            });

        if ($currentUser)
        {
            $query->withExists(['likes as is_liked' => function ($q) use ($currentUser)
            {
                $q->where('user_id', $currentUser->id);
            }]);
        }

        $posts = $query->latest()->paginate(config('posts.max_paginate'));

        return PostResource::collection($posts);
    }

    /**
     * Повертає дані окремого поста по його ID(String).
     */
    public function show(Request $request, Post $post): JsonResponse
    {
        $currentUser = $request->user('sanctum');

        if ($currentUser && $currentUser->isBlockedByTarget($currentUser->id, $post->user_id))
        {
            return response()->json([
                'status' => false,
                'message' => 'The user has restricted your access to the post.'
            ], 403);
        }

        $post->load(self::POST_RELATIONS);
        $post->loadCount(['likes', 'comments', 'reposts']);

        if ($currentUser)
        {
            $post->loadExists(['likes as is_liked' => function ($query) use ($currentUser)
            {
                $query->where('user_id', $currentUser->id);
            }]);
        } else
        {
            $post->is_liked = false;
        }

        return response()->json((new PostResource($post))->resolve());
    }

    /**
     * Зберігає дані для поста в БД.
     * Повертає новий пост.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'nullable|string|max:2048',
            'entities' => 'nullable|json',
            'original_post_id' => 'nullable|string|exists:posts,id',
            'target_user_id' => 'nullable|exists:users,id',
            'media' => 'nullable|array|max:10',
            'media.*' => 'file|max:' . config('uploads.max_size')
        ]);

        $targetUserId = $request->input('target_user_id');
        $originalPostId = $request->input('original_post_id');
        $user = $request->user();

        $entities = $request->has('entities') && $request->input('entities')
            ? json_decode($request->input('entities'), true)
            : null;

        $hasPoll = isset($entities['poll']);

        if (!$request->input('content') && !$request->hasFile('media') && !$originalPostId && !$hasPoll)
        {
            return response()->json([
                'status' => false,
                'message' => 'Post cannot be completely empty.'
            ], 422);
        }

        // не можна репостити на чужу стіну
        if ($targetUserId && $targetUserId != $user->id && $originalPostId)
        {
            return response()->json([
                'status' => false,
                'message' => 'You cannot repost to another user\'s wall.'
            ], 403);
        }

        // перевірка чи ми не заблоковані
        if ($targetUserId && $targetUserId != $user->id)
        {
            $targetUser = User::findOrFail($targetUserId);
            if ($user->isBlockedByTarget($user->id, $targetUser->id))
            {
                return response()->json([
                    'status' => false,
                    'message' => 'You are blocked by this user and cannot post on their wall.'
                ], 403);
            }
        }

        // валідація опитування
        if ($hasPoll)
        {
            $poll = $entities['poll'];

            // питання не може бути пустим
            if (empty(trim($poll['question'] ?? '')))
            {
                return response()->json(['status' => false, 'message' => 'Poll question cannot be empty.'], 422);
            }

            // ліміт відповідей [2,16]
            $optionsCount = count($poll['options'] ?? []);
            if ($optionsCount < 2 || $optionsCount > 16)
            {
                return response()->json(['status' => false, 'message' => 'Poll must have between 2 and 16 options.'], 422);
            }

            $hasCorrectOption = false;
            foreach ($poll['options'] as $option)
            {
                // Жоден варіант не може бути пустим
                if (empty(trim($option['text'] ?? '')))
                {
                    return response()->json(['status' => false, 'message' => 'Poll options cannot be empty.'], 422);
                }
                if (isset($option['is_correct']) && $option['is_correct'] === true)
                {
                    $hasCorrectOption = true;
                }
            }

            // якщо це вікторина -> має бути хоча б одна правильна відповідь
            if (($poll['type'] ?? 'regular') === 'quiz')
            {
                if (!$hasCorrectOption)
                {
                    return response()->json(['status' => false, 'message' => 'Quiz must have at least one correct option.'], 422);
                }
                // перевірка довжини пояснення
                if (isset($poll['explanation']) && mb_strlen($poll['explanation']) > 255)
                {
                    return response()->json(['status' => false, 'message' => 'Explanation is too long (max 255 characters).'], 422);
                }
            }
        }

        $post = $user->posts()->create([
            'target_user_id' => $targetUserId == $user->id ? null : $targetUserId,
            'content' => $request->input('content'),
            'entities' => $entities,
            'original_post_id' => $originalPostId,
            'is_repost' => $originalPostId ? true : false
        ]);

        if ($targetUserId && $targetUserId != $user->id)
        {
            $targetUser = User::find($targetUserId);
            if ($targetUser)
            {
                $targetUser->notify(new NewWallPostNotification($user, $post));
            }
        }

        if ($originalPostId)
        {
            $originalPost = Post::find($originalPostId);

            if ($originalPost && $originalPost->user_id !== $user->id)
            {
                $alreadyNotified = $originalPost->user->notifications()
                    ->where('type', NewRepostNotification::class)
                    ->where('data->user_id', $user->id)
                    ->where('data->post_id', $originalPost->id)
                    ->exists();

                if (!$alreadyNotified)
                {
                    $originalPost->user->notify(new NewRepostNotification($user, $originalPost));
                }
            }
        }

        if ($request->hasFile('media'))
        {
            $lastOrder = isset($post) ? ($post->attachments()->max('sort_order') ?? -1) : -1;

            foreach ($request->file('media') as $index => $file)
            {
                $mime = $file->getMimeType();
                $type = 'document';

                if (str_starts_with($mime, 'image/')) $type = 'image';
                elseif (str_starts_with($mime, 'video/')) $type = 'video';
                elseif (str_starts_with($mime, 'audio/')) $type = 'audio';

                $path = $this->fileService->upload(
                    file: $file,
                    folder: $request->user()->username,
                    prefix: 'media'
                );

                $post->attachments()->create([
                    'type' => $type,
                    'file_path' => $path,
                    'sort_order' => $lastOrder + 1 + $index,
                    'file_name' => basename($path),
                    'original_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize()
                ]);
            }
        }

        $post->load(self::POST_RELATIONS);
        $post->loadExists(['likes as is_liked' => function ($query) use ($user)
        {
            $query->where('user_id', $user->id);
        }]);

        return response()->json((new PostResource($post))->resolve(), 201);
    }

    /**
     * Оновлення поста.
     * Повертає змінений пост.
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        if ($request->user()->id !== $post->user_id && $request->user()->cannot('edit-any-content'))
        {
            return response()->json([
                'status' => false,
                'message' => "You do not have permission to edit someone else's post."
            ], 403);
        }

        $request->validate([
            'content' => 'nullable|string|max:2048',
            'entities' => 'nullable|json',
            'deleted_media' => 'nullable|array',
            'deleted_media.*' => 'integer|exists:post_attachments,id',
            'media' => 'nullable|array|max:10',
            'media.*' => 'file|max:' . config('uploads.max_size')
        ]);

        $futureContent = $request->has('content') ? $request->input('content') : $post->content;
        $hasRepost = !empty($post->original_post_id);

        $currentMediaCount = $post->attachments()->count();
        $deletedMediaCount = $request->has('deleted_media') ? count($request->input('deleted_media')) : 0;
        $newMediaCount = $request->hasFile('media') ? count($request->file('media')) : 0;
        $futureMediaExists = ($currentMediaCount - $deletedMediaCount + $newMediaCount) > 0;

        // перевіряємо, чи є в оригінальному пості опитування
        $originalEntities = $post->entities ?? [];
        $hasPoll = isset($originalEntities['poll']);

        if (empty($futureContent) && !$futureMediaExists && !$hasRepost && !$hasPoll)
        {
            return response()->json([
                'status' => false,
                'message' => "Post can't be empty."
            ], 422);
        }

        $data = [];
        if ($request->has('content')) $data['content'] = $futureContent;

        if ($request->has('entities'))
        {
            $entitiesInput = $request->input('entities');
            $newEntities = $entitiesInput ? json_decode($entitiesInput, true) : [];

            if ($hasPoll)
            {
                $newEntities['poll'] = $originalEntities['poll'];
            }

            $data['entities'] = empty($newEntities) ? null : $newEntities;
        }

        if (!empty($data))
        {
            $post->update($data);
        }

        if ($request->has('deleted_media'))
        {
            $attachmentsToDelete = $post->attachments()->whereIn('id', $request->input('deleted_media'))->get();
            foreach ($attachmentsToDelete as $attachment)
            {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete();
            }
        }

        if ($request->hasFile('media'))
        {
            $lastOrder = isset($post) ? ($post->attachments()->max('sort_order') ?? -1) : -1;

            foreach ($request->file('media') as $index => $file)
            {
                $mime = $file->getMimeType();
                $type = 'document';

                if (str_starts_with($mime, 'image/')) $type = 'image';
                elseif (str_starts_with($mime, 'video/')) $type = 'video';
                elseif (str_starts_with($mime, 'audio/')) $type = 'audio';

                $path = $this->fileService->upload(
                    file: $file,
                    folder: $request->user()->username,
                    prefix: 'media'
                );

                $post->attachments()->create([
                    'type' => $type,
                    'file_path' => $path,
                    'sort_order' => $lastOrder + 1 + $index,
                    'file_name' => basename($path),
                    'original_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        $user = $request->user();
        $post->load(self::POST_RELATIONS);
        $post->loadCount(['likes', 'comments', 'reposts']);
        $post->loadExists(['likes as is_liked' => function ($query) use ($user)
        {
            $query->where('user_id', $user->id);
        }]);

        return response()->json((new PostResource($post))->resolve());
    }

    /**
     * Видалення поста.
     */
    public function destroy(Post $post, Request $request): JsonResponse
    {
        $user = $request->user();

        // Може видалити автор поста, адмін, АБО власник стіни
        $isAuthor = $user->id === $post->user_id;
        $isWallOwner = $post->target_user_id === $user->id;
        $canDeleteAny = $user->cannot('delete-any-content');

        if (!$isAuthor && !$isWallOwner && $canDeleteAny)
        {
            return response()->json([
                'status' => false,
                'message' => "You do not have right to delete this post."
            ], 403);
        }

        $attachments = $post->attachments()->get();
        foreach ($attachments as $attachment)
        {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $post->delete();

        return response()->json([
            'status' => true,
            'message' => 'Post deleted.'
        ], 202);
    }
}