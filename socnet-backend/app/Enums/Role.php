<?php

namespace App\Enums;

enum Role: int
{
    case User = 0;
    case Support = 1;
    case Moderator = 2;
    case Admin = 3;
}