<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache; // Redis працює через фасад Cache
use App\Models\User;
use Carbon\Carbon;

class UpdateLastSeen
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user())
        {
            $userId = $request->user()->id;
            $key = "user-online-$userId";

            // Якщо кеш уже є то прост продовжуєм час життя
            Cache::put($key, true, 120);

            // Оновлюєм last_seen_at
            // Щоб не довбати базу кожен запит робимо це раз на 5 хвилин
            // зберігаємо час останнього оновлення БД теж у кеші
            $dbKey = "user-db-update-$userId";

            if (!Cache::has($dbKey))
            {
                User::where('id', $userId)->update(['last_seen_at' => now()]);
                Cache::put($dbKey, true, 300); // Блокуємо оновлення БД на 5 мін
            }
        }

        return $next($request);
    }
}