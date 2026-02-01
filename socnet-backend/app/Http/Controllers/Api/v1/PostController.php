<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Friendship;

class PostController extends Controller
{
    // Отримати пости конкретного юзера
    public function index(Request $request, string $username)
    {
        $targetUser = User::where('username', $username)->firstOrFail();
        $currentUser = $request->user('sanctum');

        if ($currentUser && $this->isBlockedByTarget($currentUser->id, $targetUser->id))
            return response()->json([
                'message' => 'Access denied.',
                'data' => []
            ], 403);

        $posts = $targetUser->posts()
            ->with('user:id,username,first_name,last_name,avatar')
            ->latest()
            ->paginate(10);

        return response()->json($posts);
    }

    // показати один пост по його id
    public function show(Request $request, Post $post)
    {
        $currentUser = $request->user();

        if ($currentUser && $this->isBlockedByTarget($currentUser->id, $post->user_id))
            return response()->json(['message' => 'Forbidden'], 403);

        return response()->json($post->load('user:id,username,first_name,last_name,avatar'));
    }

    // Створити пост
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'nullable|string|max:2048',
            'image' => 'nullable|image|max:5120', // 5МБ
        ]);

        if (!$request->input('content') && !$request->hasFile('image'))
            return response()->json(['message' => 'Post cannot be empty'], 422);

        $path = null;
        if ($request->hasFile('image'))
            $path = $request->file('image')->store('posts', 'public');

        $post = $request->user()->posts()->create([
            'content' => $request->input('content'),
            'image' => $path
        ]);
        return response()->json($post->load('user:id,username,first_name,last_name,avatar'));
    }

    // Видалити пост
    public function destroy(Post $post, Request $request)
    {
        // видаляти може тільки власник
        if ($request->user()->id !== $post->user_id)
            return response()->json(['message' => 'Forbidden'], 403);

        if ($post->image)
            Storage::disk('public')->delete($post->image);

        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }

    // Оновлення поста
    public function update(Request $request, Post $post)
    {
        // редагувати може тільки власник
        if ($request->user()->id !== $post->user_id)
            return response()->json(['message' => 'Forbidden'], 403);

        $request->validate([
            'content' => 'nullable|string|max:2048',
            'image' => 'nullable|image|max:5120',
        ]);

        $data = [];

        // оновлення тексту
        if ($request->has('content'))
            $data['content'] = $request->input('content');

        // Якщо delete_image = true
        if ($request->boolean('delete_image'))
        {
            if ($post->image)
                Storage::disk('public')->delete($post->image);
            $data['image'] = null;
        }

        // Якщо завантажують НОВУ картинку (стару теж треба видалити)
        if ($request->hasFile('image'))
        {
            if ($post->image)
                Storage::disk('public')->delete($post->image);
            $data['image'] = $request->file('image')->store('posts', 'public');
        }

        $post->update($data);
        return response()->json($post->load('user:id,username,first_name,last_name,avatar'));
    }

    // перевірка для того щоб А не міг бачити пости Б якщо Б заблокував А
    // але гості можуть бачити)00)) тому це обходиться приватною вкладкою
    private function isBlockedByTarget(int $viewerId, int $targetId): bool
    {
        if ($viewerId === $targetId) return false;
        return Friendship::where('user_id', $targetId)
            ->where('friend_id', $viewerId)
            ->where('status', Friendship::STATUS_BLOCKED)
            ->exists();
    }
}