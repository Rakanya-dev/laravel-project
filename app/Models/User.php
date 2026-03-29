<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Fortify\TwoFactorAuthenticatable;
class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, SoftDeletes, LogsActivity, TwoFactorAuthenticatable;

    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'phone',
        'role',
        'password',
        'status',
        'daycare_id', // Both parents and teachers have this!
        'last_login_at', // 🚀 ADD THIS LINE
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes', // 👈 Add this
        'two_factor_secret',
    ];

    protected $appends = ['is_online'];

    public function getIsOnlineAttribute()
    {
        return Cache::has('user-is-online-' . $this->id);
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime', // 👈 Add this
            'last_login_at' => 'datetime',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'email', 'role', 'status', 'daycare_id', 'two_factor_confirmed_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
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

    // 🚀 RESTORED: The native Laravel relationship that makes everything work!
    public function daycare(): BelongsTo
    {
        return $this->belongsTo(Daycare::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_parent', 'parent_id', 'student_id')
            ->withPivot('relationship', 'is_primary', 'status')
            ->withTimestamps();
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'recipient_id');
    }
}
