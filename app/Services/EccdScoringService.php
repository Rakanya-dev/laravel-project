<?php

namespace App\Services;

use Carbon\Carbon;

class EccdScoringService
{
    /**
     * Get the Scaled Score based on Domain, Raw Score, and Child's Age.
     * Supports both ITED (0-3y) and ECCD (3-5y).
     */
    public function getScaledScore(string $domainName, int|float $rawScore, int $ageYears, int $ageMonths): int
    {
        $totalMonths = ($ageYears * 12) + $ageMonths;

        // 🚀 ITED Logic: Strictly Under 37 months (up to 3 years, 0 months)
        if ($totalMonths <= 36) {
            // For ITED, the "Scaled Score" is simply the raw count of milestones passed.
            return (int) $rawScore;
        }

        // 🚀 ECCD Logic: 37 months and above (3 years, 1 month+)
        $isGroup3_4 = ($totalMonths >= 37 && $totalMonths <= 48); // 3.1 to 4.0
        $isGroup4_5 = ($totalMonths >= 49); // 4.1+

        // Normalized domain keys to match your DB and Table order
        $map = [
            'Gross Motor' => 0,
            'Fine Motor' => 1,
            'Self-Help' => 2,
            'Receptive Language' => 3,
            'Expressive Language' => 4,
            'Cognitive' => 5,
            'Socio-Emotional' => 6,
        ];

        $colIndex = $map[$domainName] ?? null;
        if ($colIndex === null)
            return 0;

        // --- TABLE 1: Ages 3.1 - 4.0 Years ---
        $table3_4 = [
            1 => [[0, 3], null, [0, 9], null, [0, 2], null, [0, 9]],
            2 => [[4, 4], [0, 3], [10, 10], null, null, null, [10, 11]],
            3 => [[5, 5], null, [11, 11], [0, 1], [3, 3], [0, 0], [12, 12]],
            4 => [null, [4, 4], [12, 12], null, [4, 4], [1, 1], [13, 13]],
            5 => [[6, 6], [5, 5], [13, 14], [2, 2], null, [2, 3], [14, 14]],
            6 => [[7, 7], null, [15, 15], null, [5, 5], [4, 4], [15, 15]],
            7 => [[8, 8], [6, 6], [16, 16], [3, 3], null, [5, 5], [16, 16]],
            8 => [[9, 9], null, [17, 17], null, [6, 6], [6, 6], [17, 18]],
            9 => [null, [7, 7], [18, 19], null, null, [7, 7], [19, 19]],
            10 => [[10, 10], [8, 8], [20, 20], [4, 4], [7, 7], [8, 9], [20, 20]],
            11 => [[11, 11], null, [21, 21], null, null, [10, 10], [21, 21]],
            12 => [[12, 12], [9, 9], [22, 22], [5, 5], [8, 8], [11, 11], null],
            13 => [null, null, [23, 24], null, null, [12, 12], [22, 23]],
            14 => [[13, 13], [10, 10], [25, 25], null, null, [13, 14], [24, 24]],
            15 => [null, [11, 11], [26, 26], null, null, [15, 15], null],
            16 => [null, null, [27, 27], null, null, [16, 16], null],
            17 => [null, null, null, null, null, [17, 17], null],
            18 => [null, null, null, null, null, [18, 18], null],
            19 => [null, null, null, null, null, [19, 21], null],
        ];

        // --- TABLE 2: Ages 4.1 - 5.0 Years ---
        $table4_5 = [
            1 => [[0, 5], [0, 3], [0, 15], [0, 1], [0, 0], [0, 0], [0, 13]],
            2 => [[6, 6], [4, 4], [16, 16], null, [1, 5], [1, 1], [14, 14]],
            3 => [[7, 7], [5, 5], [17, 17], [2, 2], null, [2, 3], [15, 15]],
            4 => [[8, 8], [6, 6], [18, 18], null, [6, 6], [4, 4], [16, 16]],
            5 => [[9, 9], [7, 7], [19, 19], [3, 3], null, [5, 5], [17, 17]],
            6 => [[10, 10], null, [20, 20], null, [7, 7], [6, 7], [18, 18]],
            7 => [null, [8, 8], [21, 21], null, null, [8, 8], [19, 19]],
            8 => [[11, 11], [9, 9], [22, 22], [4, 4], [8, 8], [9, 10], [20, 20]],
            9 => [[12, 12], null, [23, 23], [5, 5], null, [11, 11], [21, 21]],
            10 => [[13, 13], [10, 10], [24, 24], null, null, [12, 12], [22, 22]],
            11 => [null, [11, 11], [25, 25], null, null, [13, 14], [23, 23]],
            12 => [null, null, [26, 26], null, null, [15, 15], [24, 24]],
            13 => [null, null, [27, 27], null, null, [16, 17], null],
            14 => [null, null, null, null, null, [18, 18], null],
            15 => [null, null, null, null, null, [19, 20], null],
            16 => [null, null, null, null, null, [21, 21], null],
        ];

        // Select Table
        $table = $isGroup4_5 ? $table4_5 : $table3_4;

        $lastKnownScaled = 0;
        $maxRawInTable = 0;

        foreach ($table as $scaledScore => $ranges) {
            $range = $ranges[$colIndex];
            if ($range === null)
                continue;

            // 🚀 Force float casting so "10.00" from DB matches "10" exactly
            $currentRaw = (float) $rawScore;

            if (count($range) === 1) {
                if ($currentRaw == (float) $range[0])
                    return $scaledScore;
            } else {
                if ($currentRaw >= (float) $range[0] && $currentRaw <= (float) $range[1]) {
                    return $scaledScore;
                }
            }

            $lastKnownScaled = $scaledScore;
            $maxRawInTable = count($range) > 1 ? (float) $range[1] : (float) $range[0];
        }

        // 🚀 Ceiling Fix: If they score higher than the table max, give highest score
        if ($rawScore > $maxRawInTable && $maxRawInTable > 0) {
            return $lastKnownScaled;
        }

        return 1; // Return 1 (lowest scaled score) instead of 0 if no match is found
    }

