<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'generated_by',
        'report_type',
        'report_date',
        'content',
        'file_path',
    ];

    protected $casts = [
        'report_date' => 'date',
        'content' => 'array',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
