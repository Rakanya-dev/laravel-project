<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\AssessmentDomain;
use App\Models\Daycare;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $teacher = Auth::user();

        // 🚀 OPTIMIZATION 1: Cleaned up Daycare resolution using the null coalescing operator
        $daycare = $teacher->daycare ?? ($teacher->daycare_id ? Daycare::find($teacher->daycare_id) : null);

        if (!$daycare) {
            return Inertia::render('teacher/dashboard', [
                'daycareName' => 'Unassigned',
                'teacherName' => trim("{$teacher->first_name} {$teacher->last_name}"),
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
        // 🚀 OPTIMIZATION 2: Inline pluck saves variable assignment memory
        $assessments = Assessment::whereIn('student_id', $students->pluck('id'))
            ->orderBy('assessment_date', 'desc')
            ->get();

        // --- 3. Calculate Stats ---
        // (PERFORMANCE NOTE: Doing this on the Collections prevents 4 extra database queries!)
        $totalStudents = $students->whereNull('deleted_at')->count();
        $completedAssessments = $assessments->where('status', 'Completed')->count();
        $assessmentsDue = max(0, $totalStudents - $completedAssessments);
        $classAverage = $assessments->where('status', 'Completed')->avg('overall_score') ?? 0;

        $domains = AssessmentDomain::where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('teacher/dashboard', [
            'daycare' => $daycare,
            'students' => $students,
            'assessments' => $assessments,
            'domains' => $domains,
            'daycareName' => $daycare->name,
            'teacherName' => trim("{$teacher->first_name} {$teacher->last_name}"),
            'totalStudents' => $totalStudents,
            'assessmentsDue' => $assessmentsDue,
            'completedAssessments' => $completedAssessments,
            'classAverage' => round($classAverage, 1),
        ]);
    }
}
