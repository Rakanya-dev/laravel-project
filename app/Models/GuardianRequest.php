<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuardianRequest extends Model
{
    protected $fillable = [
        'user_id',
        'student_id',
        'birth_cert_path',
        'parent_id_path',
        'status'
    ];

    // Optional: Connect relationships so the Admin can easily see WHO is applying for WHICH child
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
