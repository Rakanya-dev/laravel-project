<?php

namespace App\Http\Controllers\Teacher;

use App\Events\AssessmentCreated;
use App\Events\AssessmentUpdated;
use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Assessment;
use App\Models\AssessmentDomain;
use App\Models\AssessmentScore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Services\EccdScoringService;
use Illuminate\Auth\Access\AuthorizationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Notifications\AppNotification;
class AssessmentController extends Controller
{
    private function getTeacherDaycareId()
    {
        $daycareId = Auth::user()->daycare_id;
        if (!$daycareId)
            throw new AuthorizationException('User is not assigned to a daycare.');
        return $daycareId;
    }

    public function index()
    {
        $daycareId = $this->getTeacherDaycareId();

        $students = Student::with(['daycare:id,name', 'section'])
            ->where('daycare_id', $daycareId)
            ->get();

        $studentIds = $students->pluck('id');

        $assessments = Assessment::whereIn('student_id', $studentIds)
            ->with([
                'teacher:id,first_name,last_name',
                'scores.domain'
            ])
            ->orderBy('assessment_date', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();

        $groupedByStudent = $assessments->groupBy('student_id');

        $assessmentsWithNumbers = $assessments->map(function ($assessment) use ($groupedByStudent) {
            $studentHistory = $groupedByStudent->get($assessment->student_id)->values();
            $index = $studentHistory->search(fn($item) => $item->id === $assessment->id);
            $assessment->evaluation_number = 'Evaluation #' . ($index + 1);

            $dob = Carbon::parse($assessment->student->date_of_birth);
            $assessDate = Carbon::parse($assessment->assessment_date);

            $ageInMonths = $dob->diffInMonths($assessDate);
            $isEccd = $ageInMonths >= 37;

            $assessment->form_version = $isEccd ? 'ECCD (3-5y)' : 'ITED (0-3y)';

            if ($isEccd) {
                // 🚀 ONLY SUM CORE DOMAINS for the dashboard view
                $assessment->sum_of_scaled = $assessment->scores
                    ->where('is_included', true)
                    ->filter(fn($score) => $score->domain->is_core ?? true)
                    ->sum('scaled_score');
            } else {
                $assessment->sum_of_scaled = null;
            }

            return $assessment;
        });

        $domains = AssessmentDomain::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'is_core']);

