<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Daycare;
use App\Models\Student;
use App\Models\Assessment;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\EnrollmentRequest;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // --- Obj A: Digital Tracking (Learners) ---
        // 🚀 OPTIMIZATION 1: Single Trip Aggregation (1 query instead of 2)
        $studentStats = Student::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active
        ")->first();

        // 🚀 THIS IS NOW OUR MAIN APPROVAL METRIC
        $pendingEnrollments = EnrollmentRequest::where('status', 'Pending')->count();

        // --- Obj B: Analytics (Assessments) ---
        // 🚀 OPTIMIZATION 2: Single Trip Aggregation (1 query instead of 3)
        $assessmentStats = Assessment::selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'Flagged' THEN 1 ELSE 0 END) as flagged
        ")->first();

        // --- Obj D: System Management (Centers & Staff) ---
        // Cleaned up unused variable assignment
        $totalCenters = Daycare::where('name', '!=', 'KIDTRAK Head Office')->count();

        // Count active teachers/CDWs (excluding admins and parents)
        $activeStaff = User::where('role', 'teacher')
            ->where('status', 'Active')
            ->count();

        // --- Recent Users (Activity Feed) ---
        $recentRawUsers = User::with(['daycare:id,name', 'students.daycare'])
            ->where('role', '!=', 'admin')
            // 🚀 FIX: Sort by actual login time if you have it!
            ->orderBy('last_login_at', 'desc')
            ->limit(6)
            ->get();

        // 🚀 FIRE IT TO THE FRONTEND
        return Inertia::render('admin/dashboard', [
            'adminName' => $user->first_name,

            // Cast to (int) to ensure the frontend receives strict numbers, not numeric strings
            'totalLearners' => (int) ($studentStats->total ?? 0),
            'activeLearners' => (int) ($studentStats->active ?? 0),

            // 🚀 Replaces Obj C entirely
            'pendingEnrollments' => $pendingEnrollments,

            'totalAssessments' => (int) ($assessmentStats->total ?? 0),
            'reportsGenerated' => (int) ($assessmentStats->completed ?? 0),
            'flaggedResults' => (int) ($assessmentStats->flagged ?? 0),

            'totalCenters' => $totalCenters,
            'activeStaff' => $activeStaff,
            'recentUsers' => $recentRawUsers,
        ]);
    }
}
