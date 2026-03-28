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
        'section_id',
        'student_id',
        'first_name',
        'last_name',
        'middle_name',
        'nickname',
        'date_of_birth',
        'gender',
        'age_years',
        'age_months',
        'profile_photo',
        'status',
        'access_code',
        'notes'
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = ['is_graduating', 'enrollment_status', 'age']; // 🚀 Added 'age' so it's available in React

    // 🚀 FIX 1: Unified into the modern Laravel 11 casts method
    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date:Y-m-d',
        ];
    }

    // 3. Define Logging Options
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'status', 'daycare_id', 'access_code'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Student profile has been {$eventName}");
    }

    // --- Relationships ---

    public function daycare(): BelongsTo
    {
        return $this->belongsTo(Daycare::class);
    }

    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_parent', 'student_id', 'parent_id')
            ->where('role', 'parent')
            ->withPivot(['relationship', 'is_primary', 'status']);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    // --- Accessors (Calculated Attributes) ---

    public function getAgeAttribute()
    {
        // If date_of_birth is null (or wasn't selected in the query), return null safely.
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    /**
     * Logic: If they have completed the 3rd Assessment AND are old enough, they are ready to graduate.
     */
    public function getIsGraduatingAttribute()
    {
        // 🚀 FIX 2: Safe check for null birthdate
        if (!$this->date_of_birth) {
            return false;
        }

        // 1. Check if they have a completed 3rd Assessment
        $hasFinalAssessment = $this->assessments()
            ->where('assessment_type', '3rd Assessment')
            ->where('status', 'Completed')
            ->exists();

        // 2. Calculate exact age TODAY using Carbon (Not the static DB column)
        $ageInYears = $this->date_of_birth->age;
        $isOldEnough = $ageInYears >= 4;

        return $hasFinalAssessment && $isOldEnough;
    }

    /**
     * Smart Status: Overrides the database status for display logic
     */
    public function getEnrollmentStatusAttribute(): string
    {
        if ($this->deleted_at) {
            return 'Archived';
        }

        if ($this->is_graduating) {
            return 'Completed';
        }

        return $this->status ?? 'Active';
    }

    // --- Model Events (The Global Safety Net) ---
    protected static function booted()
    {
        // 1. Listen for when a student's record is updated (e.g., status changed to Graduated)
        static::updated(function ($student) {
            if ($student->isDirty('status') && in_array($student->status, ['Completed', 'Graduated', 'Inactive'])) {
                $student->deactivateEmptyNesterParents();
            }
        });

        // 2. Listen for when a student is Archived (Soft Deleted)
        static::deleted(function ($student) {
            $student->deactivateEmptyNesterParents();
        });
    }


    /**
     * Helper logic to safely deactivate parents who no longer have active kids.
     */
    public function deactivateEmptyNesterParents()
    {
        // Loop through all parents attached to this student
        foreach ($this->parents as $parent) {

            // Does this parent have ANY other kids who are still active and not deleted?
            $hasActiveKids = $parent->students()
                ->where('students.id', '!=', $this->id) // Ignore the kid we just graduated/deleted
                ->whereNull('students.deleted_at')       // Ensure sibling isn't archived (This one is correct!)
                ->where(function ($query) {
                    $query->where('students.status', 'Active')
                        ->orWhereNull('students.status'); // Treat null as Active
                })
                ->exists();

            // If no active kids remain, lock the parent's account
            if (!$hasActiveKids && $parent->status !== 'Inactive') {
                $parent->update(['status' => 'Inactive']);

                // Optional: Log it so Admins know why it happened
                activity()
                    ->performedOn($parent)
                    ->log("Parent auto-deactivated because their last active child ({$this->first_name}) was archived or graduated.");
            }
        }
    }
}
