<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\Comment;
use App\Models\Post;
use App\Notifications\NewCommentNotification;
use Illuminate\Http\Request;
use App\Http\Resources\CommentResource;

class CommentController extends Controller
{
    // отримати ВСІ коментарі до поста
    public function index(Post $post)
    {
        $comments = $post->comments()
            ->with('user')
            ->whereHas('user', function ($query)
            {
                $query->where('is_banned', false);
            })
            ->latest() // нові зверху
            ->paginate(20);

        return CommentResource::collection($comments);
    }

    // створити коментар
    public function store(Request $request, Post $post)
    {
        $currentUser = $request->user('sanctum');

        if ($currentUser)
        {
            // автор поста заблокував коментатора
            $blockedByAuthor = $currentUser->isBlockedByTarget($currentUser->id, $post->user_id);
            // коментатор заблокував автора поста
            $blockedByCommenter = $currentUser->isBlockedByTarget($post->user_id, $currentUser->id);

            if ($blockedByAuthor || $blockedByCommenter)
                return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate(['content' => 'required|string|max:1000']);

        $comment = $post->comments()->create([
            'content' => $request->input('content'),
            'user_id' => $currentUser->id
        ]);

        if ($post->user_id !== $request->user()->id)
            $post->user->notify(new NewCommentNotification($request->user(), $post, $comment));

        return (new CommentResource($comment->load('user')))->resolve();
    }

    // видалити коментар
    public function destroy(Request $request, Comment $comment)
    {
        // Видаляти може ТІЛЬКИ автор коментаря
        if ($request->user()->id !== $comment->user_id)
            return response()->json(['message' => 'Forbidden'], 403);

        $comment->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function myComments(Request $request)
    {
        $user = $request->user();

        $comments = Comment::where('user_id', $user->id)
            ->with(['user', 'post.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return CommentResource::collection($comments);
    }
}