<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnrollmentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_id', // 🚀 NEW: Added this!
        'daycare_id',
        'first_name',
        'middle_name',
        'last_name',
        'date_of_birth',
        'gender',
        'birth_cert_path',
        'parent_id_path',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    // Connects to the Parent
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Connects to the Daycare they applied to
    public function daycare()
    {
        return $this->belongsTo(Daycare::class);
    }
}
