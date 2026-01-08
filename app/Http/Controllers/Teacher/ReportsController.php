<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Admin\ReportsController as AdminReportsController;
use App\Models\Assessment;
use App\Models\Report;
use App\Models\ReportTemplate;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index()
    {
        $teacher = Auth::user();
        $daycareId = $teacher->daycare_id;

        // 1. Overview Stats (Scoped to Teacher)
        $teacherAssessments = Assessment::where('teacher_id', $teacher->id);

        // Cleanup old temp reports
        Report::where('created_at', '<', Carbon::now()->subDays(90))->delete();
        // --- 1. OVERVIEW STATS ---

        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // Helper to get stats with % change
        $getStat = function ($query) use ($startOfMonth, $startOfLastMonth, $endOfLastMonth) {
            $current = (clone $query)->count();
            // Count records created last month
            $previous = (clone $query)->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

            $change = 0;
            if ($previous > 0) {
                $change = round((($current - $previous) / $previous) * 100);
            } elseif ($current > 0) {
                $change = 100; // 100% growth if started from 0
            }

            return ['value' => $current, 'change' => $change];
        };

        $baseQuery = Assessment::where('teacher_id', $teacher->id);

        $stats = [
            'total' => $getStat($baseQuery),
            'completed' => $getStat((clone $baseQuery)->where('status', 'Completed')),

            'uniqueChildren' => [
                'value' => (clone $baseQuery)->distinct('student_id')->count('student_id'),
                'change' => 0
            ],
            'avgScore' => [
                'value' => round((clone $baseQuery)->where('status', 'Completed')->avg('overall_score') ?? 0, 1),
                'change' => 0
            ]
        ];

        // Add completion rate manually
        $stats['completionRate'] = [
            'value' => $stats['total']['value'] > 0
                ? round(($stats['completed']['value'] / $stats['total']['value']) * 100, 1)
                : 0,
            'change' => 0
        ];
        // --- 2. CHARTS DATA ---

        // A. Monthly Trends
        $monthlyTrends = Assessment::where('teacher_id', $teacher->id)
            ->selectRaw('DATE_FORMAT(created_at, "%b") as month, COUNT(*) as assessments, SUM(CASE WHEN status = "Completed" THEN 1 ELSE 0 END) as completed')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')->orderBy('created_at')->get();

        // B. Domain Performance
        $domainPerformance = DB::table('assessment_scores')
            ->join('assessments', 'assessment_scores.assessment_id', '=', 'assessments.id')
            ->join('assessment_domains', 'assessment_scores.domain_id', '=', 'assessment_domains.id')
            ->where('assessments.teacher_id', $teacher->id)
            ->select('assessment_domains.name as domain', DB::raw('AVG(assessment_scores.score) as score'))
            ->groupBy('assessment_domains.name')->get()
            ->map(fn($item) => ['domain' => $item->domain, 'score' => round($item->score * 5)]); // Scale to %

        // C. Outcome Distribution
        $rawScores = DB::table('assessment_scores')
            ->join('assessments', 'assessment_scores.assessment_id', '=', 'assessments.id')
            ->where('assessments.teacher_id', $teacher->id)
            ->select('assessment_scores.score', 'assessment_scores.rating')
            ->get();

        $distributionCounts = [
            'Advanced' => 0,
            'Proficient' => 0,
            'Developing' => 0,
            'Beginning' => 0
        ];

        foreach ($rawScores as $record) {
            // Priority 1: Use existing text rating
            if (!empty($record->rating)) {
                $distributionCounts[$record->rating] = ($distributionCounts[$record->rating] ?? 0) + 1;
            }
            // Priority 2: Calculate from score if rating is missing
            else {
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

        // Format for Recharts
        $outcomeDistribution = collect($distributionCounts)
            ->filter(fn($val) => $val > 0)
            ->map(fn($value, $key) => [
                'name' => $key,
                'value' => $value,
                'color' => $this->getColorForRating($key)
            ])->values();


        // 3. Recent Reports
        $recentReports = Report::where('generated_by', $teacher->id)
            ->with(['student'])
            ->orderBy('created_at', 'desc')->take(5)->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'title' => $r->report_type . ' - ' . ($r->student?->first_name ?? 'Unknown'),
                'type' => $r->report_type,
                'status' => 'Completed',
                'date' => $r->report_date ? $r->report_date->format('M d, Y') : 'N/A',
                'avgScore' => '-'
            ]);

        // 4. All Generated Reports
        $allTemplates = ReportTemplate::where('is_active', true)->get()->keyBy('type');

        $generatedReports = Report::where('generated_by', $teacher->id)
            ->with(['student'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($r) use ($allTemplates, $teacher) {
                $rawData = $r->content ?? [];
                $template = $allTemplates->get($r->report_type);
                $structuredContent = [];

                if ($template) {
                    $templateDef = is_string($template->content) ? json_decode($template->content, true) : $template->content;
                    foreach ($templateDef['sections'] ?? [] as $section) {
                        $sectionData = [];
                        foreach ($section['fields'] as $field) {
                            if (isset($rawData[$field['id']])) {
                                $sectionData[$field['label']] = $rawData[$field['id']];
                            }
                        }
                        if (!empty($sectionData))
                            $structuredContent[$section['title']] = $sectionData;
                    }
                }

                return [
                    'id' => $r->id,
                    'title' => $r->report_type . ' for ' . ($r->student?->first_name ?? 'Student'),
                    'student' => $r->student ? ($r->student->first_name . ' ' . $r->student->last_name) : 'Unknown',
                    'type' => $r->report_type,
                    'date' => $r->report_date ? $r->report_date->format('M d, Y') : 'N/A',
                    'generated_by' => $teacher->first_name . ' ' . $teacher->last_name,
                    'content' => !empty($structuredContent) ? $structuredContent : $rawData
                ];
            });

        // 5. Templates & Students
        $templates = ReportTemplate::where('is_active', true)->get()
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

        $students = Student::where('daycare_id', $daycareId)
            ->select('id', 'first_name', 'last_name', 'daycare_id')
            ->with('daycare:id,name')->orderBy('first_name')->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->first_name . ' ' . $s->last_name,
                'daycare' => $s->daycare->name ?? 'Unassigned'
            ]);

        return Inertia::render('teacher/reports', [
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
        ]);
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
        return app(AdminReportsController::class)->getReportData($request);
    }

    private function getColorForRating($rating)
    {
        return match (strtolower($rating)) {
            'advanced', 'exceeds', 'excellent' => '#10b981', // Emerald/Green
            'proficient', 'target', 'good' => '#3b82f6', // Blue
            'developing', 'approaching', 'fair' => '#f59e0b', // Amber/Orange
            'beginning', 'emerging', 'needs improvement' => '#ef4444', // Red
            default => '#94a3b8', // Slate/Gray
        };
    }
}
