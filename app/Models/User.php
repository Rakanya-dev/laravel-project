<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

// 1. Import Logging Classes
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    // 2. Add LogsActivity Trait
    use HasFactory, Notifiable, SoftDeletes, LogsActivity;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'phone',
        'role',
        'password',
        'status',
        'daycare_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // 3. Define Logging Options
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            // Log these fields when they change
            ->logOnly(['first_name', 'last_name', 'email', 'role', 'status', 'daycare_id'])
            // Only create a log if the value actually changed
            ->logOnlyDirty()
            // Prevent empty logs if nothing changed
            ->dontSubmitEmptyLogs()
            // Custom description: "User account has been updated"
            ->setDescriptionForEvent(fn(string $eventName) => "User account has been {$eventName}");
    }

    public function getFullNameAttribute(): string
    {
        return implode(' ', array_filter([$this->first_name, $this->middle_name, $this->last_name]));
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
    public function isTeacher()
    {
        return $this->role === 'teacher';
    }
    public function isParent()
    {
        return $this->role === 'parent';
    }
    public function daycare(): BelongsTo
    {
        return $this->belongsTo(Daycare::class);
    }
    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_parent', 'parent_id', 'student_id')->withPivot('relationship', 'is_primary');
    }
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'recipient_id');
    }
}
