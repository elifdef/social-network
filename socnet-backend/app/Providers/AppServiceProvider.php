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
use Illuminate\Notifications\Messages\MailMessage;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // якщо це локальне середовище розробки - завантажуємо Telescope
        if ($this->app->environment('local'))
        {
            $this->app->register(TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
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

        VerifyEmail::toMailUsing(function ($notifiable, $url)
        {
            $backendUrl = URL::temporarySignedRoute(
                'verification.verify',
                Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );

            $queryParams = parse_url($backendUrl, PHP_URL_QUERY);

            // http://localhost:5173/email-verify/{id}/{hash}?expires=...&signature=...
            $frontendUrl = env('FRONTEND_URL') . '/email-verify/' .
                $notifiable->getKey() . '/' .
                sha1($notifiable->getEmailForVerification()) .
                '?' . $queryParams;

            $locale = $notifiable->locale ?? 'en';

            app()->setLocale($locale);

            return (new MailMessage)
                ->subject(__('email.verify_subject'))
                ->markdown('emails.verify', [
                    'url' => $frontendUrl,
                    'user' => $notifiable,
                    'expireMinutes' => Config::get('auth.verification.expire', 60),
                ]);
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