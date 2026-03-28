<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'daycare_id',
        'name',
        'form_type',
        'start_time',
        'end_time',
        'capacity',
    ];

    // A section belongs to a specific daycare
    public function daycare(): BelongsTo
    {
        return $this->belongsTo(Daycare::class);
    }

    // A section has many students enrolled in it
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }
}
