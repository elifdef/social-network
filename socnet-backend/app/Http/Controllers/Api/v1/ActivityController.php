<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Resources\CommentResource;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\PostResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActivityController extends Controller
{
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
     * Повертає список постів де стоїть НАШ лайк
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function likedPosts(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $posts = Post::select('posts.*')
            ->join('likes', 'posts.id', '=', 'likes.post_id')
            ->where('likes.user_id', $user->id)
            ->with(self::POST_RELATIONS)
            ->withCount(['likes', 'comments', 'reposts'])
            ->withExists(['likes as is_liked' => function ($query) use ($user)
            {
                $query->where('user_id', $user->id);
            }])
            ->orderBy('likes.created_at', 'desc')
            ->paginate(config('posts.max_paginate'));

        return PostResource::collection($posts);
    }

    /**
     * Повертає список репостів користувача
     *
     * * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function reposts(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $reposts = $user->posts()
            ->whereNotNull('original_post_id')
            ->with(self::POST_RELATIONS)
            ->latest()
            ->paginate(config('posts.max_paginate'));

        return PostResource::collection($reposts);
    }

    /**
     * Повертає лічильники для вкладки активності
     *
     * * @param Request $request
     * @return JsonResponse
     */
    public function getCounts(Request $request)
    {
        $user = $request->user();

        $likesCount = DB::table('likes')->where('user_id', $user->id)->count();
        $commentsCount = $user->comments()->count();
        $repostsCount = $user->posts()->whereNotNull('original_post_id')->count();

        return response()->json([
            'likes' => $likesCount,
            'comments' => $commentsCount,
            'reposts' => $repostsCount
        ]);
    }

    /**
     * Повертає пагінований список коментарів які залишив поточний користувач.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function comments(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $comments = $user->comments()
            ->with(['post', 'post.user'])
            ->latest()
            ->paginate(config('posts.max_paginate'));

        return CommentResource::collection($comments);
    }
}