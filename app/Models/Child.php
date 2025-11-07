<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'birthdate',
        'daycare_id',
    ];

    public function daycare()
    {
        return $this->belongsTo(Daycare::class);
    }
}
