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
            $table->text('content')->nullable();
            $table->json('entities')->nullable();
            $table->string('original_post_id')->nullable();

            $table->timestamps();
            $table->index('user_id');
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