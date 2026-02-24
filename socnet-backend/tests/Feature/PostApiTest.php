<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\TestDox;

class PostApiTest extends TestCase
{
    use RefreshDatabase;

    #[TestDox('Користувач який ПІДТВЕРДИВ пошту МОЖЕ писати пости З ТЕКСТОМ')]
    public function test_auth_verified_user_can_create_post(): void
    {
        $user = User::factory()->create();
        $postData = ['content' => 'hi!'];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201);

        $response->assertJsonPath('content', 'hi!');

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'content' => 'hi!',
        ]);
    }

    #[TestDox('Користувач який НЕ ПІДТВЕРДИВ пошту НЕ МОЖЕ писати пости')]
    public function test_auth_no_verified_user_cannot_create_post(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $postData = ['content' => 'hi!'];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('posts', [
            'user_id' => $user->id,
            'content' => 'hi!',
        ]);
    }

    #[TestDox('Користувач який не ввійшов НЕ МОЖЕ писати пости')]
    public function test_unauth_user_cannot_create_post(): void
    {
        $postData = ['content' => 'hi'];

        $response = $this->postJson('/api/v1/posts', $postData);

        $response->assertStatus(401);

        $this->assertDatabaseMissing('posts', ['content' => 'hi']);
    }

    #[TestDox('Користувач МОЖЕ створювати пости З КАРТИНКОЮ З ТЕКСТОМ')]
    public function test_user_can_create_post_with_image(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $fakeImage = UploadedFile::fake()->image('cat.jpg', 800, 600);

        $postData = [
            'content' => 'Подивіться на мого кота!',
            'image' => $fakeImage,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'content' => 'Подивіться на мого кота!',
        ]);

        $post = Post::first();

        $this->assertNotNull($post->image);
        Storage::disk('public')->assertExists($post->image);
    }

    #[TestDox('Користувач МОЖЕ створювати пости З КАРТИНКОЮ БЕЗ ТЕКСТОМ')]
    public function test_user_can_create_post_with_image_without_text(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $fakeImage = UploadedFile::fake()->image('cat.jpg', 800, 600);

        $postData = [
            'image' => $fakeImage,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'content' => null,
        ]);

        $post = Post::first();

        $this->assertNotNull($post->image);
        Storage::disk('public')->assertExists($post->image);
    }

    #[TestDox('Користувач НЕ МОЖЕ створювати пости БЕЗ КАРТИНКИ І БЕЗ ТЕКСТУ')]
    public function test_user_can_create_post_without_image_without_text(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $postData = ['content' => null, 'image' => null];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(422);

        $this->assertDatabaseMissing('posts', [
            'user_id' => $user->id,
            'content' => null,
        ]);
    }

    #[TestDox('Користувач МОЖЕ оновлювати пости')]
    public function test_auth_user_update_post(): void
    {
        $user = User::factory()->create();

        $postData = ['content' => 'hi!'];
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201);
        $postId = $response->json('id');
        $newData = [
            'content' => 'hello',
            '_method' => 'PUT'
        ];

        $updateResponse = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/posts/{$postId}", $newData);

        $updateResponse->assertStatus(200);
        $updateResponse->assertJsonPath('content', 'hello');

        $this->assertDatabaseHas('posts', [
            'id' => $postId,
            'user_id' => $user->id,
            'content' => 'hello',
        ]);
    }

    #[TestDox('Користувач НЕ МОЖЕ редагувати ЧУЖИЙ пост')]
    public function test_user_cannot_update_not_own_post(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $postData = ['content' => 'hi!'];

        $response = $this->actingAs($userA, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201);

        $response->assertJsonPath('content', 'hi!');

        $postId = $response->json('id');

        $this->assertDatabaseHas('posts', [
            'id' => $postId,
            'user_id' => $userA->id,
            'content' => 'hi!',
        ]);

        $newData = [
            'content' => 'hello',
            '_method' => 'PUT'
        ];

        $updateResponse = $this->actingAs($userB, 'sanctum')
            ->postJson("/api/v1/posts/{$postId}", $newData);

        $updateResponse->assertStatus(403);

        $this->assertDatabaseHas('posts', [
            'id' => $postId,
            'user_id' => $userA->id,
            'content' => 'hi!',
        ]);
    }

    #[TestDox('Користувач НЕ МОЖЕ оновлювати пост БЕЗ КАРТИНКИ І БЕЗ ТЕКСТУ')]
    public function test_user_cannot_update_post_without_image_without_text(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $postData = ['content' => 'hi!'];
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201);
        $postId = $response->json('id');

        $postData = ['_method' => 'PUT', 'content' => null, 'image' => null];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/posts/$postId", $postData);

        $response->assertStatus(422);

        $this->assertDatabaseMissing('posts', [
            'user_id' => $user->id,
            'content' => null,
        ]);
    }

    #[TestDox('Користувач МОЖЕ видалити СВІЙ пост')]
    public function test_user_can_delete_own_post(): void
    {
        $user = User::factory()->create();
        $postData = ['content' => 'hi!'];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201);

        $response->assertJsonPath('content', 'hi!');

        $this->assertDatabaseHas('posts', [
            'user_id' => $user->id,
            'content' => 'hi!',
        ]);

        $postId = $response->json('id');

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/posts/$postId");

        $response->assertStatus(202);

        $this->assertDatabaseMissing('posts', [
            'user_id' => $user->id,
            'content' => 'hi!',
        ]);
    }

    #[TestDox('Користувач НЕ МОЖЕ видалити ЧУЖИЙ пост')]
    public function test_user_cannot_delete_not_own_post(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $postData = ['content' => 'hi!'];

        $response = $this->actingAs($userA, 'sanctum')
            ->postJson('/api/v1/posts', $postData);

        $response->assertStatus(201);

        $response->assertJsonPath('content', 'hi!');

        $postId = $response->json('id');

        $this->assertDatabaseHas('posts', [
            'id' => $postId,
            'user_id' => $userA->id,
            'content' => 'hi!',
        ]);

        $response = $this->actingAs($userB, 'sanctum')
            ->deleteJson("/api/v1/posts/$postId");

        $response->assertStatus(403);

        $this->assertDatabaseHas('posts', [
            'id' => $postId,
            'user_id' => $userA->id,
            'content' => 'hi!',
        ]);
    }
}