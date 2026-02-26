<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginHistory extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['user_id', 'ip_address', 'user_agent', 'created_at'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
