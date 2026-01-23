<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // $this посилається на об'єкт User
            'username' => $this->username,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'created_at' => $this->created_at->format('d.m.Y'), // 05.01.2026
            'birth_date' => $this->birth_date,
            'is_setup_complete' => (bool)$this->is_setup_complete,
        ];
    }
}
