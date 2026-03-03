<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function ()
{
    return response()->json([
        'name' => 'SocNet API',
        'status' => 'running',
        'version' => '1.0'
    ]);
});