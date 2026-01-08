<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\Assessment;
use App\Models\ParentNote;
use Carbon\Carbon;

class ChildController extends Controller
{
    public function index()
    {
        $parent = Auth::user();

        // 1. Get Child
        $child = $parent->students()
            ->withPivot('status')
            ->orderByRaw("FIELD(student_parent.status, 'active', 'pending')")
            ->first();

        if (!$child)
            return Inertia::render('parent/no-child-linked');
        if ($child->pivot->status === 'pending')
            return Inertia::render('auth/pending-approval');

        // 2. Fetch Assessments
        $assessments = Assessment::where('student_id', $child->id)
            ->with([
                'student.daycare',
                'teacher',
                'scores.domain'
            ])
            ->orderBy('assessment_date', 'desc')
            ->get()
            ->map(function ($assessment) {
                return [
                    'id' => $assessment->id,
                    'status' => $assessment->status,

                    'childName' => $assessment->student ? $assessment->student->first_name . ' ' . $assessment->student->last_name : 'Unknown',
                    'daycareName' => $assessment->student->daycare->name ?? 'N/A',

                    'evaluation' => 'Evaluation #' . $assessment->id,
                    'evaluator' => $assessment->teacher ? $assessment->teacher->first_name . ' ' . $assessment->teacher->last_name : 'Unknown',
                    'dateCreated' => Carbon::parse($assessment->assessment_date)->format('Y-m-d'),

                    // Maps standardScore for the UI
                    'standardScore' => $assessment->overall_score ?? 0,

                    // Text fields
                    'assessmentSummary' => $assessment->overall_notes,
                    'recommendation' => $assessment->recommendations,
                    'nextAssessmentDue' => $assessment->next_assessment_date ? Carbon::parse($assessment->next_assessment_date)->format('Y-m-d') : 'TBD',

                    'domainScoresRaw' => $assessment->scores,

                    // --- 3. For the Parent List View (Table) ---
                    'domainScores' => $assessment->scores->map(function ($score) {
                        return [
                            'domain' => $score->domain->name,
                            'rawScore' => $score->score,
                            'scaledScore' => $score->scaled_score ?? 0,
                            'interpretation' => $score->rating ?? 'Pending'
                        ];
                    }),
                ];
            });

        // 3. Fetch Notes
        $savedNotes = ParentNote::where('parent_id', $parent->id)
            ->where('student_id', $child->id)
            ->orderBy('note_date', 'desc')
            ->get();

        return Inertia::render('parent/child-profile', [
            'child' => $child,
            'user' => $parent,
            'childAssessments' => $assessments,
            'savedNotes' => $savedNotes,
            'generatedReports' => [],
        ]);
    }
}
