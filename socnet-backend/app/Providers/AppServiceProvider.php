<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Carbon\Carbon;

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
        VerifyEmail::createUrlUsing(function ($notifiable) {
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
    }
}
