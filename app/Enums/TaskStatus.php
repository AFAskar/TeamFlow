<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Done = 'Done';
    case Unplanned = 'Unplanned';
    case Pending = 'Pending';
    case InProgress = 'In-Progress';
}
