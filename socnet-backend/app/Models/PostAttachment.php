<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostAttachment extends Model
{
    protected $fillable = [
        'post_id',
        'type',
        'file_path',
        'sort_order',
        'file_name',
        'original_name',
        'file_size'
    ];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}