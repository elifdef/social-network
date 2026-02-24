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
        Schema::create('friendships', function (Blueprint $table)
        {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // той хто надсилає
            $table->foreignId('friend_id')->constrained('users')->cascadeOnDelete(); // той хто отримує
            $table->string('status', 20)->index();
            $table->unique(['user_id', 'friend_id']);
            $table->index('friend_id'); // для підрахування кількості друзів
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('friendships');
    }
};
