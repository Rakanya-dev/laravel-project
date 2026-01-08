<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Daycare;
use App\Models\Student;
use App\Models\Assessment;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Define base queries for filtering out admin and head office entries
        $nonAdminUserQuery = User::where('role', '!=', 'admin');

        $nonHeadOfficeDaycareQuery = Daycare::where('name', '!=', 'KIDTRAK Head Office');


        // --- User Stats (Excluding Admin) ---
        $totalUsers = $nonAdminUserQuery->count();
        $activeUsers = $nonAdminUserQuery->where('status', 'active')->count();


        // --- Daycare Stats (Excluding Head Office) ---
        $totalDaycares = $nonHeadOfficeDaycareQuery->count();

        $activeDaycares = (clone $nonHeadOfficeDaycareQuery)->where('status', 'active')->count();


        // --- Student and Assessment Stats ---
        $totalStudents = Student::count();
        $activeStudents = Student::where('status', 'active')->count();
        $totalAssessments = Assessment::count();
        $completedAssessments = Assessment::where('status', 'completed')->count();


        // --- Recent Users (Excluding Admin) ---
        $recentRawUsers = User::with('daycare:id,name')
                            ->where('role', '!=', 'admin')
                            ->orderBy('created_at', 'desc')
                            ->limit(5)
                            ->get();

        // --- System Alerts (Mocked) ---
        $systemAlerts = [
            ['id' => 1, 'type' => 'warning', 'message' => 'Central Branch approaching capacity (98%)', 'time' => '2 hours ago'],
            ['id' => 2, 'type' => 'info', 'message' => 'New assessment template available', 'time' => '5 hours ago'],
        ];

        return Inertia::render('admin/dashboard', [
            'adminName' => $user->first_name,
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'activeDaycares' => $activeDaycares,
            'totalDaycares' => $totalDaycares,
            'totalStudents' => $totalStudents,
            'activeStudents' => $activeStudents,
            'totalAssessments' => $totalAssessments,
            'completedAssessments' => $completedAssessments,
            'recentUsers' => $recentRawUsers,
            'systemAlerts' => $systemAlerts,
        ]);
    }
}
