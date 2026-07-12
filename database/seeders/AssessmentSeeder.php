<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Assessment;
use App\Models\AssessmentDomain;
use App\Models\AssessmentScore;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\EccdScoringService;

class AssessmentSeeder extends Seeder
{
    public function run(EccdScoringService $scoringService): void
    {
        // 1. CLEAR TABLES
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        AssessmentScore::truncate();
        Assessment::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $domainModels = AssessmentDomain::orderBy('sort_order')->get();
        if ($domainModels->isEmpty()) {
            $this->command->error('Run AssessmentDomainSeeder first!');
            return;
        }

        $students = Student::with('daycare')->get();
        $teachersByDaycare = User::where('role', 'teacher')->get()->groupBy('daycare_id');
        $fallbackUser = User::where('role', 'admin')->first();

        $this->command->info("Seeding realistic developmental trajectories for {$students->count()} students...");

        foreach ($students as $student) {
            $teacher = $teachersByDaycare->get($student->daycare_id)?->first() ?? $fallbackUser;
            if (!$student->daycare) continue;

            $dob = Carbon::parse($student->date_of_birth);

            // 🚀 REALISTIC SCENARIO 1: Student Archetypes
            $randArchetype = rand(1, 100);
            if ($randArchetype <= 20) {
                $profile = 'Advanced';
                $baseAbility = rand(75, 85) / 100;
                $growthRate = 0.08;
            } elseif ($randArchetype <= 80) {
                $profile = 'Average';
                $baseAbility = rand(50, 65) / 100;
                $growthRate = 0.12;
            } else {
                $profile = 'Delayed';
                $baseAbility = rand(30, 45) / 100;
                $growthRate = 0.10;
            }

            // 🚀 REALISTIC SCENARIO 2: Persistent Weakness
            $weakDomainId = $domainModels->random()->id;

            // Determine timeline
            $count = rand(2, 3);
            $types = [
                ['name' => '1st Assessment', 'offset' => 8, 'semester' => '1st Semester'],
                ['name' => '2nd Assessment', 'offset' => 4, 'semester' => '2nd Semester'],
                ['name' => '3rd Assessment', 'offset' => 0, 'semester' => 'Year-End']
            ];
            $studentPlan = array_slice($types, 0, $count);

            foreach ($studentPlan as $idx => $plan) {
                $currentAbility = min(1.0, $baseAbility + ($growthRate * $idx));
                $date = Carbon::now()->subMonths($plan['offset'])->subDays(rand(1, 5));

                $evalAgeYears = $dob->diffInYears($date);
                $evalAgeMonths = $dob->diffInMonths($date) % 12;
                $totalMonths = ($evalAgeYears * 12) + $evalAgeMonths;

                // 🚀 ITED vs ECCD check
                $isEccd = $totalMonths >= 36;
                $formType = $isEccd ? 'record_2' : 'record_1';

                $scoresPayload = [];
                $sumScaled = 0;
                $totalRaw = 0;
                $totalMaxPossible = 0;
                $lowestDomainId = null;
                $lowestPct = 100;

                foreach ($domainModels as $domain) {
                    $maxRaw = $domain->max_score ?? 20;

                    $domainAbility = $currentAbility;
                    if ($domain->id === $weakDomainId) {
                        $domainAbility -= 0.15;
                    }

                    $variance = rand(-1, 1);
                    $raw = round($maxRaw * $domainAbility) + $variance;
                    $raw = max(0, min($maxRaw, $raw));

                    // 🚀 Track Raw Scores for ITED
                    $totalRaw += $raw;
                    $totalMaxPossible += $maxRaw;

                    $scaled = $scoringService->getScaledScore($domain->id, $raw, $evalAgeYears, $evalAgeMonths);

                    // Only sum core domains for ECCD
                    if ($domain->is_core) {
                        $sumScaled += $scaled;
                    }

                    $pct = $maxRaw > 0 ? ($raw / $maxRaw) : 0;
                    if ($pct < $lowestPct) {
                        $lowestPct = $pct;
                        $lowestDomainId = $domain->id;
                    }

                    $scoresPayload[] = [
                        'domain_id' => $domain->id,
                        'domain_name' => $domain->name,
                        'max_score' => $maxRaw,
                        'raw' => $raw,
                        'scaled' => $scaled,
                    ];
                }

                // 🚀 PROPERLY ISOLATE ITED AND ECCD MATH
                if ($isEccd) {
                    $finalScore = $scoringService->getStandardScore($sumScaled);
                    $overallRating = $scoringService->getOverallInterpretation($finalScore, $evalAgeYears, $evalAgeMonths);
                    $sumOfScaledToSave = $sumScaled;
                } else {
                    $finalScore = $totalRaw;
                    $overallRating = $scoringService->getOverallInterpretation($totalRaw, $evalAgeYears, $evalAgeMonths, $totalMaxPossible);
                    $sumOfScaledToSave = null; // ITED does not use Sum of Scaled!
                }

                $nextDate = $scoringService->calculateNextDueDate($finalScore, $date->toDateString(), $evalAgeYears);

                // Create Assessment
                $assessment = Assessment::create([
                    'student_id'           => $student->id,
                    'teacher_id'           => $teacher->id,
                    'daycare_id'           => $student->daycare_id,
                    'assessment_date'      => $date,
                    'assessment_type'      => $plan['name'],
                    'form_type'            => $formType,
                    'category'             => 'Regular',
                    'status'               => 'Completed',
                    'school_year'          => '2025-2026',
                    'semester'             => $plan['semester'],
                    'age_years'            => $evalAgeYears,
                    'age_months'           => $evalAgeMonths,
                    'overall_score'        => $finalScore,
                    'sum_of_scaled'        => $sumOfScaledToSave,
                    'overall_rating'       => $overallRating,
                    'completed_at'         => $date,
                    'next_assessment_date' => $nextDate,
                    'created_at'           => $date,
                    'updated_at'           => $date,
                ]);

                // Create Scores
                foreach ($scoresPayload as $sp) {
                    $isWeakest = ($sp['domain_id'] === $lowestDomainId);

                    AssessmentScore::create([
                        'assessment_id' => $assessment->id,
                        'domain_id'     => $sp['domain_id'],
                        'score'         => $sp['raw'],
                        'scaled_score'  => $sp['scaled'],
                        'max_score'     => $sp['max_score'],
                        'is_included'   => true,
                        'notes'         => $isWeakest ? $this->generateRecommendation($sp['domain_name']) : null,
                        'created_at'    => $date,
                        'updated_at'    => $date,
                    ]);
                }
            }
        }
        $this->command->info('Accurate Assessment Seeding Done.');
    }

    private function generateRecommendation($weakestDomain)
    {
        return match ($weakestDomain) {
            'Gross Motor' => "Encourage outdoor play involving running, jumping, and climbing. Try setting up a simple obstacle course at home.",
            'Fine Motor' => "Practice threading beads, using safety scissors, and drawing shapes. Playing with clay or dough will also help build hand strength.",
            'Self-Help' => "Allow more time to practice dressing independently and using utensils. Provide verbal praise for attempting tasks on their own.",
            'Receptive Language' => "Read short stories and ask specific questions about the plot (e.g., 'Where did the dog go?').",
            'Expressive Language' => "Encourage the child to describe their day in full sentences. Avoid completing their sentences for them.",
            'Cognitive' => "Introduce simple puzzles, counting games, and color sorting. Ask 'why' and 'how' questions during play.",
            'Socio-Emotional' => "Facilitate playdates to practice sharing and taking turns. Model how to express frustration safely.",
            default => "Continue monitoring progress and maintain a consistent routine."
        };
    }
}