    /**
     * 👶 ITED (0-3y) Domain-Level Interpretation
     */
    public function getItedDomainInterpretation($score, $max)
    {
        if ($max <= 0)
            return 'N/A';
        $percentage = ($score / $max) * 100;

        if ($percentage >= 90)
            return 'Highly Proficient';
        if ($percentage >= 75)
            return 'Proficient';
        if ($percentage >= 50)
            return 'Developing';
        return 'Needs Monitoring';
    }

    /**
     * 📊 ECCD (3-5y) Domain-Level Interpretation
     */
    public function getEccdDomainInterpretation($scaledScore)
    {
        if ($scaledScore == 0)
            return 'N/A';
        if ($scaledScore <= 3)
            return 'Significant Delay';
        if ($scaledScore <= 6)
            return 'Slight Delay';
        if ($scaledScore <= 13)
            return 'Average';
        if ($scaledScore <= 16)
            return 'Slightly Advanced';
        return 'Highly Advanced';
    }

    /**
     * 🌍 Overall Assessment Interpretation (Universal)
     */
    public function getOverallInterpretation($score, $ageYears, $ageMonths, $totalMax = 0)
    {
        $totalMonths = ($ageYears * 12) + $ageMonths;

        // Strictly Under 37 months
        if ($totalMonths <= 36) {
            if ($totalMax == 0)
                return 'Incomplete';
            $percentage = ($score / $totalMax) * 100;

            if ($percentage >= 90)
                return 'Advanced Development';
            if ($percentage >= 75)
                return 'On Track';
            if ($percentage >= 50)
                return 'Monitor Progress';
            return 'Needs Intervention';
        }

        // ECCD Logic (Standard Score)
        if ($score == 0)
            return 'Not Started';
        if ($score <= 69)
            return 'Development needs monitoring (3mo)';
        if ($score <= 79)
            return 'Development needs monitoring (6mo)';
        if ($score <= 119)
            return 'Average overall development';
        if ($score <= 129)
            return 'Slightly advanced development';
        return 'Highly advanced development';
    }

    public function getStandardScore(int $sumOfScaledScores): int
    {
        $map = [
            29 => 37,
            30 => 38,
            31 => 40,
            32 => 41,
            33 => 43,
            34 => 44,
            35 => 45,
            36 => 47,
            37 => 48,
            38 => 50,
            39 => 51,
            40 => 53,
            41 => 54,
            42 => 56,
            43 => 57,
            44 => 59,
            45 => 60,
            46 => 62,
            47 => 63,
            48 => 65,
            49 => 66,
            50 => 67,
            51 => 69,
            52 => 70,
            53 => 72,
            54 => 73,
            55 => 75,
            56 => 76,
            57 => 78,
            58 => 79,
            59 => 81,
            60 => 82,
            61 => 84,
            62 => 85,
            63 => 86,
            64 => 88,
            65 => 89,
            66 => 91,
            67 => 92,
            68 => 94,
            69 => 95,
            70 => 97,
            71 => 98,
            72 => 100,
            73 => 101,
            74 => 103,
            75 => 104,
            76 => 105,
            77 => 106,
            78 => 107,
            79 => 110,
            80 => 111,
            81 => 113,
            82 => 114,
            83 => 116,
            84 => 117,
            85 => 119,
            86 => 120,
            87 => 122,
            88 => 123,
            89 => 124,
            90 => 126,
            91 => 127,
            92 => 129,
            93 => 130,
            94 => 132,
            95 => 133,
            96 => 135,
            97 => 136,
            98 => 138
        ];

        if ($sumOfScaledScores < 29)
            return 69; // Floor
        if ($sumOfScaledScores > 98)
            return 138; // Ceiling

        return $map[$sumOfScaledScores] ?? 0;
    }

    /**
     * 📅 Calculate Next Due Date (Age-Aware)
     */
    public function calculateNextDueDate(int $score, string $assessmentDate, int $ageYears): ?string
    {
        if ($score <= 0)
            return null;
        $date = Carbon::parse($assessmentDate);

        // ITED (Infant/Toddler) specific frequency
        if ($ageYears < 3) {
            return ($score < 75) ? $date->addMonths(3)->toDateString() : $date->addMonths(6)->toDateString();
        }

        // ECCD Frequency
        if ($score <= 69)
            return $date->addMonths(3)->toDateString();
        if ($score <= 79)
            return $date->addMonths(6)->toDateString();
        return $date->addYear()->toDateString();
    }
}
