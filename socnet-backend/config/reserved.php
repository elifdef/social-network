<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Заборонені юзернейми (Blacklist)
    |--------------------------------------------------------------------------
    | Ці слова не можна використовувати як username при реєстрації.
    |
    */
    'usernames' => [
        // Системні сторінки
        'login', 'register', 'setup-profile', 'post', 'rules', 'friends',
        'messages', 'email-verify', 'settings', 'notifications', 'activity',
        'support', 'moderation', 'home', 'index', 'about', 'contact', 'search',

        // Системні шляхи
        'api', 'storage', 'public', 'broadcasting', 'sanctum', 'vendor',

        // Адміністративні
        'admin', 'administrator', 'root', 'sysadmin', 'system', 'moderator', 'support',

        // власні
        'pewdiepie'
    ],
];