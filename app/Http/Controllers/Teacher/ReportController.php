<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Assessment;
use App\Models\AssessmentDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon; // Import Carbon for date math

class ReportController extends Controller
{
    public function showStudentProfile($studentId)
    {
        $student = Student::withTrashed()
            ->with(['daycare', 'assessments.scores.domain'])
            ->findOrFail($studentId);

        // 1. SORT FIRST (by actual date), THEN MAP
        $sortedAssessments = $student->assessments->sortBy('assessment_date');

        $history = $sortedAssessments->map(function ($assessment) use ($student) {

            // Safe Age Calculation (in case it's not in the DB)
            $examDate = Carbon::parse($assessment->assessment_date);
            $birthDate = Carbon::parse($student->date_of_birth);
            $ageInMonths = $birthDate->diffInMonths($examDate);

            return [
                'id' => $assessment->id,
                'type' => $assessment->assessment_type,
                'date' => $examDate->format('M d, Y'), // Formatted strictly for display
                'age_months' => $ageInMonths,
                'standard_score' => $assessment->overall_score,
                'interpretation' => $this->getInterpretation($assessment->overall_score),
                'domains' => $assessment->scores->map(function ($score) {
                    return [
                        'name' => $score->domain->name ?? 'Unknown Domain',
                        'scaled_score' => $score->scaled_score,
                        'raw_score' => $score->score, // 🚀 NEW: Point it to the actual 'score' column!
                    ];
                }),
            ];
        })->values(); // Reset array keys so React receives a clean list

        return Inertia::render('teacher/reports/student-profile', [
            'student' => $student,
            'history' => $history,
            'daycare' => $student->daycare,
        ]);
    }

    public function showClassConsolidated(Request $request)
    {
        // 1. Get the assessment type from URL (default to '1st Assessment')
        $type = $request->query('type', '1st Assessment');
        $daycareId = auth()->user()->daycare_id;

        // 2. Fetch all students in this daycare with their scores for this specific period
        $students = Student::where('daycare_id', $daycareId)
            ->with([
                'assessments' => function ($query) use ($type) {
                    $query->where('assessment_type', $type);
                    $query->with('scores.domain');
                },
                'daycare' // 🚀 Eager load daycare to prevent N+1 database queries
            ])
            ->orderBy('last_name')
            ->get();

        // 3. Transform data for the big table
        $rows = $students->map(function ($student) {
            $assessment = $student->assessments->first(); // We only grabbed the specific type

            // --- 🚀 FIX: CALCULATE EXACT AGE ---
            $ageYears = null;
            $ageMonths = null;

            if ($student->date_of_birth) {
                $dob = Carbon::parse($student->date_of_birth);
                // If they have an assessment, calculate age on that exact day. Otherwise, use today.
                $targetDate = $assessment ? Carbon::parse($assessment->assessment_date) : Carbon::now();

                // diff() returns a DateInterval object containing exact years, months, and days
                $diff = $dob->diff($targetDate);
                $ageYears = $diff->y;
                $ageMonths = $diff->m;
            }

            // --- 🚀 FIX: BULLETPROOF DOMAIN MAPPING ---
            $scoresMap = [];
            if ($assessment) {
                foreach ($assessment->scores as $score) {
                    // Force lowercase & remove hyphens/spaces so "Socio-Emotional" matches perfectly
                    $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $score->domain->name));
                    $scoresMap[$cleanName] = $score->scaled_score;
                }
            }

            return [
                'id' => $student->id,
                'name' => $student->last_name . ', ' . $student->first_name,

                // Now passing your separated age variables safely
                'age_years' => $ageYears,
                'age_months' => $ageMonths,

                'gender' => $student->gender,
                'has_assessment' => !!$assessment,

                // Map domains exactly using the clean, normalized names
                'gross_motor' => $scoresMap['grossmotor'] ?? null,
                'fine_motor' => $scoresMap['finemotor'] ?? null,
                'self_help' => $scoresMap['selfhelp'] ?? null,
                'receptive' => $scoresMap['receptivelanguage'] ?? null,
                'expressive' => $scoresMap['expressivelanguage'] ?? null,
                'cognitive' => $scoresMap['cognitive'] ?? null,
                'socio_emotional' => $scoresMap['socioemotional'] ?? null,

                'standard_score' => $assessment ? $assessment->overall_score : null,
                'interpretation' => $assessment ? $this->getInterpretation($assessment->overall_score) : 'N/A',
            ];
        });

        return Inertia::render('teacher/reports/class-consolidated', [
            'rows' => $rows,
            'currentType' => $type,
            'daycareName' => $students->first()->daycare->name ?? 'Unassigned Daycare',
        ]);
    }

    public function showDomainAnalysis(Request $request)
    {
        $type = $request->query('type', '1st Assessment');
        $daycareId = auth()->user()->daycare_id;

        // 1. Get all assessments for this daycare & type
        $assessments = Assessment::where('daycare_id', $daycareId)
            ->where('assessment_type', $type)
            ->where('status', 'Completed') // Only count completed ones!
            ->with('scores.domain')
            ->get();

        if ($assessments->isEmpty()) {
            return Inertia::render('teacher/reports/domain-analysis', [
                'chartData' => [],
                'insight' => 'Not enough data to generate analysis.',
                'currentType' => $type
            ]);
        }

        // 2. Aggregate Scores
        $totals = [];
        $counts = [];

        foreach ($assessments as $assessment) {
            foreach ($assessment->scores as $score) {
                $domainName = $score->domain->name;
                if (!isset($totals[$domainName])) {
                    $totals[$domainName] = 0;
                    $counts[$domainName] = 0;
                }
                $totals[$domainName] += $score->scaled_score;
                $counts[$domainName]++;
            }
        }

        // 3. Calculate Averages
        $chartData = [];
        foreach ($totals as $name => $sum) {
            $avg = $counts[$name] > 0 ? round($sum / $counts[$name], 1) : 0;
            $chartData[] = ['domain' => $name, 'average' => $avg];
        }

        // 4. Generate Insight
        // Sort by average to find highest and lowest
        usort($chartData, fn($a, $b) => $b['average'] <=> $a['average']);

        $strongest = $chartData[0]['domain'] ?? 'N/A';
        $weakest = end($chartData)['domain'] ?? 'N/A';

        $insight = "Based on class performance, students demonstrate strong proficiency in **$strongest**, while **$weakest** appears to be the area requiring the most attention in upcoming lesson plans.";

        return Inertia::render('teacher/reports/domain-analysis', [
            'chartData' => $chartData,
            'insight' => $insight,
            'currentType' => $type,
            'studentCount' => $assessments->count(),
        ]);
    }

    private function getInterpretation($score)
    {
        if ($score >= 120)
            return 'Highly Advanced Development';
        if ($score >= 110)
            return 'Slightly Advanced Development';
        if ($score >= 80)
            return 'Average Overall Development';
        if ($score >= 70)
            return 'Slight Delay in Overall Development';
        return 'Significant Delay in Overall Development';
    }
}
