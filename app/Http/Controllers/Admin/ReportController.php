<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Daycare;
use App\Models\Assessment;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function index()
    {
        // 1. Get all completed 3rd Assessments with their scores and domains
        $assessments = Assessment::with(['scores.domain'])
            ->where('assessment_type', '3rd Assessment')
            ->where('status', 'Completed')
            ->get();

        // 2. Initialize an array to hold the totals and counts for averaging
        $domainStats = [];
        $daycareList = Daycare::orderBy('name')->pluck('name');

        foreach ($assessments as $assessment) {
            foreach ($assessment->scores as $score) {
                $domainName = $score->domain->name;

                if (!isset($domainStats[$domainName])) {
                    $domainStats[$domainName] = ['total' => 0, 'count' => 0];
                }

                $domainStats[$domainName]['total'] += $score->scaled_score;
                $domainStats[$domainName]['count']++;
            }
        }

        // 3. Calculate the final averages to send to React
        $chartData = [];
        foreach ($domainStats as $name => $stats) {
            $chartData[] = [
                'domain' => $name,
                'averageScore' => $stats['count'] > 0 ? round($stats['total'] / $stats['count'], 1) : 0
            ];
        }

        // --- 4. SYSTEM COMPLIANCE STATS ---
        $totalActiveStudents = Student::whereNull('deleted_at')->count();

        $completedCount = Assessment::where('assessment_type', '3rd Assessment')
            ->where('status', 'Completed')->count();

        $inProgressCount = Assessment::where('assessment_type', '3rd Assessment')
            ->whereIn('status', ['Draft', 'In Progress'])->count();

        $missingCount = max(0, $totalActiveStudents - ($completedCount + $inProgressCount));

        $complianceChartData = [
            ['name' => 'Completed', 'value' => $completedCount, 'color' => '#10b981'],
            ['name' => 'In Progress', 'value' => $inProgressCount, 'color' => '#f59e0b'],
            ['name' => 'Not Started', 'value' => $missingCount, 'color' => '#ef4444'],
        ];

        // --- 5. 🚀 NEW: MASTER ROSTER PREVIEW DATA ---
        // Fetch up to 100 students for the preview panel to keep loading fast
        // --- 🚀 NEW: Check if React is asking for a specific daycare ---
        $selectedDaycare = request('daycare', 'all');

        $masterQuery = Student::whereHas('assessments', function ($query) {
            $query->where('assessment_type', '3rd Assessment')
                ->where('status', 'Completed')
                ->where('form_type', 'record_2');
        })
            ->with([
                'daycare',
                'assessments' => function ($query) {
                    $query->where('assessment_type', '3rd Assessment')
                        ->where('status', 'Completed')
                        ->where('form_type', 'record_2')
                        ->latest('assessment_date');
                }
            ])
            ->whereNull('deleted_at');

        // 🚀 Apply the Database Filter if a specific daycare is selected!
        if ($selectedDaycare !== 'all') {
            $masterQuery->whereHas('daycare', function ($q) use ($selectedDaycare) {
                $q->where('name', $selectedDaycare);
            });
        }

        // Now we fetch the data (it will only pull the 100 students for the selected center)
        $rawMasterData = $masterQuery
            ->orderBy('daycare_id')
            ->orderBy('last_name')
            ->take(100)
            ->get()
            ->map(function ($student) {
                $finalAssessment = $student->assessments->first();
                $isDevelopmentallyOnTrack = in_array($finalAssessment->overall_rating, ['Average', 'Highly Advanced', 'Slight Delay']);

                return [
                    'id' => $student->id,
                    'name' => $student->last_name . ', ' . $student->first_name,
                    'daycare' => $student->daycare ? $student->daycare->name : 'Unassigned',
                    'final_score' => $finalAssessment->overall_score,
                    'status' => $isDevelopmentallyOnTrack ? 'Eligible' : 'Needs Review'
                ];
            });


        // --- 6. 🚀 NEW: COMPLIANCE AUDIT PREVIEW DATA ---
        $rawAuditData = Daycare::with([
            'students' => function ($query) {
                $query->whereNull('deleted_at')->with('assessments');
            }
        ])->get()->map(function ($daycare) {
            $total = $daycare->students->count();

            if ($total === 0)
                return null; // Skip daycares with no students

            // Helper function to calculate status string for a given period
            $getStatus = function ($period) use ($daycare, $total) {
                $completed = 0;
                foreach ($daycare->students as $student) {
                    $assessment = $student->assessments->where('assessment_type', $period)->first();
                    if ($assessment && $assessment->status === 'Completed') {
                        $completed++;
                    }
                }

                if ($completed === 0)
                    return 'Missing';
                if ($completed === $total)
                    return 'Complete';
                return 'Pending'; // Partially completed
            };

            return [
                'center_name' => $daycare->name,
                'p1_status' => $getStatus('1st Assessment'),
                'p2_status' => $getStatus('2nd Assessment'),
                'p3_status' => $getStatus('3rd Assessment'),
            ];
        })->filter()->values();


        // Pass everything to the React Frontend
        return inertia('admin/reports/index', [
            'domainReports' => $chartData,
            'complianceStats' => $complianceChartData,
            'rawMasterData' => $rawMasterData,
            'rawAuditData' => $rawAuditData,
            'daycareList' => $daycareList,
        ]);
    }

    public function exportMasterRoster(Request $request)
    {
        $fileName = 'graduating_class_roster_' . date('Y-m-d') . '.csv';

        // 1. Start building the query
        $query = Student::whereHas('assessments', function ($query) {
            $query->where('assessment_type', '3rd Assessment')
                ->where('status', 'Completed')
                ->where('form_type', 'record_2');
        })
            ->with([
                'daycare',
                'assessments' => function ($query) {
                    $query->where('assessment_type', '3rd Assessment')
                        ->where('status', 'Completed')
                        ->where('form_type', 'record_2')
                        ->latest('assessment_date');
                }
            ])
            ->whereNull('deleted_at');

        // 🚀 2. THE FIX: Handle Specific IDs OR Daycare Filters
        if ($request->filled('ids')) {
            // If they checked specific boxes, ONLY export those students
            $selectedIds = explode(',', $request->input('ids'));
            $query->whereIn('id', $selectedIds);
        } elseif ($request->filled('daycare')) {
            // If NO boxes are checked, but they filtered a specific Daycare, export all for that Daycare
            $daycareName = $request->input('daycare');
            $query->whereHas('daycare', function ($q) use ($daycareName) {
                $q->where('name', $daycareName);
            });
        }
        // If neither 'ids' nor 'daycare' is present, it will naturally export the entire database.

        // 3. Apply the sorting
        $query->orderBy('daycare_id')->orderBy('last_name');

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = [
            'Student ID',
            'Last Name',
            'First Name',
            'Daycare Branch',
            'Final Assessment Date',
            'Overall Score',
            'Overall Rating',
            'Graduation Status'
        ];

        $callback = function () use ($query, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($query->cursor() as $student) {
                $finalAssessment = $student->assessments->first();

                $isDevelopmentallyOnTrack = in_array($finalAssessment->overall_rating, ['Average', 'Highly Advanced', 'Slight Delay']);

                $gradStatus = $isDevelopmentallyOnTrack
                    ? 'Ready for Kindergarten'
                    : 'Ready for Kindergarten (Needs SPED/Intervention Review)';

                $row = [
                    $student->id,
                    $student->last_name,
                    $student->first_name,
                    $student->daycare ? $student->daycare->name : 'Unassigned',
                    $finalAssessment->assessment_date->format('M d, Y'),
                    $finalAssessment->overall_score,
                    $finalAssessment->overall_rating,
                    $gradStatus
                ];

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }
    public function exportComplianceAudit(Request $request)
    {
        $fileName = 'compliance_audit_' . date('Y-m-d') . '.csv';

        // OPTIMIZATION: Build query, no ->get()
        $query = Daycare::with([
            'students' => function ($query) {
                $query->whereNull('deleted_at')->with('assessments');
            }
        ]);

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = [
            'Daycare Branch',
            'Assessment Period',
            'Total Active Students',
            'Completed',
            'In Progress / Draft',
            'Missing (Not Started)',
            'Compliance Rate (%)'
        ];

        $callback = function () use ($query, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            $periods = ['1st Assessment', '2nd Assessment', '3rd Assessment'];

            // OPTIMIZATION: Streaming daycares via cursor()
            foreach ($query->cursor() as $daycare) {
                $totalStudents = $daycare->students->count();

                if ($totalStudents === 0) {
                    continue;
                }

                foreach ($periods as $period) {
                    $completed = 0;
                    $inProgressOrDraft = 0;

                    foreach ($daycare->students as $student) {
                        $assessment = $student->assessments->where('assessment_type', $period)->first();

                        if ($assessment) {
                            if ($assessment->status === 'Completed') {
                                $completed++;
                            } elseif (in_array($assessment->status, ['Draft', 'In Progress'])) {
                                $inProgressOrDraft++;
                            }
                        }
                    }

                    $missing = $totalStudents - ($completed + $inProgressOrDraft);
                    $complianceRate = $totalStudents > 0 ? round(($completed / $totalStudents) * 100, 2) : 0;

                    $row = [
                        $daycare->name,
                        $period,
                        $totalStudents,
                        $completed,
                        $inProgressOrDraft,
                        $missing,
                        $complianceRate . '%'
                    ];

                    fputcsv($file, $row);
                }
            }

            fclose($file);
        };

        return new StreamedResponse($callback, 200, $headers);
    }

    public function exportConsolidatedReport(Request $request)
    {
        $fileName = 'consolidated_domain_report_' . date('Y-m-d') . '.pdf';

        $daycares = Daycare::with([
            'students' => function ($query) {
                $query->whereNull('deleted_at')
                    ->with([
                        'assessments' => function ($q) {
                            $q->where('assessment_type', '3rd Assessment')
                                ->where('status', 'Completed')
                                ->with('scores.domain');
                        }
                    ]);
            }
        ])->get();

        $reportData = [];

        foreach ($daycares as $daycare) {
            $domainStats = [];
            $studentCount = 0;

            foreach ($daycare->students as $student) {
                $assessment = $student->assessments->first();
                if ($assessment) {
                    $studentCount++;
                    foreach ($assessment->scores as $score) {
                        $domainName = $score->domain->name;
                        if (!isset($domainStats[$domainName])) {
                            $domainStats[$domainName] = ['total' => 0, 'count' => 0];
                        }
                        $domainStats[$domainName]['total'] += $score->scaled_score;
                        $domainStats[$domainName]['count']++;
                    }
                }
            }

            $averages = [];
            foreach ($domainStats as $name => $stats) {
                $averages[$name] = $stats['count'] > 0 ? round($stats['total'] / $stats['count'], 1) : 0;
            }

            $reportData[] = [
                'branch_name' => $daycare->name,
                'evaluated_students' => $studentCount,
                'domain_averages' => $averages
            ];
        }

        $pdf = Pdf::loadView('reports.consolidated-pdf', [
            'reportData' => $reportData,
            'date' => now()->format('F d, Y')
        ]);

        if ($request->boolean('print')) {
            return $pdf->stream($fileName);
        }

        return $pdf->download($fileName);
    }
}
