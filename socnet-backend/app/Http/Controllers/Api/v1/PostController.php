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
                'message' => 'The user has restricted your access to their posts.'
            ], 403);

        $posts = $targetUser->posts()
            ->with('user')
            ->withCount(['likes', 'comments'])
            ->latest()
            ->paginate(config('posts.max_paginate'));

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

        $post->load('user');
        $post->loadCount(['likes', 'comments']);

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
            'image' => 'nullable|image|max:' . config('uploads.max_size')
        ]);

        if (!$request->input('content') && !$request->hasFile('image'))
            return response()->json([
                'status' => false,
                'message' => 'Post cannot be empty.'
            ], 422);

        $path = null;
        if ($request->hasFile('image'))
        {
            $path = $this->fileService->upload(
                file: $request->file('image'),
                folder: $request->user()->username,
                prefix: 'post'
            );
        }

        $post = $request->user()->posts()->create([
            'content' => $request->input('content'),
            'image' => $path
        ]);
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
        // видаляти може тільки власник
        if ($request->user()->id !== $post->user_id)
            return response()->json([
                'status' => false,
                'message' => "You do not have right to delete someone else's post."
            ], 403);

        if ($post->image)
            Storage::disk('public')->delete($post->image);

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
        // редагувати може тільки власник
        if ($request->user()->id !== $post->user_id)
            return response()->json([
                'status' => false,
                'message' => "You do not have permission to edit someone else's post."
            ], 403);

        $request->validate([
            'content' => 'nullable|string|max:2048',
            'image' => 'nullable|image|max:' . config('uploads.max_size'),
            'delete_image' => 'boolean'
        ]);

        $futureContent = $request->has('content') ? $request->input('content') : $post->content;

        $hasNewImage = $request->hasFile('image');
        $willDeleteOldImage = $request->boolean('delete_image');

        $futureImageExists = $post->image; // припускаємо що залишається стара

        if ($willDeleteOldImage && !$hasNewImage)
            $futureImageExists = null; // стару видалили, нової не дали
        elseif ($hasNewImage)
            $futureImageExists = true; // буде нова картинка

        // перевірна на те, чи не буде фінальний варіант порожнім
        if (empty($futureContent) && empty($futureImageExists))
            return response()->json([
                'status' => false,
                'message' => "Post can't be a empty."
            ], 422);

        $data = [];

        // оновлення тексту
        if ($request->has('content'))
            $data['content'] = $futureContent;

        // якщо видаляємо стару картинку
        if ($willDeleteOldImage && !$hasNewImage)
        {
            if ($post->image)
                Storage::disk('public')->delete($post->image);
            $data['image'] = null;
        }

        // якщо завантажуємо нову картинку
        if ($hasNewImage)
        {
            if ($post->image)
                Storage::disk('public')->delete($post->image);

            $data['image'] = $this->fileService->upload(
                file: $request->file('image'),
                folder: $request->user()->username,
                prefix: 'post'
            );
        }

        $post->update($data);
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
        $friendIds->push($user->id); // щоб бачити і свої пости

        $posts = Post::whereIn('user_id', $friendIds)
            ->with('user')
            ->withCount(['likes', 'comments'])
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

        $query = Post::with('user:id,username,first_name,last_name,avatar')->latest();

        if ($user)
        {
            // отримуємо ID тих хто заблокував МЕНЕ
            $blockedBy = Friendship::where('friend_id', $user->id)
                ->where('status', Friendship::STATUS_BLOCKED)
                ->pluck('user_id');

            // отримуємо ID тих кого заблокував Я
            $blockedByMe = Friendship::where('user_id', $user->id)
                ->where('status', Friendship::STATUS_BLOCKED)
                ->pluck('friend_id');

            $query->whereNotIn('user_id', $blockedBy->merge($blockedByMe));
        }

        $posts = $query
            ->with('user')
            ->withCount(['likes', 'comments'])
            ->latest()
            ->paginate(config('posts.max_paginate'));
        return PostResource::collection($posts);
    }
}