        return Inertia::render('teacher/assessments-management', [
            'assessments' => $assessmentsWithNumbers,
            'students' => $students,
            'domains' => $domains,
        ]);
    }

    public function show($id)
    {
        $assessment = Assessment::with('student')->findOrFail($id);
        return $this->redirectToForm($assessment->student, $assessment->id);
    }

    public function edit($id)
    {
        $daycareId = $this->getTeacherDaycareId();

        $assessment = Assessment::where('daycare_id', $daycareId)
            ->with('student')
            ->findOrFail($id);

        return $this->redirectToForm($assessment->student, $assessment->id);
    }

    public function create(Request $request, EccdScoringService $scoringService)
    {
        $studentId = $request->query('student_id');
        if (!$studentId) {
            return redirect()->route('teacher.my-students')->with('error', 'No student selected.');
        }

        $student = Student::findOrFail($studentId);

        if ($student->status === 'Graduated' || $student->status === 'Completed' || $student->is_graduating) {
            return redirect('/teacher/my-students')->with('error', 'This student has completed the program and cannot be assessed.');
        }

        $existingDraft = Assessment::where('student_id', $studentId)
            ->whereIn('status', ['Draft', 'In Progress'])
            ->first();

        if ($existingDraft) {
            return $this->redirectToForm($student, $existingDraft->id);
        }

        $completedCount = Assessment::where('student_id', $studentId)
            ->where('status', 'Completed')
            ->count();

        $typeNames = ['1st Assessment', '2nd Assessment', '3rd Assessment'];
        $nextType = $typeNames[$completedCount] ?? 'Follow-up';

        $dob = Carbon::parse($student->date_of_birth);
        $evalDate = now();
        $age = $dob->diff($evalDate);
        $totalMonths = ($age->y * 12) + $age->m;
        $isEccd = $totalMonths >= 37;

        $assessment = Assessment::create([
            'student_id' => $student->id,
            'teacher_id' => Auth::id(),
            'daycare_id' => $this->getTeacherDaycareId(),
            'assessment_type' => $nextType,
            'status' => 'Draft',
            'assessment_date' => $evalDate,
            'school_year' => $evalDate->year . '-' . ($evalDate->year + 1),
            'semester' => ($evalDate->month > 6) ? '1st' : '2nd',
            'overall_score' => 0,
            'overall_rating' => 'Not Started',
            'age_years' => $age->y,
            'age_months' => $age->m,
            'form_type' => $isEccd ? 'record_2' : 'record_1',
        ]);

        $domains = AssessmentDomain::where('is_active', true)->orderBy('sort_order')->get();
        $scoresToInsert = [];

        foreach ($domains as $domain) {
            $initialScaled = $isEccd
                ? $scoringService->getScaledScore($domain->id, 0, $age->y, $age->m)
                : 0;

            $scoresToInsert[] = [
                'assessment_id' => $assessment->id,
                'domain_id' => $domain->id,
                'score' => 0,
                'scaled_score' => $initialScaled,
                'max_score' => $domain->max_score,
                'is_included' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($scoresToInsert)) {
            AssessmentScore::insert($scoresToInsert);
        }

        AssessmentCreated::dispatch($assessment);

        return $this->redirectToForm($student, $assessment->id);
    }

    public function bulkStore(Request $request, EccdScoringService $scoringService)
    {
        $request->validate([
            'assessments' => 'required|array',
            'assessments.*.student_id' => 'required|exists:students,id',
            'assessments.*.assessment_type' => 'required|string',
        ]);

        $daycareId = $this->getTeacherDaycareId();
        $domains = AssessmentDomain::where('is_active', true)->get();
        $count = 0;

        $studentIds = collect($request->assessments)->pluck('student_id')->unique();
        $students = Student::whereIn('id', $studentIds)->get()->keyBy('id');

        $assessmentTypes = collect($request->assessments)->pluck('assessment_type')->unique();
        $existingDrafts = Assessment::whereIn('student_id', $studentIds)
            ->whereIn('assessment_type', $assessmentTypes)
            ->get()
            ->keyBy(fn($item) => $item->student_id . '_' . $item->assessment_type);

        foreach ($request->assessments as $data) {
            $draftKey = $data['student_id'] . '_' . $data['assessment_type'];

            if (!$existingDrafts->has($draftKey)) {
                $student = $students->get($data['student_id']);

                if (!$student)
                    continue;

                $dob = Carbon::parse($student->date_of_birth);
                $evalDate = now();
                $age = $dob->diff($evalDate);
                $totalMonths = ($age->y * 12) + $age->m;
                $isEccd = $totalMonths >= 37;

                $assessment = Assessment::create([
                    'student_id' => $student->id,
                    'teacher_id' => Auth::id(),
                    'daycare_id' => $daycareId,
                    'assessment_type' => $data['assessment_type'],
                    'status' => 'Draft',
                    'assessment_date' => $evalDate,
                    'school_year' => $evalDate->year . '-' . ($evalDate->year + 1),
                    'semester' => ($evalDate->month > 6) ? '1st' : '2nd',
                    'overall_score' => 0,
                    'overall_rating' => 'Not Started',
                    'age_years' => $age->y,
                    'age_months' => $age->m,
                    'form_type' => $isEccd ? 'record_2' : 'record_1',
                ]);

                $scoresToInsert = [];
                foreach ($domains as $domain) {
                    $initialScaled = $isEccd
                        ? $scoringService->getScaledScore($domain->id, 0, $age->y, $age->m) // 🚀 Changed to ID
                        : 0;

                    $scoresToInsert[] = [
                        'assessment_id' => $assessment->id,
                        'domain_id' => $domain->id,
                        'score' => 0,
                        'scaled_score' => $initialScaled,
                        'max_score' => $domain->max_score,
                        'is_included' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                if (!empty($scoresToInsert)) {
                    AssessmentScore::insert($scoresToInsert);
                }

                $count++;

                event(new AssessmentUpdated($assessment));
            }
        }

        return redirect()->back()->with('success', "$count Draft(s) created successfully.");
    }

    public function update(Request $request, $id, EccdScoringService $scoringService)
    {
        $daycareId = $this->getTeacherDaycareId();

        $assessment = Assessment::where('daycare_id', $daycareId)
            ->with('student')
            ->findOrFail($id);

        $validated = $request->validate([
            'next_assessment_date' => 'nullable|string',
            'status' => ['required', Rule::in(['Draft', 'In Progress', 'Completed'])],
            'scores' => 'required|array',
            'scores.*.id' => 'required|integer|exists:assessment_scores,id',
            'scores.*.score' => 'nullable|numeric|min:0',
        ]);

        $dob = Carbon::parse($assessment->student->date_of_birth);
        $assessmentDate = Carbon::parse($assessment->assessment_date);
        $age = $dob->diff($assessmentDate);

        $totalMonths = ($age->y * 12) + $age->m;
        $isEccd = $totalMonths >= 37;

        $sumScaledScores = 0;
        $totalRawScore = 0;
        $totalMaxPossible = 0;

        $scoreIds = collect($validated['scores'])->pluck('id');
        $scoreRows = AssessmentScore::with('domain')
            ->where('assessment_id', $assessment->id)
            ->whereIn('id', $scoreIds)
            ->get()
            ->keyBy('id');

        foreach ($validated['scores'] as $scoreData) {
            $scoreRow = $scoreRows->get($scoreData['id']);

            if (!$scoreRow)
                continue;

            $rawScore = $scoreData['score'] ?? 0;
            $scaledScore = 0;
            $interpretation = '';

            if ($isEccd) {
                // Ensure this is using domain_id!
                $scaledScore = $scoringService->getScaledScore(
                    $scoreRow->domain_id,
                    $rawScore,
                    $age->y,
                    $age->m
                );
                // 🚀 CORE VS SUPPLEMENTAL ISOLATION
                if ($scoreRow->domain->is_core) {
                    // Only sum core domains for the standard score
                    $sumScaledScores += $scaledScore;
                    $interpretation = $scoringService->getEccdDomainInterpretation($scaledScore);
                } else {
                    // Admin custom domain: Evaluate using simple percentages
                    $interpretation = $scoringService->getItedDomainInterpretation($rawScore, $scoreRow->max_score);
                }

            } else {
                $scaledScore = $rawScore;
                $totalRawScore += $rawScore;
                $totalMaxPossible += $scoreRow->max_score;
                $interpretation = $scoringService->getItedDomainInterpretation($rawScore, $scoreRow->max_score);
            }

            $scoreRow->update([
                'score' => $rawScore,
                'scaled_score' => $scaledScore,
                'rating' => $interpretation,
            ]);
        }

        if ($isEccd) {
            $finalScore = $scoringService->getStandardScore($sumScaledScores);
            $overallInterpretation = $scoringService->getOverallInterpretation($finalScore, $age->y, $age->m);
        } else {
            $finalScore = $totalRawScore;
            $overallInterpretation = $scoringService->getOverallInterpretation($totalRawScore, $age->y, $age->m, $totalMaxPossible);
        }

        $manualDate = $validated['next_assessment_date'] ?? null;
        $autoDate = $scoringService->calculateNextDueDate($finalScore, $assessment->assessment_date, $age->y);
        $finalNextDate = ($manualDate && $manualDate !== 'TBD') ? $manualDate : $autoDate;

        $assessment->update([
            'status' => $validated['status'],
            'overall_score' => $finalScore,
            // 🚀 FIX: Actually save the sum to the database so the frontend can read it!
            'sum_of_scaled' => $isEccd ? $sumScaledScores : null,
            'overall_rating' => $overallInterpretation,
            'completed_at' => ($validated['status'] === 'Completed' && !$assessment->completed_at) ? now() : $assessment->completed_at,
            'next_assessment_date' => $finalNextDate,
        ]);

        if ($validated['status'] === 'Completed') {

            // Get all parents linked to this student
            $parents = $assessment->student->parents;

            if ($parents && $parents->count() > 0) {
                // Send the alert to every linked parent
                foreach ($parents as $parent) {
                    $parent->notify(new AppNotification(
                        'assessment',
                        'New Evaluation Available',
                        "The developmental assessment for {$assessment->student->first_name} has been finalized.",
                        route('parent.assessments.show', $assessment->id)
                    ));
                }
            }
        }

        $assessment->load('scores.domain');
        event(new AssessmentUpdated($assessment));
        return Redirect::back()->with('success', 'Assessment saved successfully!');

    }

    public function destroy($id)
    {
        $daycareId = $this->getTeacherDaycareId();
        $assessment = Assessment::where('daycare_id', $daycareId)->findOrFail($id);

        if ($assessment->status !== 'Draft') {
            return Redirect::back()->with('error', 'Cannot delete an assessment that is in progress or completed.');
        }

        $assessment->delete();
        event(new AssessmentUpdated($assessment));
        return Redirect::back()->with('success', 'Assessment draft deleted.');
    }

    private function redirectToForm($student, $assessmentId)
    {
        // 🚀 FIX: Get the assessment to find the correct historical date
        $assessment = Assessment::findOrFail($assessmentId);
        $evalDate = Carbon::parse($assessment->assessment_date);

        // 🚀 FIX: Calculate age based on the evaluation date, NOT today!
        $ageInMonths = Carbon::parse($student->date_of_birth)->diffInMonths($evalDate);

        if ($ageInMonths <= 36) {
            return redirect()->route('teacher.assessments.ited.form', ['assessment' => $assessmentId]);
        } else {
            return redirect()->route('teacher.assessments.eccd.form', ['assessment' => $assessmentId]);
        }
    }

    public function itedForm($assessmentId)
    {
        $assessment = Assessment::with('student', 'scores.domain')->findOrFail($assessmentId);

        return Inertia::render('teacher/assessments/ited-form', [
            'assessment' => $assessment,
            // 🚀 PASS RULES TO REACT
            'scoringRules' => [
                'scale' => DB::table('eccd_scale_rules')->get(),
                'standard' => DB::table('eccd_standard_rules')->get(),
            ]
        ]);
    }

    public function eccdForm($assessmentId)
    {
        $assessment = Assessment::with('student', 'scores.domain')->findOrFail($assessmentId);

        return Inertia::render('teacher/assessments/eccd-form', [
            'assessment' => $assessment,
            // 🚀 PASS RULES TO REACT
            'scoringRules' => [
                'scale' => DB::table('eccd_scale_rules')->get(),
                'standard' => DB::table('eccd_standard_rules')->get(),
            ]
        ]);
    }
}
