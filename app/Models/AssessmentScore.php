<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'domain_id',
        'score',
        'max_score',
        'rating',
        'notes',
        'observations',
    ];

    /**
     * Get the domain that owns this score.
     * This allows you to access $score->domain->name
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(AssessmentDomain::class, 'domain_id');
    }
}
