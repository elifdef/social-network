<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Resources\PublicUserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    // вивести дані ВСІХ користувачів
    public function index(Request $request)
    {
        $search = $request->input('search');
        $query = User::query();

        // Виключаємо себе зі списку
        if ($request->user())
        {
            $query->where('id', '!=', $request->user()->id);
        }

        // Якщо користувач щось ввів у пошук
        if ($search)
        {
            $query->where(function ($q) use ($search)
            {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            });
        } else
        {
            // Якщо пошуку немає - показуємо найновіших
            $query->latest();
        }

        // поверне лише 20 записів + метадані про сторінки
        $users = $query->paginate(20);
        return PublicUserResource::collection($users);
    }

    // хм...
    public function store(Request $request)
    {
        //
    }

    // вивести дані КОНКРЕТНОГО користувача
    public function show(string $username)
    {
        $currentUser = User::with('country')->where('username', $username)->firstOrFail();
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

        $rules = [
            'bio' => 'nullable|string|max:1000',
            'last_name' => 'nullable|string|min:3|max:50',
            'avatar' => 'nullable|image|max:5120', // 5mb
            'country_id' => 'nullable|integer|exists:countries,id',
        ];

        if ($request->has('finish_setup') && $request->input('finish_setup'))
        {
            $rules['first_name'] = 'required|string|min:3|max:50';
            $rules['birth_date'] = 'required|date';
        } else
        {
            $rules['first_name'] = 'nullable|string|min:3|max:50';
            $rules['birth_date'] = 'nullable|date';
        }

        $validated = $request->validate($rules);

        $dataToUpdate = collect($validated)->except(['avatar'])->toArray();
        $targetUser->fill($dataToUpdate);

        if ($request->hasFile('avatar'))
        {
            $file = $request->file('avatar');
            $usernameFolder = $targetUser->username;

            $randomString = bin2hex(random_bytes(8));
            $timestamp = time();
            $extension = $file->getClientOriginalExtension();

            // Формат: avatar-1735689000-a1b2c3d4e5f6g7h8.jpg
            $filename = "avatar-{$timestamp}-{$randomString}.{$extension}";

            // storage/app/public/{username}/{filename}
            $path = $file->storeAs($usernameFolder, $filename, 'public');

            $targetUser->avatar = asset('storage/' . $path);
        }

        if ($request->has('finish_setup') && $request->input('finish_setup') == 1)
        {
            $targetUser->is_setup_complete = true;
        }

        if (!$targetUser->isDirty())
        {
            return response()->json([
                'status' => true,
                'message' => 'Nothing to update'
            ], 200);
        }

        $targetUser->save();
        return response()->json([
            'status' => true,
            'message' => 'Profile updated successfully'
        ]);
    }
}
