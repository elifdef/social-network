<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
        {
            return response()->json([
                'status' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }
        $user->tokens()->where('name', 'auth_token')->delete();
        $tokenResult = $user->createToken('auth_token');

        $tokenModel = $tokenResult->accessToken;
        $tokenModel->ip_address = $request->ip();
        $tokenModel->user_agent = $request->userAgent();
        $tokenModel->save();

        return response()->json([
            'status' => true,
            'message' => 'Login successful',
            'token' => $tokenResult->plainTextToken
        ], 200);
    }

    // реєстрація
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|min:4|max:32|unique:users|regex:/^[A-Za-z0-9_]+$/',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed'
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => $validated['password']
        ]);

        return response()->json([
            'status' => true,
            'message' => 'User registered successfully',
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
        ], 200);
    }
}
