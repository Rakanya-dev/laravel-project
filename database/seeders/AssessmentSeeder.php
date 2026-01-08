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

class AssessmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. CLEAR TABLE & RESET IDs
        // Truncate resets the 'id' counter back to 1 (Global Reset)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        AssessmentScore::truncate();
        Assessment::truncate();
        AssessmentDomain::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Assessment tables truncated. IDs reset.');

        // 2. Setup Domains
        $domainsData = [
            ['name' => 'Gross Motor', 'sort_order' => 1, 'max_raw' => 13],
            ['name' => 'Fine Motor', 'sort_order' => 2, 'max_raw' => 11],
            ['name' => 'Self-Help', 'sort_order' => 3, 'max_raw' => 27],
            ['name' => 'Receptive Language', 'sort_order' => 4, 'max_raw' => 5],
            ['name' => 'Expressive Language', 'sort_order' => 5, 'max_raw' => 8],
            ['name' => 'Cognitive', 'sort_order' => 6, 'max_raw' => 21],
            ['name' => 'Social-Emotional', 'sort_order' => 7, 'max_raw' => 24],
        ];

        $domainModels = [];
        foreach ($domainsData as $d) {
            $domainModels[] = AssessmentDomain::create([
                'name' => $d['name'],
                'description' => 'Standard items for ' . $d['name'],
                'sort_order' => $d['sort_order'],
                'is_active' => true
            ]);
        }

        // 3. Fetch Students & Teachers
        $students = Student::with('daycare')->get();
        $teachersByDaycare = User::where('role', 'teacher')->get()->groupBy('daycare_id');
        $fallbackUser = User::first();

        $this->command->info("Seeding assessments for {$students->count()} students...");

        foreach ($students as $student) {
            $teacher = $teachersByDaycare->get($student->daycare_id)?->first() ?? $fallbackUser;
            if (!$student->daycare) continue;

            // --- STRICT LOGIC: 1 to 3 Evaluations ---
            $count = rand(1, 3);

            // Define chronological types
            // This ensures Evaluation #1 is always "Initial", #2 is "Mid-Year", etc.
            $types = [
                ['name' => 'Initial', 'offset' => 6],   // 6 months ago
                ['name' => 'Mid-Year', 'offset' => 3],  // 3 months ago
                ['name' => 'Final', 'offset' => 0]      // Now
            ];

            // Slice from the START (0) so every student starts with 'Initial'
            $studentPlan = array_slice($types, 0, $count);

            // Starting Base Skill (30% - 60%)
            $baseSkill = rand(30, 60) / 100;

            // Loop through the plan (0, 1, or 2)
            foreach ($studentPlan as $idx => $plan) {
                // $idx is 0, 1, or 2.
                // We add 1 to make it "Evaluation #1", "Evaluation #2".
                $evalNum = $idx + 1;

                // Growth Logic
                $growth = $idx * (rand(10, 20) / 100);
                $currentSkillLevel = min(0.98, $baseSkill + $growth);

                // Generate Scores
                $rawScores = [];
                $scoresByDomain = [];

                foreach ($domainsData as $domainData) {
                    $max = $domainData['max_raw'];
                    $variance = (rand(-5, 5) / 100);
                    $score = round($max * ($currentSkillLevel + $variance));
                    $finalScore = max(0, min($max, $score));

                    $rawScores[] = $finalScore;
                    $scoresByDomain[$domainData['name']] = [
                        'score' => $finalScore,
                        'max' => $max,
                        'pct' => $finalScore / $max
                    ];
                }

                // Create Assessment
                // We pass "$evalNum. $plan['name']" as the Type to force uniqueness visual
                // Example: "1. Initial", "2. Mid-Year"
                $this->createAssessment(
                    $student,
                    $teacher,
                    $student->daycare,
                    $domainModels,
                    "{$evalNum}. {$plan['name']}", // 👈 Forces Type to be "1. Initial"
                    Carbon::now()->subMonths($plan['offset'])->subDays(rand(1,5)),
                    $rawScores,
                    $scoresByDomain
                );
            }
        }
        $this->command->info('Seeding Done.');
    }

    private function createAssessment($student, $teacher, $daycare, $domains, $typeString, $date, $rawScores, $scoresByDomain)
    {
        // Calculate Standard Score
        $sumRaw = array_sum($rawScores);
        $totalMax = 109;
        $percentage = $sumRaw / $totalMax;
        $overallScore = round($percentage * 20);

        // Generate System Notes & Recommendations
        // We strip the "1. " from the type string for the note logic
        $cleanType = explode('. ', $typeString)[1] ?? $typeString;
        $ratingData = $this->getRatingAndNote($overallScore, $student->first_name, $cleanType);
        $recommendation = $this->generateRecommendation($scoresByDomain);

        $assessment = Assessment::create([
            'student_id' => $student->id,
            'teacher_id' => $teacher->id,
            'daycare_id' => $daycare->id,
            'assessment_date' => $date,
            'assessment_type' => $typeString, // e.g. "1. Initial"
            'status' => 'Completed',
            'school_year' => '2024-2025',
            'semester' => '1st',
            'overall_score' => $overallScore,
            'overall_rating' => $ratingData['rating'],
            'overall_notes' => $ratingData['note'],
            'recommendations' => $recommendation,
            'created_at' => $date,
            'updated_at' => $date,
        ]);

        foreach ($domains as $index => $domain) {
            AssessmentScore::create([
                'assessment_id' => $assessment->id,
                'domain_id' => $domain->id,
                'score' => $rawScores[$index] ?? 0,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }

    private function getRatingAndNote($score, $name, $type)
    {
        if ($score >= 17) {
            return [
                'rating' => 'Advanced',
                'note' => "System Analysis: $name demonstrates exceptional mastery during this $type evaluation. They consistently exceed expectations in cognitive and motor tasks."
            ];
        } elseif ($score >= 13) {
            return [
                'rating' => 'Proficient',
                'note' => "System Analysis: $name is meeting development milestones effectively. This $type evaluation shows steady progress across most domains."
            ];
        } elseif ($score >= 8) {
            return [
                'rating' => 'Developing',
                'note' => "System Analysis: $name is progressing but requires additional support. The $type results suggest focusing on focus and fine motor skills."
            ];
        } else {
            return [
                'rating' => 'Beginning',
                'note' => "System Analysis: $name is just starting to develop core competencies. This $type assessment indicates a need for targeted intervention in self-help domains."
            ];
        }
    }

    private function generateRecommendation($scoresByDomain)
    {
        $weakestDomain = '';
        $lowestPct = 1.0;
        foreach ($scoresByDomain as $name => $data) {
            if ($data['pct'] < $lowestPct) {
                $lowestPct = $data['pct'];
                $weakestDomain = $name;
            }
        }

        return match($weakestDomain) {
            'Gross Motor' => "Encourage outdoor play involving running, jumping, and climbing.",
            'Fine Motor' => "Practice threading beads, using safety scissors, and drawing shapes.",
            'Self-Help' => "Allow more time to practice dressing independently and using utensils.",
            'Receptive Language' => "Read short stories and ask specific questions about the plot.",
            'Expressive Language' => "Encourage the child to describe their day in full sentences.",
            'Cognitive' => "Introduce simple puzzles, counting games, and color sorting.",
            'Social-Emotional' => "Facilitate playdates to practice sharing and taking turns.",
            default => "Continue monitoring progress and maintain a consistent routine."
        };
    }
}
