<?php

namespace App\Enums;

enum ProjectRole: string
{
    case Lead = 'Lead';
    case TechnicalLead = 'Technical Lead';
    case Member = 'Member';
}
