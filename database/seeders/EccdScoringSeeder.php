<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\AssessmentDomain;

class EccdScoringSeeder extends Seeder
{
    public function run()
    {
        // 1. CLEAR EXISTING RULES
        DB::table('eccd_scale_rules')->truncate();
        DB::table('eccd_standard_rules')->truncate();

        $domains = AssessmentDomain::all();
        $domainMap = [];

        // 🚀 THE MAGIC FIX: Lowercase FIRST, then strip spaces and dashes!
        foreach ($domains as $domain) {
            $cleanName = preg_replace('/[^a-z]/', '', strtolower($domain->name));

            $index = match($cleanName) {
                'grossmotor' => 0,
                'finemotor' => 1,
                'selfhelp' => 2,
                'expressivelanguage' => 3,
                'cognitive' => 4,
                'socioemotional', 'socialemotional' => 5,
                'receptivelanguage' => 6,
                default => null
            };

            if ($index !== null) {
                $domainMap[$index] = $domain->id;
            }
        }

        if (count($domainMap) < 7) {
            $this->command->error('Could not map all 7 domains! Check your AssessmentDomain table for typos.');
            return;
        }

        $this->command->info('Migrating strictly aligned Scaled Score Rules...');

        // 3. TABLE 1: Age Group 3.1 - 4.0 Years (36 to 48 months)
        $table3_4 = [
            1 => [[0, 3], null, [0, 9], [0, 2], null, [0, 9], null],
            2 => [[4, 4], [0, 3], [10, 10], null, null, [10, 11], null],
            3 => [[5, 5], null, [11, 11], [3, 3], [0, 0], [12, 12], [0, 1]],
            4 => [null, [4, 4], [12, 12], [4, 4], [1, 1], [13, 13], null],
            5 => [[6, 6], [5, 5], [13, 14], null, [2, 3], [14, 14], [2, 2]],
            6 => [[7, 7], null, [15, 15], [5, 5], [4, 4], [15, 15], null],
            7 => [[8, 8], [6, 6], [16, 16], null, [5, 5], [16, 16], [3, 3]],
            8 => [[9, 9], null, [17, 17], [6, 6], [6, 6], [17, 18], null],
            9 => [null, [7, 7], [18, 19], null, [7, 7], [19, 19], null],
            10 => [[10, 10], [8, 8], [20, 20], [7, 7], [8, 9], [20, 20], [4, 4]],
            11 => [[11, 11], null, [21, 21], null, [10, 10], [21, 21], null],
            12 => [[12, 12], [9, 9], [22, 22], [8, 8], [11, 11], null, [5, 5]],
            13 => [null, null, [23, 24], null, [12, 12], [22, 23], null],
            14 => [[13, 13], [10, 10], [25, 25], null, [13, 14], [24, 24], null],
            15 => [null, [11, 11], [26, 26], null, [15, 15], null, null],
            16 => [null, null, [27, 27], null, [16, 16], null, null],
            17 => [null, null, null, null, [17, 17], null, null],
            18 => [null, null, null, null, [18, 18], null, null],
            19 => [null, null, null, null, [19, 21], null, null],
        ];

        $this->insertScaleRules($table3_4, 36, 48, $domainMap);

        // 4. TABLE 2: Age Group 4.1 - 5.0 Years (49+ months)
        $table4_5 = [
            1 => [[0, 5], [0, 3], [0, 15], [0, 0], [0, 0], [0, 13], [0, 1]],
            2 => [[6, 6], [4, 4], [16, 16], [1, 5], [1, 1], [14, 14], null],
            3 => [[7, 7], [5, 5], [17, 17], null, [2, 3], [15, 15], [2, 2]],
            4 => [[8, 8], [6, 6], [18, 18], [6, 6], [4, 4], [16, 16], null],
            5 => [[9, 9], [7, 7], [19, 19], null, [5, 5], [17, 17], [3, 3]],
            6 => [[10, 10], null, [20, 20], [7, 7], [6, 7], [18, 18], null],
            7 => [null, [8, 8], [21, 21], null, [8, 8], [19, 19], null],
            8 => [[11, 11], [9, 9], [22, 22], [8, 8], [9, 10], [20, 20], [4, 4]],
            9 => [[12, 12], null, [23, 23], null, [11, 11], [21, 21], [5, 5]],
            10 => [[13, 13], [10, 10], [24, 24], null, [12, 12], [22, 22], null],
            11 => [null, [11, 11], [25, 25], null, [13, 14], [23, 23], null],
            12 => [null, null, [26, 26], null, [15, 15], [24, 24], null],
            13 => [null, null, [27, 27], null, [16, 17], null, null],
            14 => [null, null, null, null, [18, 18], null, null],
            15 => [null, null, null, null, [19, 20], null, null],
            16 => [null, null, null, null, [21, 21], null, null],
        ];

        $this->insertScaleRules($table4_5, 49, 999, $domainMap);

        // 5. MIGRATE COMBINED STANDARD SCORE MAP
        $this->command->info('Migrating Standard Score Rules...');

        $standardMap = [
            29=>37, 30=>38, 31=>40, 32=>41, 33=>43, 34=>44, 35=>45, 36=>47, 37=>48, 38=>50,
            39=>51, 40=>53, 41=>54, 42=>56, 43=>57, 44=>59, 45=>60, 46=>62, 47=>63, 48=>65,
            49=>66, 50=>67, 51=>69, 52=>70, 53=>72, 54=>73, 55=>75, 56=>76, 57=>78, 58=>79,
            59=>81, 60=>82, 61=>84, 62=>85, 63=>86, 64=>88, 65=>89, 66=>91, 67=>92, 68=>94,
            69=>95, 70=>97, 71=>98, 72=>100, 73=>101, 74=>103, 75=>104, 76=>105, 77=>106,
            78=>107, 79=>110, 80=>111, 81=>113, 82=>114, 83=>116, 84=>117, 85=>119, 86=>120,
            87=>122, 88=>123, 89=>124, 90=>126, 91=>127, 92=>129, 93=>130, 94=>132, 95=>133,
            96=>135, 97=>136, 98=>138
        ];

        $standardInserts = [];
        foreach ($standardMap as $sum => $standard) {
            $standardInserts[] = [
                'sum_scaled_score' => $sum,
                'standard_score' => $standard,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('eccd_standard_rules')->insert($standardInserts);

        $this->command->info('✅ All scoring rules successfully mapped and migrated!');
    }

    private function insertScaleRules($table, $minMonths, $maxMonths, $domainMap)
    {
        $inserts = [];
        foreach ($table as $scaledScore => $columns) {
            foreach ($columns as $colIndex => $range) {
                if ($range === null) continue;

                $inserts[] = [
                    'domain_id' => $domainMap[$colIndex],
                    'min_months_age' => $minMonths,
                    'max_months_age' => $maxMonths,
                    'scaled_score' => $scaledScore,
                    'min_raw_score' => $range[0],
                    'max_raw_score' => count($range) > 1 ? $range[1] : $range[0],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        foreach (array_chunk($inserts, 50) as $chunk) {
            DB::table('eccd_scale_rules')->insert($chunk);
        }
    }
}
