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
        'scaled_score',  // <--- ADD THIS IF IT IS MISSING!
        'max_score',
        'rating',
        'notes',
        'observations',
        'is_included',
    ];

    /**
     * Get the domain that owns this score.
     * This allows you to access $score->domain->name
     */
    // app/Models/AssessmentScore.php

    public function domain()
    {
        // Ensure this says 'AssessmentDomain::class', NOT 'Domain::class'
        return $this->belongsTo(AssessmentDomain::class, 'domain_id');
    }
}
