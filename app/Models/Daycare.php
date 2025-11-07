<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Daycare extends Model
{
    //
    protected $fillable = [
        'daycare_name',
        'address',
        'contact_person',
        'contact_number',
    ];

}
