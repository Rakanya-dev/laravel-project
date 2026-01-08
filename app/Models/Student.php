<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

// 1. Import Logging Classes
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Student extends Model
{
    // 2. Add LogsActivity
    use SoftDeletes, LogsActivity;

    protected $fillable = [
        'daycare_id',
        'student_id',
        'first_name',
        'last_name',
        'middle_name',
        'nickname',
        'date_of_birth',
        'gender',
        'age_years',
        'profile_photo',
        'status',
        'access_code',
        'notes'
    ];

    // 3. Define Logging Options
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'status', 'daycare_id', 'access_code'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Student profile has been {$eventName}");
    }

    // ... (Existing Relationships) ...
    public function daycare(): BelongsTo
    {
        return $this->belongsTo(Daycare::class);
    }
    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_parent', 'student_id', 'parent_id')->where('role', 'parent')->withPivot(['relationship', 'is_primary', 'status']);
    }
    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }
}
