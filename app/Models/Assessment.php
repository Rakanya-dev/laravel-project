<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// 👇 1. Import Logging Classes
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Assessment extends Model
{
    // 👇 2. Add LogsActivity
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'student_id',
        'teacher_id',
        'daycare_id',
        'assessment_date',
        'assessment_type',
        'status',
        'school_year',
        'semester',
        'overall_score',
        'overall_rating',
        'overall_notes',
        'recommendations',
        'next_assessment_date',
        'teacher_comments',
        'strengths',
        'areas_for_improvement',
        'completed_at',
        'reviewed_by',
        'reviewed_at',
        'parent_viewed_at',
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'next_assessment_date' => 'date',
        'completed_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'parent_viewed_at' => 'datetime',
        'overall_score' => 'decimal:2',
    ];

    // 👇 3. Define Logging Options
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'overall_score', 'overall_rating', 'recommendations'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Assessment record has been {$eventName}");
    }

    // ... (Existing Relationships) ...
    public function scores(): HasMany
    {
        return $this->hasMany(AssessmentScore::class, 'assessment_id');
    }
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
    public function daycare(): BelongsTo
    {
        return $this->belongsTo(Daycare::class);
    }
}
