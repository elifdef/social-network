<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function ()
{
    return response()->json([
        'name' => 'SocNet api',
        'status' => 'running',
        'version' => '1.0'
    ]);
});