<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Carbon\Carbon;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request)
        {
            // якщо локалка то без обмежень
            if (app()->environment('local'))
                return Limit::perMinute(100000)->by($request->user()?->id ?: $request->ip());

            // якщо прод - 180 запитів
            return Limit::perMinute(180)->by($request->user()?->id ?: $request->ip());
        });

        VerifyEmail::createUrlUsing(function ($notifiable)
        {
            $backendUrl = URL::temporarySignedRoute(
                'verification.verify',
                Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)), // година часу
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );

            $queryParams = parse_url($backendUrl, PHP_URL_QUERY);

            // http://localhost:5173/email-verify/{id}/{hash}?expires=...&signature=...
            return 'http://localhost:5173/email-verify/' .
                $notifiable->getKey() . '/' .
                sha1($notifiable->getEmailForVerification()) .
                '?' . $queryParams;
        });

        // права доступу
        Gate::define('delete-any-content', function (User $user)
        {
            // видаляти пости/коментарі можуть Модератори та Адміни
            return in_array($user->role, [Role::Moderator, Role::Admin]);
        });

        Gate::define('edit-any-content', function (User $user)
        {
            // редагувати БУДЬ-ЯКІ пости можуть тільки Адміни
            return $user->role === Role::Admin;
        });

        Gate::define('manage-users', function (User $user)
        {
            // банити мутити юзерів можуть модератори та адміни
            return $user->role->value >= Role::Moderator->value;
        });
    }
}
