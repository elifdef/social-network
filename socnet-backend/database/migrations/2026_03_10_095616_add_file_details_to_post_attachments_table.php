<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('post_attachments', function (Blueprint $table)
        {
            $table->string('file_name')->nullable()->after('file_path');
            $table->string('original_name')->nullable()->after('file_name');
            $table->unsignedBigInteger('file_size')->nullable()->after('original_name');
        });
    }

    public function down(): void
    {
        Schema::table('post_attachments', function (Blueprint $table)
        {
            $table->dropColumn(['file_name', 'original_name', 'file_size']);
        });
    }
};