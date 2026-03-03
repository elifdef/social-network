<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Resources\PublicUserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Services\FileStorageService;

class UserController extends Controller
{
    protected $fileService;

    public function __construct(FileStorageService $fileService)
    {
        $this->fileService = $fileService;
    }

    /**
     * Вивід базових данних ВСІХ користувачів 
     * З пагінацією 20 юзерів на сторінку
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
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
        $currentUser = User::where('username', $username)->firstOrFail();
        return (new PublicUserResource($currentUser))->resolve();
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
            'avatar' => 'nullable|image|max:' . config('uploads.max_size'),
            'country' => 'nullable|string|size:2|alpha',
            'gender' => 'nullable|integer|in:1,2'
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

        $targetUser->fill(collect($validated)->except(['avatar'])->toArray());

        if ($request->hasFile('avatar'))
        {
            $path = $this->fileService->upload(
                file: $request->file('avatar'),
                folder: $targetUser->username,
                prefix: 'avatar'
            );

            $targetUser->avatar = $path;
        }

        if ($request->has('finish_setup') && $request->input('finish_setup'))
            $targetUser->is_setup_complete = true;

        if (!$targetUser->isDirty())
            return response()->json(['status' => true, 'message' => 'Nothing to update'], 418);

        $targetUser->save();
        return response()->json([
            'status' => true,
            'message' => 'Profile updated successfully'
        ]);
    }

    public function updateEmail(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', Rule::unique('users')->ignore($request->user()->id)],
            'password' => ['required'], // пароль для підтвердження
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password))
        {
            return response()->json([
                'status' => false,
                'message' => 'Invalid password'
            ], 422);
        }

        // оновлення пошти
        $user->email = $request->email;
        $user->email_verified_at = null; // обнуляєм верифікацію для старої пошти
        $user->save();

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email changed. Please confirm your new address.']);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->letters()->mixedCase()->numbers()->symbols()
            ],
        ]);

        $request->user()->update(['password' => Hash::make($validated['password'])]);
        return response()->json([
            'status' => true,
            'message' => 'Password has been changed.'
        ]);
    }
}