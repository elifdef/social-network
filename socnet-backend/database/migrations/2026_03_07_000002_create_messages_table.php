<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');

            $table->string('shared_post_id')->nullable();
            $table->foreign('shared_post_id')->references('id')->on('posts')->onDelete('set null');
            $table->foreignId('reply_to_id')->nullable()->constrained('messages')->onDelete('set null');

            $table->text('encrypted_payload');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_edited')->default(false);

            $table->timestamps();

            $table->index(['chat_id', 'created_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('messages');
    }
};