<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('chats', function (Blueprint $table)
        {
            $table->id();
            $table->string('slug', 20)->unique();
            // private або group
            $table->string('type')->default('private');

            // ключ цього чату (DEK)
            $table->text('encrypted_dek');

            $table->timestamps();
            $table->index('updated_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('chats');
    }
};