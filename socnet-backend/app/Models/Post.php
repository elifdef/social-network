<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Post extends Model
{
    protected $fillable = ['user_id', 'target_user_id', 'content', 'image', 'original_post_id', 'is_repost', 'entities'];
    protected $keyType = 'string';
    public $incrementing = false;
    protected $casts = [
        'entities' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model)
        {
            if (empty($model->id))
                $model->id = Str::lower(Str::random(16));
        });
    }

    // звязок з автором
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    // чи лайкнув пост конкретний юзер
    public function isLikedBy(User $user)
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    /**
     * пост може бути репостом ІНШОГО поста.
     */
    public function originalPost()
    {
        return $this->belongsTo(Post::class, 'original_post_id');
    }

    /**
     * звязок з власником стіни, на якій написаний пост
     */
    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    /**
     * у поста може бути багато репостів
     */
    public function reposts()
    {
        return $this->hasMany(Post::class, 'original_post_id');
    }

    /**
     * вкладення
     */
    public function attachments()
    {
        return $this->hasMany(PostAttachment::class);
    }

    /**
     * голосування/вікторина
     */
    public function pollVotes()
    {
        return $this->hasMany(PollVote::class);
    }
}