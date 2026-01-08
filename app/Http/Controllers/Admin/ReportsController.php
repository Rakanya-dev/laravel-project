<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Report;
use App\Models\ReportTemplate;
use App\Models\Student;
use App\Models\AssessmentScore;
use App\Models\Daycare;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class ReportsController extends Controller
{
    public function index()
    {
        Report::where('created_at', '<', Carbon::now()->subDays(90))->delete();

        // --- 1. OVERVIEW STATS (With % Change) ---
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Helper for stats
        $getStat = function ($query) use ($startOfLastMonth, $endOfLastMonth) {
            $current = (clone $query)->count();
            $previous = (clone $query)->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

            $change = 0;
            if ($previous > 0) {
                $change = round((($current - $previous) / $previous) * 100);
            } elseif ($current > 0) {
                $change = 100;
            }
            return ['value' => $current, 'change' => $change];
        };

        // Base Query (Global for Admin)
        $baseQuery = Assessment::query();

        $stats = [
            'total' => $getStat($baseQuery),
            'uniqueChildren' => [
                'value' => (clone $baseQuery)->distinct('student_id')->count('student_id'),
                'change' => 0
            ],
            'avgScore' => [
                'value' => round((clone $baseQuery)->where('status', 'Completed')->avg('overall_score') ?? 0, 1),
                'change' => 0
            ],
            'completionRate' => [
                'value' => 0,
                'change' => 0
            ]
        ];

        // Calc Completion Rate
        $completedCount = (clone $baseQuery)->where('status', 'Completed')->count();
        if ($stats['total']['value'] > 0) {
            $stats['completionRate']['value'] = round(($completedCount / $stats['total']['value']) * 100, 1);
        }

        // --- 2. CHARTS DATA ---

        // A. Monthly Trends
        $monthlyTrends = Assessment::selectRaw('DATE_FORMAT(created_at, "%b") as month, COUNT(*) as assessments, SUM(CASE WHEN status = "Completed" THEN 1 ELSE 0 END) as completed')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')->orderBy('created_at')->get();

        // B. Domain Performance
        $domainPerformance = DB::table('assessment_scores')
            ->join('assessment_domains', 'assessment_scores.domain_id', '=', 'assessment_domains.id')
            ->select('assessment_domains.name as domain', DB::raw('AVG(assessment_scores.score) as score'))
            ->groupBy('assessment_domains.name')->get()
            ->map(fn($item) => ['domain' => $item->domain, 'score' => round($item->score * 5)]);

        // C. Outcome Distribution
        $rawScores = DB::table('assessment_scores')
            ->join('assessments', 'assessment_scores.assessment_id', '=', 'assessments.id')
            ->select('assessment_scores.score', 'assessment_scores.rating')
            ->get();

        $distributionCounts = [
            'Advanced' => 0,
            'Proficient' => 0,
            'Developing' => 0,
            'Beginning' => 0
        ];

        foreach ($rawScores as $record) {
            if (!empty($record->rating)) {
                $key = ucfirst(strtolower($record->rating));
                // Handle naming variations
                if (isset($distributionCounts[$key])) {
                    $distributionCounts[$key]++;
                } else {
                    $distributionCounts[$key] = ($distributionCounts[$key] ?? 0) + 1;
                }
            } else {
                // Fallback Calculation
                $score = $record->score;
                if ($score >= 17)
                    $distributionCounts['Advanced']++;
                elseif ($score >= 13)
                    $distributionCounts['Proficient']++;
                elseif ($score >= 8)
                    $distributionCounts['Developing']++;
                else
                    $distributionCounts['Beginning']++;
            }
        }

        $outcomeDistribution = collect($distributionCounts)
            ->filter(fn($val) => $val > 0)
            ->map(fn($value, $key) => [
                'name' => $key,
                'value' => $value,
                'color' => $this->getColorForRating($key)
            ])->values();


        // --- 3. RECENT & GENERATED REPORTS ---
        $recentReports = Report::with(['student'])
            ->orderBy('created_at', 'desc')->take(5)->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'title' => $r->report_type . ' - ' . ($r->student?->first_name ?? 'Unknown'),
                'type' => $r->report_type,
                'status' => 'Completed',
                'date' => $r->report_date ? $r->report_date->format('M d, Y') : 'N/A',
                'avgScore' => '-'
            ]);

        // 4. Generated Reports
        $allTemplates = ReportTemplate::where('is_active', true)->get()->keyBy('type');
        $generatedReports = Report::with(['student', 'generator'])
            ->orderBy('created_at', 'desc')->get()
            ->map(function ($r) use ($allTemplates) {
                $rawData = $r->content;
                if (is_string($rawData)) {
                    $decoded = json_decode($rawData, true);
                    $rawData = is_array($decoded) ? $decoded : [];
                } elseif (is_object($rawData)) {
                    $rawData = (array) $rawData;
                } elseif (!is_array($rawData)) {
                    $rawData = [];
                }

                $template = $allTemplates->get($r->report_type);
                $structuredContent = [];

                if ($template) {
                    $templateDef = is_string($template->content) ? json_decode($template->content, true) : $template->content;
                    $sections = $templateDef['sections'] ?? [];

                    foreach ($sections as $section) {
                        $sectionData = [];
                        foreach ($section['fields'] as $field) {
                            $id = $field['id'];
                            if (array_key_exists($id, $rawData)) {
                                $sectionData[$field['label']] = $rawData[$id];
                            }
                        }
                        if (!empty($sectionData)) {
                            $structuredContent[$section['title']] = $sectionData;
                        }
                    }
                } else {
                    $structuredContent['Report Data'] = $rawData;
                }

                return [
                    'id' => $r->id,
                    'title' => $r->report_type . ' for ' . ($r->student?->first_name ?? 'Deleted Student'),
                    'student' => $r->student ? ($r->student->first_name . ' ' . $r->student->last_name) : 'Unknown',
                    'type' => $r->report_type,
                    'date' => $r->report_date ? $r->report_date->format('M d, Y') : 'N/A',
                    'generated_by' => $r->generator ? ($r->generator->first_name . ' ' . $r->generator->last_name) : 'System',
                    'content' => !empty($structuredContent) ? $structuredContent : $rawData
                ];
            });

        // 5. Templates List
        $templates = ReportTemplate::where('is_active', true)->orderBy('updated_at', 'desc')->get()
            ->map(function ($t) {
                $content = is_string($t->content) ? json_decode($t->content, true) : $t->content;
                return [
                    'id' => (string) $t->id,
                    'name' => $t->name,
                    'description' => $t->description,
                    'category' => $t->type,
                    'frequency' => $content['frequency'] ?? 'As needed',
                    'lastUsed' => $t->updated_at->diffForHumans(),
                    'sections' => $content['sections'] ?? [],
                    'settings' => $content['settings'] ?? []
                ];
            });

        // 6. Students List
        $students = Student::select('id', 'first_name', 'last_name', 'daycare_id')
            ->with('daycare:id,name')->orderBy('first_name')->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->first_name . ' ' . $s->last_name,
                'daycare' => $s->daycare->name ?? 'Unassigned'
            ]);

        // 7. Export Counts
        $exportCounts = [
            'assessment_data' => Assessment::count(),
            'development_domains' => AssessmentScore::count(),
            'children_information' => Student::count(),
            'class_performance' => Daycare::count(),
            'teacher_reports' => Report::count(),
            'compliance_reports' => DB::table('activity_log')->count(),
        ];

        return Inertia::render('admin/reports', [
            'overviewStats' => $stats,
            'analytics' => [
                'monthlyTrends' => $monthlyTrends,
                'domainPerformance' => $domainPerformance,
                'outcomeDistribution' => $outcomeDistribution
            ],
            'recentReports' => $recentReports,
            'generatedReports' => $generatedReports,
            'templates' => $templates,
            'students' => $students,
            'exportCounts' => $exportCounts
        ]);
    }

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'frequency' => 'required|string',
            'sections' => 'required|array',
            'settings' => 'required|array',
        ]);

        ReportTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'type' => $validated['category'],
            'content' => json_encode([
                'frequency' => $validated['frequency'],
                'sections' => $validated['sections'],
                'settings' => $validated['settings']
            ]),
            'is_active' => true
        ]);

        return Redirect::back()->with('success', 'Template created.');
    }

    public function updateTemplate(Request $request, $id)
    {
        $template = ReportTemplate::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'frequency' => 'required|string',
            'sections' => 'required|array',
            'settings' => 'required|array',
        ]);

        $template->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'type' => $validated['category'],
            'content' => json_encode([
                'frequency' => $validated['frequency'],
                'sections' => $validated['sections'],
                'settings' => $validated['settings']
            ]),
        ]);
        return Redirect::back()->with('success', 'Template updated.');
    }

    public function destroyTemplate($id)
    {
        ReportTemplate::findOrFail($id)->delete();
        return Redirect::back()->with('success', 'Template deleted.');
    }

    public function storeReport(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'template_id' => 'required|exists:report_templates,id',
            'report_date' => 'required|date',
            'content' => 'required|array',
        ]);

        $template = ReportTemplate::find($validated['template_id']);

        Report::create([
            'student_id' => $validated['student_id'],
            'generated_by' => Auth::id(),
            'report_type' => $template->type,
            'report_date' => $validated['report_date'],
            'content' => $validated['content'],
        ]);

        return Redirect::back()->with('success', 'Report generated successfully.');
    }

    public function getReportData(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'template_id' => 'required|exists:report_templates,id',
        ]);

        $student = Student::with('daycare')->find($request->student_id);
        $template = ReportTemplate::find($request->template_id);

        $latestAssessment = Assessment::where('student_id', $student->id)
            ->where('status', 'Completed')
            ->with(['scores.domain', 'teacher'])
            ->latest('assessment_date')
            ->first();

        // Historical Data for Trend Charts
        $history = Assessment::where('student_id', $student->id)
            ->where('status', 'Completed')
            ->orderBy('assessment_date', 'asc')
            ->limit(6)
            ->get(['assessment_date', 'overall_score']);

        $templateContent = is_string($template->content) ? json_decode($template->content, true) : $template->content;
        $sections = $templateContent['sections'] ?? [];

        $formData = [];

        foreach ($sections as $section) {
            foreach ($section['fields'] as $field) {
                $label = strtolower($field['label']);
                $id = $field['id'];
                $type = $field['type'];

                // --- CHARTS LOGIC ---
                if ($type === 'chart') {
                    if (str_contains($label, 'trend') || str_contains($label, 'progress')) {
                        // Monthly Trend Data
                        $chartData = $history->map(function ($assess) {
                            return [
                                'name' => $assess->assessment_date->format('M'),
                                'fullDate' => $assess->assessment_date->format('Y-m-d'),
                                'score' => (float) $assess->overall_score
                            ];
                        })->values();
                        $formData[$id] = $chartData;
                    } elseif (str_contains($label, 'domain') || str_contains($label, 'skill') || str_contains($label, 'motor')) {
                        // Domain Comparison Data
                        if ($latestAssessment) {
                            $chartData = $latestAssessment->scores->map(function ($score) {
                                return [
                                    'name' => $score->domain->name,
                                    'score' => (float) $score->score,
                                    'fullMark' => 20
                                ];
                            })->values();
                            $formData[$id] = $chartData;
                        }
                    }
                }

                // --- Basic Info ---
                if (str_contains($label, 'student') || str_contains($label, 'child name')) {
                    $formData[$id] = $student->first_name . ' ' . $student->last_name;
                } elseif (str_contains($label, 'age')) {
                    if ($student->date_of_birth) {
                        $dob = Carbon::parse($student->date_of_birth);
                        $now = Carbon::now();
                        $diff = $dob->diff($now);
                        $formData[$id] = $diff->y . ' years, ' . $diff->m . ' months';
                    }
                } elseif (str_contains($label, 'daycare') || str_contains($label, 'center')) {
                    $formData[$id] = $student->daycare->name ?? 'Unassigned';
                } elseif (str_contains($label, 'report date') || ($label === 'date' && $type === 'date')) {
                    $formData[$id] = now()->format('Y-m-d');
                } elseif (str_contains($label, 'teacher') || str_contains($label, 'assessor')) {
                    $formData[$id] = $latestAssessment && $latestAssessment->teacher
                        ? $latestAssessment->teacher->first_name . ' ' . $latestAssessment->teacher->last_name
                        : Auth::user()->first_name . ' ' . Auth::user()->last_name;
                }

                // --- Scores ---
                if ($latestAssessment && ($type === 'number' || $type === 'text')) {
                    $findScore = function ($keywords) use ($latestAssessment) {
                        foreach ($latestAssessment->scores as $score) {
                            $domainName = strtolower($score->domain->name);
                            foreach ($keywords as $keyword) {
                                if (str_contains($domainName, $keyword))
                                    return $score->score;
                            }
                        }
                        return null;
                    };

                    if (str_contains($label, 'cognitive'))
                        $val = $findScore(['cognitive']);
                    elseif (str_contains($label, 'gross') || str_contains($label, 'physical'))
                        $val = $findScore(['gross', 'physical']);
                    elseif (str_contains($label, 'fine'))
                        $val = $findScore(['fine']);
                    elseif (str_contains($label, 'social') || str_contains($label, 'emotional'))
                        $val = $findScore(['social', 'emotional']);
                    elseif (str_contains($label, 'language') || str_contains($label, 'communication'))
                        $val = $findScore(['language', 'communication']);
                    elseif (str_contains($label, 'self') || str_contains($label, 'adaptive'))
                        $val = $findScore(['self', 'help', 'adaptive']);

                    if (isset($val))
                        $formData[$id] = $val;
                }
            }
        }

        return response()->json([
            'formData' => $formData,
            'message' => $latestAssessment ? 'Data auto-filled from latest assessment.' : 'Student info filled. No completed assessment found.'
        ]);
    }

    public function export(Request $request)
    {
        // Increase limits for large exports
        ini_set('memory_limit', '512M');
        ini_set('max_execution_time', 300);

        try {
            $type = $request->input('type');
            $format = $request->input('format', 'csv');
            $range = $request->input('range', 'all');

            // 1. Date Filter Helper
            $dateQuery = function ($query, $column = 'created_at') use ($range) {
                if ($range === 'last-month') {
                    // Use subMonth() to get exactly 1 month ago
                    $query->where($column, '>=', now()->subMonth()->startOfDay());
                } elseif ($range === 'last-3-months') {
                    $query->where($column, '>=', now()->subMonths(3)->startOfDay());
                } elseif ($range === 'ytd') {
                    $query->where($column, '>=', now()->startOfYear());
                }
            };

            $data = collect();

            // Determine Extension
            $ext = ($format === 'json') ? 'json' : 'csv';
            $filename = $type . '_' . date('Y-m-d_His') . '.' . $ext;

            // 2. Data Fetching
            switch ($type) {
                case 'assessment_data':
                    $query = DB::table('assessments')
                        ->leftJoin('students', 'assessments.student_id', '=', 'students.id')
                        ->leftJoin('users as teachers', 'assessments.teacher_id', '=', 'teachers.id')
                        ->leftJoin('daycares', 'assessments.daycare_id', '=', 'daycares.id')
                        ->select(
                            'assessments.id as ID',
                            DB::raw("CONCAT(COALESCE(students.first_name,''), ' ', COALESCE(students.last_name,'')) as Student"),
                            'assessments.assessment_type as Type',
                            'assessments.assessment_date as Date',
                            'assessments.overall_score as Score',
                            DB::raw("CONCAT(COALESCE(teachers.first_name,''), ' ', COALESCE(teachers.last_name,'')) as Evaluator"),
                            DB::raw("COALESCE(daycares.name, 'N/A') as Center")
                        );

                    // Apply date filter
                    $dateQuery($query, 'assessments.assessment_date');

                    // Cast to array for CSV compatibility
                    $data = $query->get()->map(fn($row) => (array) $row);
                    break;

                case 'development_domains':
                    $query = DB::table('assessment_scores')
                        ->join('assessments', 'assessment_scores.assessment_id', '=', 'assessments.id')
                        ->join('students', 'assessments.student_id', '=', 'students.id')
                        ->join('assessment_domains', 'assessment_scores.domain_id', '=', 'assessment_domains.id')
                        ->select(
                            DB::raw("CONCAT(students.first_name, ' ', students.last_name) as Student"),
                            'assessments.assessment_date as Date',
                            'assessment_domains.name as Domain',
                            'assessment_scores.score as Score'
                        );
                    $dateQuery($query, 'assessments.assessment_date');
                    $data = $query->get()->map(fn($i) => (array) $i);
                    break;

                case 'children_information':
                    $query = DB::table('students')
                        ->leftJoin('daycares', 'students.daycare_id', '=', 'daycares.id')
                        ->select(
                            'students.id as ID',
                            DB::raw("CONCAT(students.first_name, ' ', students.last_name) as Name"),
                            'students.date_of_birth as DOB',
                            'students.gender as Gender',
                            DB::raw("COALESCE(daycares.name, 'Unassigned') as Center")
                        );
                    $dateQuery($query, 'students.created_at');
                    $data = $query->get()->map(fn($s) => (array) $s);
                    break;

                case 'class_performance':
                    $data = DB::table('assessments')
                        ->join('daycares', 'assessments.daycare_id', '=', 'daycares.id')
                        ->select('daycares.name as Daycare', DB::raw('ROUND(AVG(overall_score), 2) as Average_Score'), DB::raw('COUNT(*) as Count'))
                        ->groupBy('daycares.name')
                        ->get()
                        ->map(fn($i) => (array) $i);
                    break;

                case 'teacher_reports':
                    $query = DB::table('reports')
                        ->leftJoin('users', 'reports.generated_by', '=', 'users.id')
                        ->leftJoin('students', 'reports.student_id', '=', 'students.id')
                        ->select(
                            'reports.id as ID',
                            'reports.report_type as Type',
                            DB::raw("CONCAT(students.first_name, ' ', students.last_name) as Student"),
                            'reports.report_date as Date',
                            DB::raw("CONCAT(users.first_name, ' ', users.last_name) as Generator")
                        );
                    $dateQuery($query, 'reports.report_date');
                    $data = $query->get()->map(fn($r) => (array) $r);
                    break;

                case 'compliance_reports':
                    $query = DB::table('activity_log')
                        ->leftJoin('users', 'activity_log.causer_id', '=', 'users.id')
                        ->select(
                            'activity_log.created_at as Time',
                            DB::raw("COALESCE(users.email, 'System/Unknown') as User"),
                            'activity_log.description as Action',
                            'activity_log.properties as Details'
                        );

                    $dateQuery($query, 'activity_log.created_at');

                    $data = $query->limit(1000)->get()->map(function ($i) {
                        $details = json_decode($i->Details, true);

                        if (isset($details['attributes'])) {
                            $changes = [];
                            foreach ($details['attributes'] as $key => $val) {
                                $changes[] = "$key: $val";
                            }
                            $i->Details = implode(', ', $changes);
                        }

                        return (array) $i;
                    });
                    break;
            }

            // --- 3. Return JSON ---
            if ($format === 'json') {
                return Response::json($data, 200, ['Content-Disposition' => "attachment; filename=\"$filename\""]);
            }

            // --- 4. Return CSV Stream ---
            $headers = [
                'Content-type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0'
            ];

            if (ob_get_length())
                ob_end_clean();

            $callback = function () use ($data) {
                $file = fopen('php://output', 'w');

                if ($data->count() > 0) {
                    fputs($file, "\xEF\xBB\xBF");

                    // Header Row
                    fputcsv($file, array_keys($data->first()));

                    // Data Rows
                    foreach ($data as $row) {
                        fputcsv($file, $row);
                    }
                } else {
                    fputcsv($file, ['Status']);
                    fputcsv($file, ['No records found for the selected criteria.']);
                }
                fclose($file);
            };

            if ($format === 'json') {
                return response()->json($data, 200, ['Content-Disposition' => "attachment; filename=\"$filename\""]);
            }

            return response()->stream($callback, 200, $headers);

        } catch (\Throwable $e) {
            Log::error("Export Failed: " . $e->getMessage() . "\n" . $e->getTraceAsString());

            // Return JSON error with 500 status
            return response()->json([
                'error' => 'Export failed. Please check server logs.',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function getColorForRating($rating)
    {
        return match (strtolower($rating)) {
            'advanced', 'exceeds', 'above average' => '#10b981', // Green
            'proficient', 'target', 'average' => '#3b82f6', // Blue
            'developing', 'approaching', 'needs support' => '#f59e0b', // Amber
            'beginning', 'emerging' => '#ef4444', // Red
            default => '#94a3b8', // Gray
        };
    }
}
