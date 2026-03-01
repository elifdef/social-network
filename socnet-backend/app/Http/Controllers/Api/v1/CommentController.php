<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use App\Http\Resources\CommentResource;

class CommentController extends Controller
{
    // отримати ВСІ коментарі до поста
    public function index(Post $post)
    {
        $comments = $post->comments()
            ->with('user')
            ->whereHas('user', function ($query) {$query->where('is_banned', false);})
            ->latest() // нові зверху
            ->paginate(20);

        return CommentResource::collection($comments);
    }

    // створити коментар
    public function store(Request $request, Post $post)
    {
        $currentUser = $request->user('sanctum');

        if ($currentUser) {
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
}