<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

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
        'country_id',
        'gender'
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

    const GENDER_MALE = 1;
    const GENDER_FEMALE = 2;

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

    // заявки які Я кинув
    public function sentFriendships()
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id')
            ->withPivot('status');
    }

    // заявки які МЕНІ прийшли
    public function receivedFriendships()
    {
        return $this->belongsToMany(User::class, 'friendships', 'friend_id', 'user_id')
            ->withPivot('status');
    }

    // отримання ID друзів
    public function getAllFriendIds(): Collection
    {
        $initiated = $this->sentFriendships()->wherePivot('status', Friendship::STATUS_ACCEPTED)->pluck('users.id');
        $received = $this->receivedFriendships()->wherePivot('status', Friendship::STATUS_ACCEPTED)->pluck('users.id');

        return $initiated->merge($received)->unique();
    }

    // отримання статусу дружби між двома користувачами
    public function getFriendshipStatusWith(?User $currentUser): string
    {
        if (!$currentUser || $currentUser->id === $this->id)
            return 'none';

        $friendship = Friendship::between($this, $currentUser)->first();

        if (!$friendship) return 'none';

        if ($friendship->status === Friendship::STATUS_ACCEPTED) return 'friends';

        if ($friendship->status === Friendship::STATUS_PENDING)
            return $friendship->user_id === $currentUser->id ? 'pending_sent' : 'pending_received';

        if ($friendship->status === Friendship::STATUS_BLOCKED)
            return $friendship->user_id === $currentUser->id ? 'blocked_by_me' : 'blocked_by_target';

        return 'none';
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
