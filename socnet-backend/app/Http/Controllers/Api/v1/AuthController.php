<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    // вхід
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password))
            return response()->json([
                'status' => false,
                'message' => 'Invalid email or password'
            ], 401);

        $tokenResult = $user->createToken('auth_token');

        $tokenModel = $tokenResult->accessToken;
        $tokenModel->ip_address = $request->ip();
        $tokenModel->user_agent = $request->userAgent();
        $tokenModel->save();

        // для записування хто зайшов
        $user->loginHistories()->create([
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Login successful',
            'token' => $tokenResult->plainTextToken
        ]);
    }

    // реєстрація
    public function register(Request $request)
    {
        if (!config('features.allow_registration'))
            return response()->json([
                'status' => false,
                'message' => 'New user registration is currently suspended'
            ], 403);

        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'min:4',
                'max:32',
                'unique:users',
                'regex:/^[A-Za-z0-9_]+$/',
                Rule::notIn(config('reserved.usernames', []))
            ],
            'email' => 'required|email|unique:users',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ]
        ], [
            'username.not_in' => 'This username is reserved or not allowed.'
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        if (config('features.need_confirm_email'))
        {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'status' => true,
            'message' => 'User registered successfully. Please check your email.',
            'user_id' => $user->id
        ], 201);
    }

    // вихід з аккаунта
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}
