<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Friendship extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'friend_id', 'status'];
    const STATUS_BLOCKED = -1;
    const STATUS_NOBODY = 0;
    const STATUS_PENDING = 1;
    const STATUS_ACCEPTED = 2;
}
