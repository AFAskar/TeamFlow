<?php

namespace App\Enums;

enum Role: string
{
    case Admin = 'Admin'; // can promote and demote users
    case Manager = 'Manager'; // can create teams and remove users from the team
    case Member = 'Member'; // can join teams
}
