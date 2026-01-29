<?php

namespace App\Http\Controllers\Api\v1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;

class VerificationController extends Controller
{
    public function verify(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Перевірка підпису
        if (!$request->hasValidSignature())
            return response()->json(['message' => 'The link is invalid or expired.'], 403);

        // Якщо вже підтверджено
        if ($user->hasVerifiedEmail())
            return response()->json(['message' => 'The mail has already been verified.'], 200);

        // Підтвердження
        if ($user->markEmailAsVerified())
            event(new Verified($user));

        return response()->json(['message' => 'Email successfully confirmed!'], 200);
    }
}