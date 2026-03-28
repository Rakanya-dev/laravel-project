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

        foreach ($assessments as $assessment) {
            foreach ($assessment->scores as $score) {
                // We need the domain name to group them (e.g., 'Gross Motor')
                $domainName = $score->domain->name;

                if (!isset($domainStats[$domainName])) {
                    $domainStats[$domainName] = ['total' => 0, 'count' => 0];
                }

                // Add the scaled_score to the total and increment the count
                $domainStats[$domainName]['total'] += $score->scaled_score;
                $domainStats[$domainName]['count']++;
            }
        }

        // 3. Calculate the final averages to send to React
        $chartData = [];
        foreach ($domainStats as $name => $stats) {
            $chartData[] = [
                'domain' => $name,
                // Round to 1 decimal place for cleaner charts
                'averageScore' => $stats['count'] > 0 ? round($stats['total'] / $stats['count'], 1) : 0
            ];
        }

        // --- 2. NEW: SYSTEM COMPLIANCE STATS ---
        $totalActiveStudents = Student::whereNull('deleted_at')->count();

        $completedCount = Assessment::where('assessment_type', '3rd Assessment')
            ->where('status', 'Completed')->count();

        $inProgressCount = Assessment::where('assessment_type', '3rd Assessment')
            ->whereIn('status', ['Draft', 'In Progress'])->count();

        // Anyone without a completed or in-progress assessment is missing it entirely
        $missingCount = max(0, $totalActiveStudents - ($completedCount + $inProgressCount));

        $complianceChartData = [
            ['name' => 'Completed', 'value' => $completedCount, 'color' => '#10b981'], // Emerald
            ['name' => 'In Progress', 'value' => $inProgressCount, 'color' => '#f59e0b'], // Amber
            ['name' => 'Not Started', 'value' => $missingCount, 'color' => '#ef4444'], // Red
        ];

        // Send it to the Inertia frontend!
        return inertia('admin/reports/index', [
            'domainReports' => $chartData,
            'complianceStats' => $complianceChartData
        ]);
    }
    public function exportMasterRoster(Request $request)
    {
        $fileName = 'graduating_class_roster_' . date('Y-m-d') . '.csv';

        // 1. STRICT QUERY: Only get students who have a COMPLETED 3rd Assessment on the ECCD (Older Kids) form.
        $students = Student::whereHas('assessments', function ($query) {
            $query->where('assessment_type', '3rd Assessment')
                ->where('status', 'Completed')
                ->where('form_type', 'record_2'); // record_2 is your ECCD form for 3-5 year olds!
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
            ->whereNull('deleted_at')
            ->orderBy('daycare_id')
            ->orderBy('last_name')
            ->get();

        // 2. Setup the CSV Stream
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        // 3. Clean Columns (We don't need "Form Used" anymore since it's ONLY ECCD kids)
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

        $callback = function () use ($students, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($students as $student) {
                // We know this exists now because of the strict query above!
                $finalAssessment = $student->assessments->first();

                // Check their final ECCD rating
                $isDevelopmentallyOnTrack = in_array($finalAssessment->overall_rating, ['Average', 'Highly Advanced', 'Slight Delay']);

                if ($isDevelopmentallyOnTrack) {
                    $gradStatus = 'Ready for Kindergarten';
                } else {
                    // This catches "Significant Delay" or other low markers
                    $gradStatus = 'Ready for Kindergarten (Needs SPED/Intervention Review)';
                }

                $row = [
                    $student->id,
                    $student->last_name,
                    $student->first_name,
                    $student->daycare ? $student->daycare->name : 'Unassigned',
                    $finalAssessment->assessment_date->format('M d, Y'), // Formatted nicely!
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

        // Get all daycares with their active students and those students' assessments
        $daycares = Daycare::with([
            'students' => function ($query) {
                $query->whereNull('deleted_at')->with('assessments');
            }
        ])->get();

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

        $callback = function () use ($daycares, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            $periods = ['1st Assessment', '2nd Assessment', '3rd Assessment'];

            foreach ($daycares as $daycare) {
                $totalStudents = $daycare->students->count();

                if ($totalStudents === 0) {
                    continue; // Skip empty branches
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
        // 1. Get all daycares and their completed 3rd assessments
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

        // 2. Crunch the numbers per branch
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

            // Format the averages for this branch
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

        // 3. Generate the PDF using a Blade view
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
