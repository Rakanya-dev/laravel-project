<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EccdScoringService
{
    /**
     * 🚀 UPDATED: Now queries the `eccd_scale_rules` database table using domain_id!
     */
    public function getScaledScore(int $domainId, int|float $rawScore, int $ageYears, int $ageMonths): int
    {
        $totalMonths = ($ageYears * 12) + $ageMonths;

        // ITED Logic: Strictly Under 36 months
        if ($totalMonths < 36) {
            return (int) $rawScore;
        }

        // 1. Check if this domain even has rules (Supplemental Domain Safeguard)
        $domainHasRules = DB::table('eccd_scale_rules')->where('domain_id', $domainId)->exists();
        if (!$domainHasRules) {
            return (int) $rawScore; // Custom domains just return raw score
        }

        // 2. Find the exact matching rule for this age and score
        $rule = DB::table('eccd_scale_rules')
            ->where('domain_id', $domainId)
            ->where('min_months_age', '<=', $totalMonths)
            ->where('max_months_age', '>=', $totalMonths)
            ->where('min_raw_score', '<=', $rawScore)
            ->where('max_raw_score', '>=', $rawScore)
            ->first();

        if ($rule) {
            return $rule->scaled_score;
        }

        // 3. Ceiling fix: If score is higher than the max rule, give them the max scaled score
        $maxRule = DB::table('eccd_scale_rules')
            ->where('domain_id', $domainId)
            ->where('min_months_age', '<=', $totalMonths)
            ->where('max_months_age', '>=', $totalMonths)
            ->orderBy('max_raw_score', 'desc')
            ->first();

        if ($maxRule && $rawScore > $maxRule->max_raw_score) {
            return $maxRule->scaled_score;
        }

        return 1; // Lowest possible if something goes weird
    }

    /**
     * 🚀 UPDATED: Now queries the `eccd_standard_rules` database table!
     */
    public function getStandardScore(int $sumOfScaledScores): int
    {
        if ($sumOfScaledScores == 0) return 0;

        $match = DB::table('eccd_standard_rules')
            ->where('sum_scaled_score', $sumOfScaledScores)
            ->first();

        if ($match) {
            return $match->standard_score;
        }

        // Dynamic Floor / Ceiling based on what the database actually has
        $minRule = DB::table('eccd_standard_rules')->orderBy('sum_scaled_score', 'asc')->first();
        $maxRule = DB::table('eccd_standard_rules')->orderBy('sum_scaled_score', 'desc')->first();

        if ($minRule && $sumOfScaledScores < $minRule->sum_scaled_score) {
            return $minRule->standard_score ?? 69;
        }
        if ($maxRule && $sumOfScaledScores > $maxRule->sum_scaled_score) {
            return $maxRule->standard_score ?? 138;
        }

        return 69;
    }

    // --- INTERPRETATIONS ---

    public function getItedDomainInterpretation($score, $max)
    {
        if ($max <= 0) return 'N/A';
        $percentage = ($score / $max) * 100;
        if ($percentage >= 90) return 'Highly Proficient';
        if ($percentage >= 75) return 'Proficient';
        if ($percentage >= 50) return 'Developing';
        return 'Needs Monitoring';
    }

    public function getEccdDomainInterpretation($scaledScore)
    {
        if ($scaledScore == 0) return 'N/A';
        if ($scaledScore <= 3) return 'Significant Delay in Development';
        if ($scaledScore <= 6) return 'Slight Delay in Development';
        if ($scaledScore <= 13) return 'Average Development';
        if ($scaledScore <= 16) return 'Slightly Advanced Development';
        return 'Highly Advanced Development';
    }

    public function getOverallInterpretation($score, $ageYears, $ageMonths, $totalMax = 0)
    {
        $totalMonths = ($ageYears * 12) + $ageMonths;

        // ITED (0-3 years)
        if ($totalMonths <= 36) {
            if ($totalMax == 0) return 'Incomplete';
            $percentage = ($score / $totalMax) * 100;
            if ($percentage >= 90) return 'Advanced Development';
            if ($percentage >= 75) return 'On Track';
            if ($percentage >= 50) return 'Monitor Progress';
            return 'Needs Intervention';
        }

        // ECCD (3-5 years)
        if ($score == 0) return 'Not Started';
        if ($score <= 69) return 'Significant Delay in Development';
        if ($score <= 79) return 'Slight Delay in Development';
        if ($score <= 119) return 'Average Development';
        if ($score <= 129) return 'Slightly Advanced Development';
        return 'Highly Advanced Development';
    }

    public function calculateNextDueDate(int $score, string $assessmentDate, int $ageYears): ?string
    {
        if ($score <= 0) return null;
        $date = Carbon::parse($assessmentDate);
        if ($ageYears < 3) {
            return ($score < 75) ? $date->addMonths(3)->toDateString() : $date->addMonths(6)->toDateString();
        }
        if ($score <= 69) return $date->addMonths(3)->toDateString();
        if ($score <= 79) return $date->addMonths(6)->toDateString();
        return $date->addYear()->toDateString();
    }
}
