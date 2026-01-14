<?php

namespace App\Enums;

enum TeamRole: string
{
    case Owner = 'Owner'; // who created the team
    case Admin = 'Admin'; // who can invite and remove people from the team
    case Member = 'Member'; // no extra permissions
}
