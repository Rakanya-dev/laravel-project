<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\AssessmentDomain;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $teacher = Auth::user();


        $daycare = $teacher->daycare;

        if (!$daycare && $teacher->daycare_id) {
            $daycare = \App\Models\Daycare::find($teacher->daycare_id);
        }

        if (!$daycare) {
            return Inertia::render('teacher/dashboard', [
                'daycareName' => 'Unassigned',
                'teacherName' => $teacher->first_name . ' ' . $teacher->last_name,
                'students' => [],
                'totalStudents' => 0,
                'assessmentsDue' => 0,
                'completedAssessments' => 0,
                'classAverage' => 0,
            ]);
        }

        // 1. Get Students (Active & Archived for history, though stats usually focus on active)
        $students = Student::where('daycare_id', $daycare->id)
            ->withTrashed()
            ->with('parents:id,first_name,last_name,email')
            ->get();

        // 2. Get Assessments for these students
        $studentIds = $students->pluck('id');
        $assessments = Assessment::whereIn('student_id', $studentIds)
            ->orderBy('assessment_date', 'desc')
            ->get();

        // --- 3. Calculate Stats ---

        // Total Active Students
        $totalStudents = $students->whereNull('deleted_at')->count();

        // Completed Assessments
        $completedAssessments = $assessments->where('status', 'Completed')->count();

        // Assessments Due (Active Students - Completed)
        $assessmentsDue = max(0, $totalStudents - $completedAssessments);

        // Class Average
        $classAverage = $assessments->where('status', 'Completed')->avg('overall_score') ?? 0;

        $domains = AssessmentDomain::where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('teacher/dashboard', [
            // Pass the objects if needed for lists
            'daycare' => $daycare,
            'students' => $students,
            'assessments' => $assessments,
            'domains' => $domains,
            // Pass the calculated props for the DashboardOverview component
            'daycareName' => $daycare->name,
            'teacherName' => $teacher->first_name . ' ' . $teacher->last_name,
            'totalStudents' => $totalStudents,
            'assessmentsDue' => $assessmentsDue,
            'completedAssessments' => $completedAssessments,
            'classAverage' => round($classAverage, 1),
        ]);
    }
}
