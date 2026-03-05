<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table)
        {
            $table->string('id')->primary();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->foreignId('target_user_id')->nullable()->constrained('users')->onDelete('cascade');

            $table->text('content')->nullable();
            $table->json('entities')->nullable();
            $table->string('original_post_id')->nullable();
            $table->boolean('is_repost')->default(false);
            $table->timestamps();

            $table->index('user_id');
            $table->index('target_user_id');
            $table->index('created_at');
        });

        Schema::table('posts', function (Blueprint $table)
        {
            $table->foreign('original_post_id')
                ->references('id')
                ->on('posts')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};