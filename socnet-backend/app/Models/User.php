<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Cache;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'first_name',
        'last_name',
        'avatar',
        'birth_date',
        'bio',
        'country_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_setup_complete' => 'boolean',
        ];
    }

    /*
     * friendsOfMine (Мої друзі / Я ініціатор)
        user_id = Я
        friend_id = Інший
        Використання: Коли я кидаю заявку (я чийсь підписник).

     * friendOf (Друг когось / Мене додали)
        user_id = Інший
        friend_id = Я
        Використання: Коли мені кидають заявку (підписники).
    */

    // звязок де Я кинув заявку
    public function friendsOfMine()
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id');
    }

    // звязок де МЕНЕ додали
    public function friendOf()
    {
        return $this->belongsToMany(User::class, 'friendships', 'friend_id', 'user_id');
    }

    // звязок country_id з users до id в countries
    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function getIsOnlineAttribute()
    {
        return Cache::has('user-online-' . $this->id);
    }

    public function posts()
    {
        // Один юзер має багато постів
        return $this->hasMany(Post::class);
    }
}
