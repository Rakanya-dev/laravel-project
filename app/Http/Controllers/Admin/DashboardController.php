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
        $totalLearners = Student::count();
        $activeLearners = Student::where('status', 'Active')->count();

        // 🚀 THIS IS NOW OUR MAIN APPROVAL METRIC
        $pendingEnrollments = EnrollmentRequest::where('status', 'Pending')->count();

        // --- Obj B: Analytics (Assessments) ---
        $totalAssessments = Assessment::count();
        $reportsGenerated = Assessment::where('status', 'Completed')->count();
        $flaggedResults = Assessment::where('status', 'Flagged')->count();

        // --- Obj D: System Management (Centers & Staff) ---
        $nonHeadOfficeDaycareQuery = Daycare::where('name', '!=', 'KIDTRAK Head Office');
        $totalCenters = $nonHeadOfficeDaycareQuery->count();

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
            'totalLearners' => $totalLearners,
            'activeLearners' => $activeLearners,

            // 🚀 Replaces Obj C entirely
            'pendingEnrollments' => $pendingEnrollments,

            'totalAssessments' => $totalAssessments,
            'reportsGenerated' => $reportsGenerated,
            'flaggedResults' => $flaggedResults,

            'totalCenters' => $totalCenters,
            'activeStaff' => $activeStaff,
            'recentUsers' => $recentRawUsers,
        ]);
    }
}
