<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Assessment;
use App\Models\AssessmentDomain;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function showStudentProfile($studentId)
    {
        // 🚀 OPTIMIZATION 1: Let the database sort the assessments before they ever reach PHP memory.
        $student = Student::withTrashed()
            ->with([
                'daycare',
                'assessments' => function ($query) {
                    $query->orderBy('assessment_date', 'asc')->with('scores.domain');
                }
            ])
            ->findOrFail($studentId);

        $history = $student->assessments->map(function ($assessment) use ($student) {

            $examDate = Carbon::parse($assessment->assessment_date);
            $birthDate = Carbon::parse($student->date_of_birth);
            $ageInMonths = $birthDate->diffInMonths($examDate);

            return [
                'id' => $assessment->id,
                'type' => $assessment->assessment_type,
                'date' => $examDate->format('M d, Y'),
                'age_months' => $ageInMonths,
                'standard_score' => $assessment->overall_score,
                'interpretation' => $this->getInterpretation($assessment->overall_score),
                'domains' => $assessment->scores->map(function ($score) {
                    return [
                        'name' => $score->domain->name ?? 'Unknown Domain',
                        'scaled_score' => $score->scaled_score,
                        'raw_score' => $score->score,
                    ];
                }),
            ];
        })->values();

        return Inertia::render('teacher/reports/student-profile', [
            'student' => $student,
            'history' => $history,
            'daycare' => $student->daycare,
        ]);
    }

    public function showClassConsolidated(Request $request)
    {
        $type = $request->query('type', '1st Assessment');
        $daycareId = auth()->user()->daycare_id;

        $students = Student::where('daycare_id', $daycareId)
            ->with([
                'assessments' => function ($query) use ($type) {
                    $query->where('assessment_type', $type);
                    $query->with('scores.domain');
                },
                'daycare'
            ])
            ->orderBy('last_name')
            ->get();

        $rows = $students->map(function ($student) {
            $assessment = $student->assessments->first();

            $ageYears = null;
            $ageMonths = null;

            if ($student->date_of_birth) {
                $dob = Carbon::parse($student->date_of_birth);
                $targetDate = $assessment ? Carbon::parse($assessment->assessment_date) : Carbon::now();

                $diff = $dob->diff($targetDate);
                $ageYears = $diff->y;
                $ageMonths = $diff->m;
            }

            $scoresMap = [];
            if ($assessment) {
                foreach ($assessment->scores as $score) {
                    $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $score->domain->name));
                    $scoresMap[$cleanName] = $score->scaled_score;
                }
            }

            return [
                'id' => $student->id,
                'name' => $student->last_name . ', ' . $student->first_name,
                'age_years' => $ageYears,
                'age_months' => $ageMonths,
                'gender' => $student->gender,
                'has_assessment' => !!$assessment,
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

        $assessments = Assessment::where('daycare_id', $daycareId)
            ->where('assessment_type', $type)
            ->where('status', 'Completed')
            ->with('scores.domain')
            ->get();

        if ($assessments->isEmpty()) {
            return Inertia::render('teacher/reports/domain-analysis', [
                'chartData' => [],
                'insight' => 'Not enough data to generate analysis.',
                'currentType' => $type
            ]);
        }

        // 🚀 OPTIMIZATION 2: Replaced manual tallying and usort() with a clean Collection Pipeline
        $chartData = $assessments->flatMap->scores
            ->groupBy('domain.name')
            ->map(function ($domainScores, $domainName) {
                return [
                    'domain' => $domainName,
                    'average' => round($domainScores->avg('scaled_score'), 1)
                ];
            })
            ->sortByDesc('average')
            ->values()
            ->toArray();

        // Safe fallback in case chartData is empty after processing
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
