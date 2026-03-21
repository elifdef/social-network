<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table)
        {
            $table->string('uid', 15)->nullable()->after('id');
        });

        DB::table('comments')->whereNull('uid')->orderBy('id')->chunk(100, function ($comments)
        {
            foreach ($comments as $comment)
            {
                DB::table('comments')
                    ->where('id', $comment->id)
                    ->update(['uid' => Str::random(12)]);
            }
        });

        Schema::table('comments', function (Blueprint $table)
        {
            $table->string('uid', 15)->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table)
        {
            $table->dropColumn('uid');
        });
    }
};