<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Daycare;
use App\Models\User;
use Inertia\Inertia;

class AssessmentOverviewController extends Controller
{
    public function index()
    {
        // 1. Fetch Assessments with necessary relationships
        $assessments = Assessment::with([
            'student:id,first_name,last_name,daycare_id',
            'teacher:id,first_name,last_name',
            'daycare:id,name',
            'scores.domain'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        // 2. Fetch Filter Options
        $daycares = Daycare::orderBy('name')->get(['id', 'name']);

        // Fetch users who are teachers or admins (evaluators)
        $evaluators = User::whereIn('role', ['teacher'])
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        return Inertia::render('admin/assessments-overview', [
            'assessments' => $assessments,
            'daycares' => $daycares,
            'evaluators' => $evaluators,
        ]);
    }
}
