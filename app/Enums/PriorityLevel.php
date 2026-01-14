<?php

namespace App\Enums;

enum PriorityLevel: string
{
    case Low = 'Low';
    case Medium = 'Medium';
    case High = 'High';
    case Critical = 'Critical';
}
