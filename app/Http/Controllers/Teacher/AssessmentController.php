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
use Illuminate\Auth\Access\AuthorizationException;

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

        $students = Student::where('daycare_id', $daycareId)
            ->with('daycare:id,name')
            ->get(['id', 'daycare_id', 'first_name', 'middle_name', 'last_name', 'date_of_birth']);

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



            return $assessment;
        });

        $sortedAssessments = $assessmentsWithNumbers->sortByDesc('assessment_date')->values();

        return Inertia::render('teacher/assessments', [
            'assessments' => $sortedAssessments,
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $teacher = Auth::user();
        $daycareId = $this->getTeacherDaycareId();

        $validated = $request->validate([
            'student_id' => ['required', 'integer', Rule::exists('students', 'id')->where('daycare_id', $daycareId)],
            'assessment_type' => 'required|string',
        ]);

        $exists = Assessment::where('student_id', $validated['student_id'])
            ->whereIn('status', ['Draft', 'In Progress'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['student_id' => 'This student already has an assessment in progress.']);
        }

        $student = Student::find($validated['student_id']);

        $previousScores = [];
        $previousNotes = "";
        $previousRecs = "";

        if ($validated['assessment_type'] === 'followup') {
            $lastAssessment = Assessment::where('student_id', $student->id)
                ->where('status', 'Completed')
                ->with('scores')
                ->latest('assessment_date')
                ->first();

            if ($lastAssessment) {
                $previousScores = $lastAssessment->scores->pluck('score', 'domain_id')->toArray();

                $previousNotes = "Follow-up to " . ($lastAssessment->assessment_date ? $lastAssessment->assessment_date->format('M Y') : 'previous') . " assessment.\n\n" . $lastAssessment->overall_notes;
                $previousRecs = $lastAssessment->recommendations;
            }
        }
        // -----------------------------------------------------

        $assessment = Assessment::create([
            'student_id' => $student->id,
            'teacher_id' => $teacher->id,
            'daycare_id' => $daycareId,
            'assessment_date' => now(),
            'assessment_type' => $validated['assessment_type'],
            'status' => 'Draft',
            'school_year' => now()->year . '-' . (now()->year + 1),
            'semester' => (now()->month > 6) ? '1st' : '2nd',
            'overall_score' => 0,
            'overall_rating' => 'Not Started',
            'assessment_summary' => $previousNotes,
            'recommendation' => $previousRecs,
        ]);

        $domains = AssessmentDomain::where('is_active', true)->orderBy('sort_order')->get();
        $scores = [];

        foreach ($domains as $domain) {
            $scoreValue = $previousScores[$domain->id] ?? 0;

            $scores[] = [
                'assessment_id' => $assessment->id,
                'domain_id' => $domain->id,
                'score' => $scoreValue,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if (!empty($scores)) {
            AssessmentScore::insert($scores);
        }

        // --- REAL-TIME TRIGGER ---
        AssessmentCreated::dispatch($teacher->id);

        return Redirect::back()->with('success', 'New assessment created.');
    }

    public function update(Request $request, $id)
    {
        $daycareId = $this->getTeacherDaycareId();
        $assessment = Assessment::where('daycare_id', $daycareId)->findOrFail($id);

        $validated = $request->validate([
            'overall_notes' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'next_assessment_date' => 'nullable|string',
            'status' => ['required', Rule::in(['Draft', 'In Progress', 'Completed'])],
            'overall_score' => 'nullable|numeric',
            'scores' => 'required|array',
            'scores.*.id' => 'required|integer|exists:assessment_scores,id',
            'scores.*.score' => 'nullable|numeric|min:0',
            'scores.*.notes' => 'nullable|string',
        ]);

        foreach ($validated['scores'] as $scoreData) {
            AssessmentScore::where('id', $scoreData['id'])
                ->where('assessment_id', $assessment->id)
                ->update(['score' => $scoreData['score'], 'notes' => $scoreData['notes'] ?? null]);
        }


        $nextDate = $validated['next_assessment_date'] ?? null;
        if ($nextDate === 'TBD') {
            $nextDate = null;
        }

        $assessment->update([
            'overall_notes' => $validated['overall_notes'] ?? $assessment->overall_notes,
            'recommendations' => $validated['recommendations'] ?? $assessment->recommendations,
            'status' => $validated['status'],
            'overall_score' => $validated['overall_score'] ?? 0,
            'completed_at' => ($validated['status'] === 'Completed' && !$assessment->completed_at) ? now() : $assessment->completed_at,
            'next_assessment_date' => $nextDate,
        ]);

        // --- AUTO-FOLLOW-UP LOGIC ---
        $assessment->refresh();

        if ($assessment->status === 'Completed' && $assessment->overall_score < 85) {
            // Check if a future assessment already exists to prevent duplicates
            $futureExists = Assessment::where('student_id', $assessment->student_id)
                ->where('created_at', '>', $assessment->created_at)
                ->exists();

            if (!$futureExists) {
                $targetDate = now()->addMonths(3);

                $followUp = Assessment::create([
                    'student_id' => $assessment->student_id,
                    'teacher_id' => Auth::id(),
                    'daycare_id' => $daycareId,
                    'assessment_date' => $targetDate,
                    'assessment_type' => 'Follow-up',
                    'status' => 'Draft',
                    'school_year' => $targetDate->year . '-' . ($targetDate->year + 1),
                    'semester' => ($targetDate->month > 6) ? '1st' : '2nd',
                    'overall_score' => 0,
                    'overall_rating' => 'Not Started',
                    'assessment_summary' => "Automatically generated follow-up due to previous assessment results requiring monitoring.",
                    'recommendation' => "Review areas of concern from previous assessment.",
                ]);

                // Create scores for the follow-up (starting at 0 or copying previous)
                $domains = AssessmentDomain::where('is_active', true)->orderBy('sort_order')->get();
                $currentScores = $assessment->scores->pluck('score', 'domain_id');
                $newScores = [];

                foreach ($domains as $domain) {
                    $newScores[] = [
                        'assessment_id' => $followUp->id,
                        'domain_id' => $domain->id,
                        'score' => $currentScores[$domain->id] ?? 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                AssessmentScore::insert($newScores);

                // Dispatch event for the NEW auto-generated assessment
                AssessmentCreated::dispatch(Auth::id());

                // Optional: Flash a message about the auto-creation
                return Redirect::back()->with('success', 'Assessment saved. A follow-up has been automatically scheduled due to low scores.');
            }
        }

        // --- REAL-TIME TRIGGER ---
        AssessmentUpdated::dispatch(Auth::id());

        return Redirect::back()->with('success', 'Assessment saved successfully!');
    }

    public function destroy($id)
    {
        $daycareId = $this->getTeacherDaycareId();
        $assessment = Assessment::where('daycare_id', $daycareId)->findOrFail($id);

        if ($assessment->status !== 'Draft')
            return Redirect::back()->with('error', 'Cannot delete an assessment that is in progress or completed.');

        $assessment->delete();

        AssessmentUpdated::dispatch(Auth::id());

        return Redirect::back()->with('success', 'Assessment draft deleted.');
    }
}
