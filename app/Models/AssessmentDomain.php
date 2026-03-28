<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentDomain extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'sort_order',
        'is_active',
        'max_score', // 👈 ADD THIS LINE
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'max_score' => 'integer', // 👈 Optional but good for consistency
    ];

    public function scores(): HasMany
    {
        return $this->hasMany(AssessmentScore::class, 'domain_id');
    }
}
