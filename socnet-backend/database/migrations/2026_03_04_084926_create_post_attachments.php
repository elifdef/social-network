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
        Schema::create('post_attachments', function (Blueprint $table)
        {
            $table->id();
            $table->string('post_id');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->string('type', 20); // Тип: 'image', 'video', 'audio', 'document'
            $table->string('file_path');
            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_attachments');
    }
};