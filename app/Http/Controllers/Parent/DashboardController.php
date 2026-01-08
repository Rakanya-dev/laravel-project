<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Student;

class DashboardController extends Controller
{
    public function index()
    {
        $parent = Auth::user();


        $hasActiveChild = $parent->students()
            ->wherePivot('status', 'active')
            ->exists();

        $hasPendingChild = $parent->students()
            ->wherePivot('status', 'pending')
            ->exists();

        if (!$hasActiveChild && $hasPendingChild) {
             return Inertia::render('auth/pending-approval');
        }

        if (!$hasActiveChild && !$hasPendingChild) {
             return Inertia::render('parent/no-child-linked');
        }

        $students = $parent->students()
            ->wherePivot('status', 'active')
            ->with(['daycare:id,name'])
            ->get()
            ->map(function ($child) {
                $allAssessments = $child->assessments()
                    ->with(['scores.domain'])
                    ->orderBy('assessment_date', 'desc')
                    ->get()
                    ->map(function ($assessment) {
                        return [
                            'id' => $assessment->id,
                            'evaluation' => 'Evaluation #' . $assessment->id,
                            'evaluator' => $assessment->teacher ? $assessment->teacher->first_name . ' ' . $assessment->teacher->last_name : 'Unknown',
                            'dateCreated' => $assessment->assessment_date ? $assessment->assessment_date->format('Y-m-d') : now()->format('Y-m-d'),
                            'standardScore' => $assessment->overall_score ?? 0,
                            'sumOfScaled' => 0,
                            'assessmentSummary' => $assessment->overall_notes,
                            'recommendation' => $assessment->recommendations,
                            'nextAssessmentDue' => $assessment->next_assessment_date ? $assessment->next_assessment_date->format('Y-m-d') : 'TBD',
                            'domainScores' => $assessment->scores->map(function($score) {
                                return [
                                    'domain' => $score->domain->name,
                                    'rawScore' => $score->score,
                                    'scaledScore' => 0,
                                    'interpretation' => $score->rating ?? 'Pending'
                                ];
                            }),
                        ];
                    });

                // Get the very last assessment for the "Progress" summary card
                $lastAssessment = $child->assessments()
                    ->with(['scores.domain'])
                    ->latest('assessment_date')
                    ->first();

                $progressData = [];

                if ($lastAssessment) {
                    $progressData = $lastAssessment->scores->map(function($score) {
                        $max = $score->max_score > 0 ? $score->max_score : 10;
                        $percentage = ($score->score / $max) * 100;

                        return [
                            'name' => $score->domain->name,
                            'score' => $score->score,
                            'max' => $max,
                            'percentage' => round($percentage),
                        ];
                    });
                }

                return [
                    'id' => $child->id,
                    'name' => $child->first_name . ' ' . $child->last_name,
                    'age' => $child->age_years ?? 0,
                    'daycare' => $child->daycare->name ?? 'Unknown',
                    'progress' => $progressData,
                    'attendance' => 95,
                    'last_assessment_date' => $lastAssessment && $lastAssessment->assessment_date ? $lastAssessment->assessment_date->format('M d, Y') : 'N/A',
                    'assessments' => $allAssessments,
                ];
            });

        return Inertia::render('parent/dashboard', [
            'students' => $students
        ]);
    }
}
