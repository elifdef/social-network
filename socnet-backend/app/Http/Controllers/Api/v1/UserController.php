<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Resources\PublicUserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // вивести дані ВСІХ користувачів
    public function index()
    {
        //
    }

    // хм...
    public function store(Request $request)
    {
        //
    }

    // вивести дані КОНКРЕТНОГО користувача
    public function show(string $username)
    {
        $currentUser = User::where('username', $username)->firstOrFail();
        return new PublicUserResource($currentUser);
    }

    // обновити користувача (якщо він поміняв аватарку, ПІБ і т.д)
    public function update(Request $request, string $username)
    {
        $targetUser = User::where('username', $username)->firstOrFail();
        if ($request->user()->id !== $targetUser->id)
        {
            return response()->json([
                'status' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:50',
            'last_name' => 'sometimes|string|max:50',
            'bio' => 'sometimes|string|max:1000',
            'avatar_url' => 'sometimes|url'
        ]);

        if (empty($validated))
        {
            return response()->json([
                'status' => false,
                'message' => 'No valid fields provided for update'
            ], 400); // 400 Bad Request
        }

        // заповнюємо модель новими даними, але ЩЕ НЕ зберігаємо в базу.
        $targetUser->fill($validated);

        // isDirty() повертає true, якщо хоч одне поле відрізняється від того, що в базі
        if (!$targetUser->isDirty())
        {
            return response(null, 304);
        }

        $targetUser->save();

        return response()->json([
            'status' => true,
            'message' => 'Profile updated successfully'
        ]);
    }

    // видалення користувача
    // бажано підтверджувати паролем
    public function destroy(User $user)
    {
        //
    }
}
