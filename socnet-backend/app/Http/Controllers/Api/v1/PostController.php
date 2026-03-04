<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Friendship;
use App\Services\FileStorageService;
use App\Http\Resources\PostResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    protected $fileService;

    /**
     * Ініціалізація додаткового сервісу для завантаження файлів.
     * Тут враховано тип завантажуваного файлу і куди.
     *
     * @param FileStorageService $fileService
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
            return response()->json([
                'status' => false,
                'message' => 'The user has restricted your access to their posts.',
                'data' => []
            ], 403);

        $query = $targetUser->posts()
            ->with(['user',
                'attachments',
                'originalPost.user',
                'originalPost.attachments',
                'originalPost.originalPost.user',
                'originalPost.originalPost.attachments'])
            ->withCount(['likes', 'comments', 'reposts'])
            ->whereHas('user', function ($query)
            {
                $query->where('is_banned', false);
            });

        // перевіряєм лайки ТІЛЬКИ якщо юзер авторизований
        if ($currentUser)
            $query->withExists(['likes as is_liked' => function ($q) use ($currentUser)
            {
                $q->where('user_id', $currentUser->id);
            }]);

        $posts = $query->latest()->paginate(config('posts.max_paginate'));

        return PostResource::collection($posts);
    }

    /**
     * Повертає дані окремого поста по його ID(String).
     * Також підвантажує кількість лайків, коментарів і дані автора.
     * Якщо власник поста заблокував нас, то ми не бачимо цей пост.
     *
     * @param Request $request
     * @param Post $post
     * @return JsonResponse
     */
    public function show(Request $request, Post $post): JsonResponse
    {
        $currentUser = $request->user('sanctum');

        if ($currentUser && $currentUser->isBlockedByTarget($currentUser->id, $post->user_id))
            return response()->json([
                'status' => false,
                'message' => 'The user has restricted your access to the post.'
            ], 403);

        $post->load([
            'user',
            'attachments',
            'originalPost.user',
            'originalPost.attachments',
            'originalPost.originalPost.user',
            'originalPost.originalPost.attachments'
        ]);
        $post->loadCount(['likes', 'comments', 'reposts']);

        if ($currentUser)
            $post->loadExists(['likes as is_liked' => function ($query) use ($currentUser)
            {
                $query->where('user_id', $currentUser->id);
            }]);
        else
            $post->is_liked = false;

        return response()->json((new PostResource($post))->resolve());
    }

    /**
     * Зберігає дані для поста в БД.
     * Повертає новий пост.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'content' => 'nullable|string|max:2048',
            'entities' => 'nullable|json',
            'original_post_id' => 'nullable|string|exists:posts,id',
            'media' => 'nullable|array|max:10',
            'media.*' => 'file|max:' . config('uploads.max_size')
        ]);

        if (!$request->input('content') && !$request->hasFile('media') && !$request->input('original_post_id'))
            return response()->json([
                'status' => false,
                'message' => 'Post cannot be completely empty.'
            ], 422);

        $entities = $request->has('entities') && $request->input('entities')
            ? json_decode($request->input('entities'), true)
            : null;

        $post = $request->user()->posts()->create([
            'content' => $request->input('content'),
            'entities' => $entities,
            'original_post_id' => $request->input('original_post_id')
        ]);

        if ($request->hasFile('media'))
        {
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
                    'sort_order' => $index
                ]);
            }
        }

        $user = $request->user();
        $post->load([
            'user',
            'attachments',
            'originalPost.user',
            'originalPost.attachments',
            'originalPost.originalPost.user',
            'originalPost.originalPost.attachments'
        ]);
        $post->loadExists(['likes as is_liked' => function ($query) use ($user)
        {
            $query->where('user_id', $user->id);
        }]);

        return response()->json((new PostResource($post))->resolve(), 201);
    }

    /**
     * Видалення поста.
     *
     * @param Post $post
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(Post $post, Request $request): JsonResponse
    {
        if ($request->user()->id !== $post->user_id && $request->user()->cannot('delete-any-content'))
            return response()->json([
                'status' => false,
                'message' => "You do not have right to delete someone else's post."
            ], 403);

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

    /**
     * Оновлення поста.
     * Повертає змінений пост.
     *
     * @param Request $request
     * @param Post $post
     * @return JsonResponse
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        if ($request->user()->id !== $post->user_id && $request->user()->cannot('edit-any-content'))
            return response()->json([
                'status' => false,
                'message' => "You do not have permission to edit someone else's post."
            ], 403);

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

        if (empty($futureContent) && !$futureMediaExists && !$hasRepost)
            return response()->json([
                'status' => false,
                'message' => "Post can't be empty."
            ], 422);

        $data = [];
        if ($request->has('content')) $data['content'] = $futureContent;
        if ($request->has('entities'))
        {
            $entitiesInput = $request->input('entities');
            $data['entities'] = $entitiesInput ? json_decode($entitiesInput, true) : null;
        }

        if (!empty($data))
        {
            $post->update($data);
        }

        // видаляємо старі файли
        if ($request->has('deleted_media'))
        {
            $attachmentsToDelete = $post->attachments()->whereIn('id', $request->input('deleted_media'))->get();
            foreach ($attachmentsToDelete as $attachment)
            {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete();
            }
        }

        // додаємо нові
        if ($request->hasFile('media'))
        {
            $lastOrder = $post->attachments()->max('sort_order') ?? -1;

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
                    'sort_order' => $lastOrder + 1 + $index
                ]);
            }
        }

        $user = $request->user();
        $post->load([
            'user',
            'attachments',
            'originalPost.user',
            'originalPost.attachments',
            'originalPost.originalPost.user',
            'originalPost.originalPost.attachments'
        ]);
        $post->loadCount(['likes', 'comments', 'reposts']);
        $post->loadExists(['likes as is_liked' => function ($query) use ($user)
        {
            $query->where('user_id', $user->id);
        }]);

        return response()->json((new PostResource($post))->resolve());
    }

    /**
     * Повертає пагінований список з постами НАШИХ друзів.
     * Також у цьому списку є і наші публікації.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function feed(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $friendIds = $user->getAllFriendIds();
        $friendIds->push($user->id);

        $posts = Post::whereIn('user_id', $friendIds)
            ->with([
                'user',
                'attachments',
                'originalPost.user',
                'originalPost.attachments',
                'originalPost.originalPost.user',
                'originalPost.originalPost.attachments'
            ])
            ->withCount(['likes', 'comments', 'reposts'])
            ->withExists(['likes as is_liked' => function ($query) use ($user)
            {
                $query->where('user_id', $user->id);
            }])
            ->latest()
            ->paginate(config('posts.max_paginate'));

        return PostResource::collection($posts);
    }

    /**
     * Повертає пагінований список з ВСІМА постами.
     * Також враховано: якщо нас заблокували, то ми не бачимо пости блокувальника.
     * Якщо ми заблокували, то ми не бачимо пости заблокованого.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function globalFeed(Request $request): AnonymousResourceCollection
    {
        $user = $request->user('sanctum');

        $query = Post::with([
            'user:id,username,first_name,last_name,avatar',
            'attachments',
            'originalPost.user',
            'originalPost.attachments',
            'originalPost.originalPost.user',
            'originalPost.originalPost.attachments'
        ])->latest();

        if ($user)
        {
            $blockedBy = Friendship::where('friend_id', $user->id)
                ->where('status', Friendship::STATUS_BLOCKED)
                ->pluck('user_id');

            $blockedByMe = Friendship::where('user_id', $user->id)
                ->where('status', Friendship::STATUS_BLOCKED)
                ->pluck('friend_id');

            $query->whereNotIn('user_id', $blockedBy->merge($blockedByMe));

            $query->withExists(['likes as is_liked' => function ($q) use ($user)
            {
                $q->where('user_id', $user->id);
            }]);
        }

        $posts = $query
            ->withCount(['likes', 'comments', 'reposts'])
            ->latest()
            ->paginate(config('posts.max_paginate'));

        return PostResource::collection($posts);
    }

    /**
     * Повертає список постів де стоїть НАШ лайк
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function likedPosts(Request $request)
    {
        $user = $request->user();

        $posts = Post::select('posts.*')
            ->join('likes', 'posts.id', '=', 'likes.post_id')
            ->where('likes.user_id', $user->id)
            ->with([
                'user',
                'attachments',
                'originalPost.user',
                'originalPost.attachments',
                'originalPost.originalPost.user',
                'originalPost.originalPost.attachments'
            ])
            ->withCount(['likes', 'comments', 'reposts'])
            ->withExists(['likes as is_liked' => function ($query) use ($user)
            {
                $query->where('user_id', $user->id);
            }])
            ->orderBy('likes.created_at', 'desc')
            ->paginate(config('posts.max_paginate'));

        return PostResource::collection($posts);
    }

    public function reposts(Request $request)
    {
        $user = $request->user();

        $reposts = $user->posts()
            ->whereNotNull('original_post_id')
            ->with([
                'user',
                'attachments',
                'originalPost.user',
                'originalPost.attachments',
                'originalPost.originalPost.user',
                'originalPost.originalPost.attachments'
            ])
            ->latest()
            ->paginate(config('posts.max_paginate'));

        return PostResource::collection($reposts);
    }
}