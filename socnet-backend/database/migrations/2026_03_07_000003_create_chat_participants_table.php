<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('chat_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // ID останнього прочитаного повідомлення
            $table->foreignId('last_read_message_id')->nullable()->constrained('messages')->onDelete('set null');

            $table->timestamps();

            // юзер не може бути доданий в один і той самий чат двічі
            $table->unique(['chat_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('chat_participants');
    }
};
