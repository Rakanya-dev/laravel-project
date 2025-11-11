<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\Daycare;
use App\Models\Report; // --- FIX 2: Use the correct 'Report' model ---
use Inertia\Inertia;
use App\Http\Controllers\Controller; // <-- You were missing this

class DashboardController extends Controller // <-- You were missing 'extends Controller'
{
    public function index()
    {
        // --- FIX 1: Use the correct capitalized path 'Admin/Dashboard' ---
        return Inertia::render('admin/dashboard', [
            'teacherCount' => User::where('role', 'teacher')->count(),
            'parentCount' => User::where('role', 'parent')->count(),
            'daycareCount' => Daycare::count(),
            'reportCount' => Report::count(), // --- FIX 2: Query the 'reports' table ---
        ]);
    }
}
