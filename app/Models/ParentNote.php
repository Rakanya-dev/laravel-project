<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParentNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'parent_id',
        'note_date',
        'subject',
        'content',
        'is_read',
        'read_at'
    ];

    protected $casts = [
        'note_date' => 'date',
        'is_read' => 'boolean',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }
}
