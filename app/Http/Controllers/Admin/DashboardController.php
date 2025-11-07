<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\Daycare;
use App\Models\AssessmentReport;
use Inertia\Inertia;

class DashboardController
{
    public function index()
    {
        return Inertia::render('admin/dashboard', [
            'teacherCount' => User::where('account_type', 'teacher')->count(),
            'parentCount' => User::where('account_type', 'parent')->count(),
            'daycareCount' => Daycare::count(),
            'reportCount' => AssessmentReport::count(), // Make sure this model exists
        ]);
    }
}
