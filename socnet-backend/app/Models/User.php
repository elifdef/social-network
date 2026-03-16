<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\Role;
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable, HasApiTokens, HasFactory;

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
        'country',
        'gender',
        'is_muted',
        'is_banned'
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

    const defaultAvatar = "/defaultAvatar.jpg"; // bill gates mugshot
    const bannedAvatar = "/blockedAvatar.jpg"; // hacker
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
            'role' => Role::class,
        ];
    }

    protected static function booted()
    {
        static::creating(function ($user)
        {
            // Якщо в конфігу підтвердження НЕ потрібне
            if (!config('features.need_confirm_email'))
            {
                $user->email_verified_at = now();
            }
        });
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: function ()
            {
                // якщо забанений
                if ($this->is_banned)
                    return self::bannedAvatar;

                return $this->avatar ? asset('storage/' . $this->avatar) : self::defaultAvatar;
            }
        );
    }

    /**
     * Перевірка для того, щоб заблокований не може бачити пости блокувальника.
     * Але гості можуть бачити)00)) Тому це обходиться приватною вкладкою.
     *
     * @param int $viewerId
     * @param int $targetId
     * @return bool
     */
    public function isBlockedByTarget(int $viewerId, int $targetId): bool
    {
        if ($viewerId === $targetId) return false;
        return Friendship::where('user_id', $targetId)
            ->where('friend_id', $viewerId)
            ->where('status', Friendship::STATUS_BLOCKED)
            ->exists();
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

    public function getIsOnlineAttribute()
    {
        return Cache::has('user-online-' . $this->id);
    }

    // для статистики
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function loginHistories()
    {
        return $this->hasMany(LoginHistory::class)->latest('created_at');
    }

    public function moderationLogs()
    {
        return $this->hasMany(ModerationLog::class)->latest();
    }

    /* генерація власного кольору для профілю */
    public function personalization()
    {
        return $this->hasOne(UserPersonalization::class)->withDefault(function ($personalization, $user)
        {
            // Математична генерація унікального HSL-градієнта на основі ID
            $id = $user->id ?? rand(1, 9999);
            $hue1 = ($id * 137.5) % 360; // 137.5 - кут золотого перетину
            $hue2 = ($hue1 + 60) % 360;  // Зсув на 60 градусів для красивого переходу

            $personalization->banner_color = "linear-gradient(135deg, hsl({$hue1}, 70%, 50%), hsl({$hue2}, 80%, 50%))";
            $personalization->banner_image = null;
            $personalization->username_color = null;
        });
    }

    /* активність користувача */
    public function activities()
    {
        return $this->hasMany(UserActivity::class);
    }
}
