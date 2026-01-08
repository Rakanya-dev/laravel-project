<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Daycare extends Model
{
    use SoftDeletes;

    // --- 1. CORRECT FILLABLE FIELDS (Matches Final Migration) ---
    protected $fillable = [
        'name',
        'address',
        'city',
        'province',
        'postal_code',
        'phone',
        'email',
        'principal_name',
        'license_number',
        'capacity',
        'current_enrollment',
        'status',
        'established_date',
        'description',
    ];

    protected $casts = [
        'established_date' => 'date',
        'capacity' => 'integer',
        'current_enrollment' => 'integer',
    ];

    // --- 2. RELATIONSHIPS (Required by Controllers) ---

    /**
     * Get the users (teachers/parents/admin) associated with the daycare.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the students enrolled in the daycare.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Student::class);
    }

}
