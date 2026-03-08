<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;

class ChatEncryptionService
{
    public static function generateEncryptedChatKey(): string
    {
        return Crypt::encryptString(Str::random(32));
    }

    public static function encryptPayload(array $data, string $encryptedChatKey): string
    {
        $chatKey = Crypt::decryptString($encryptedChatKey);
        $jsonPayload = json_encode($data);

        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted = openssl_encrypt($jsonPayload, 'aes-256-cbc', $chatKey, 0, $iv);

        return base64_encode($encrypted . '::' . base64_encode($iv));
    }

    public static function decryptPayload(string $encryptedPayload, string $encryptedChatKey): ?array
    {
        try
        {
            $chatKey = Crypt::decryptString($encryptedChatKey);
            $decoded = base64_decode($encryptedPayload);
            list($encryptedData, $ivEncoded) = explode('::', $decoded, 2);

            $decryptedJson = openssl_decrypt($encryptedData, 'aes-256-cbc', $chatKey, 0, base64_decode($ivEncoded));
            return json_decode($decryptedJson, true);
        } catch (\Exception $e)
        {
            return ['text' => 'Message unreadable', 'files' => []];
        }
    }
}