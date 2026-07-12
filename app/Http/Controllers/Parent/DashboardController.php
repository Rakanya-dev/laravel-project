<?php

namespace App\Http\Controllers\Parent;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Message;
use App\Models\EnrollmentRequest;
use App\Models\Daycare;
use App\Models\User;

class DashboardController extends Controller
{
    /**
     * 1. THE MAIN ENTRY POINT
     */
    public function index()
    {
        $parent = Auth::user();

        // 🚀 OPTIMIZATION 1: Fetch students ONCE and sort their relationships at the DB level!
        $students = $parent->students()
            ->with([
                'daycare',
                'assessments' => fn($q) => $q->orderBy('assessment_date', 'desc'),
                'assessments.scores.domain',
                'assessments.teacher',
                'reports' => fn($q) => $q->orderBy('report_date', 'desc')
            ])
            ->get();

        // 🚀 NEW: Extract Daycare IDs to find the assigned teachers
        $daycareIds = $students->pluck('daycare_id')->unique()->filter()->toArray();

        // 🚀 NEW: Pass the raw teachers array explicitly so React can safely merge them without poller issues
        $teachers = User::where('role', 'teacher')
            ->whereIn('daycare_id', $daycareIds)
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->first_name . ' ' . $teacher->last_name,
                    'role' => ucfirst($teacher->role ?? 'Child Development Worker'),
                ];
            });

        return Inertia::render('parent/dashboard', [
            'user' => $parent,
            'conversations' => $this->getConversations($parent), // Now only returns ACTUAL active chats
            'students' => $this->getStudentsData($students),
            'daycares' => Daycare::select('id', 'name')->get(),
            'pendingEnrollment' => EnrollmentRequest::where('user_id', $parent->id)->where('status', 'Pending')->first(),
            'teachers' => $teachers, // 🚀 Passed explicitly here!
        ]);
    }

    /**
     * 2. EXTRACTED: CONVERSATION LOGIC
     */
    private function getConversations($parent)
    {
        // 🚀 Simplified: Only get ACTIVE chats. React will automatically inject the empty teachers.
        return Message::where('sender_id', $parent->id)
            ->orWhere('recipient_id', $parent->id)
            ->with(['sender', 'recipient'])
            ->get()
            ->groupBy(function ($msg) use ($parent) {
                return $msg->sender_id === $parent->id ? $msg->recipient_id : $msg->sender_id;
            })
            ->map(function ($msgs) use ($parent) {
                $lastMsg = $msgs->sortByDesc('created_at')->first();
                $otherUser = $lastMsg->sender_id === $parent->id ? $lastMsg->recipient : $lastMsg->sender;

                if (!$otherUser) return null;

                return [
                    'contact_id' => $otherUser->id,
                    'contact_name' => $otherUser->first_name . ' ' . $otherUser->last_name,
                    'contact_avatar' => $otherUser->profile_photo,
                    'contact_role' => ucfirst($otherUser->role ?? 'Teacher'),
                    'last_message' => $lastMsg->body,
                    'time' => $lastMsg->created_at->diffForHumans(null, true, true),
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * 3. EXTRACTED: STUDENT DATA LOGIC
     */
    private function getStudentsData($students)
    {
        return $students->map(function ($child) {
            $sortedAssessments = $child->assessments;
            $lastAssessment = $sortedAssessments->first();
            $latestReport = $child->reports->first();

            return [
                'id' => $child->id,
                'name' => $child->first_name . ' ' . $child->last_name,
                'daycare' => $child->daycare->name ?? 'Unknown Daycare',
                'age' => ($child->age_years ?? 0) . ' yrs',
                'overview' => [
                    'next_due' => $lastAssessment && $lastAssessment->next_assessment_date ? Carbon::parse($lastAssessment->next_assessment_date)->format('M d, Y') : 'TBD',
                    'latest_report_id' => $latestReport ? $latestReport->id : null,
                    'progress_summary' => $this->calculateProgressSummary($lastAssessment)
                ],
                'assessments' => $sortedAssessments->map(function ($a) {
                    return [
                        'id' => $a->id,
                        'evaluation' => $a->assessment_type ?? 'Assessment',
                        'evaluator' => $a->teacher ? ($a->teacher->first_name . ' ' . $a->teacher->last_name) : 'Daycare Teacher',
                        'dateCreated' => $a->assessment_date ?? $a->created_at,
                        'standardScore' => (int) $a->standard_score,
                        'sumOfScaled' => (int) $a->sum_of_scaled,
                        'assessmentSummary' => $a->remarks ?? '',
                        'recommendation' => $a->recommendation ?? '',
                        'nextAssessmentDue' => $a->next_assessment_date ? Carbon::parse($a->next_assessment_date)->format('M d, Y') : 'TBD',
                        'assessment_type' => $a->assessment_type,
                        'assessment_date' => $a->assessment_date ?? $a->created_at,
                        'overall_score' => $a->overall_score ?? $a->standard_score,
                        'status' => $a->status,
                        'scores' => $a->scores->map(function ($score) {
                            return [
                                'id' => $score->id,
                                'domain_name' => $score->domain->name ?? 'Unknown',
                                'description' => $score->domain->description ?? '',
                                'is_core' => (bool) ($score->domain->is_core ?? true),
                                'raw_score' => (float) ($score->score ?? 0),
                                'raw_max' => (float) ($score->max_score ?? 0),
                                'scaled_score' => (float) ($score->scaled_score ?? 0),
                            ];
                        })->values(),
                    ];
                })->values(),
                'reports' => $sortedAssessments->where('status', 'Completed')->count() > 0
                    ? collect([
                        [
                            'id' => $child->id,
                            'title' => 'Official ECCD Report Card',
                            'type' => 'Consolidated Record',
                            'evaluator' => 'Daycare Administration',
                            'date' => now()->toDateString(),
                            'summary' => 'This is the official compilation of developmental milestones achieved by ' . $child->first_name . '.',
                            'badge' => 'bg-indigo-100 text-indigo-800'
                        ]
                    ])
                    : collect([]),
            ];
        });
    }

    /**
     * 4. EXTRACTED: SCORE CALCULATION MATH
     */
    private function calculateProgressSummary($lastAssessment)
    {
        if (!$lastAssessment || !$lastAssessment->scores) {
            return [];
        }

        $totalMonths = (($lastAssessment->age_years ?? 0) * 12) + ($lastAssessment->age_months ?? 0);
        $isEccd = $totalMonths >= 37;

        return $lastAssessment->scores
            ->map(function ($score) use ($isEccd) {

                if (!$score->domain) {
                    return null;
                }

                $rawMax = (float) ($score->max_score ?? $score->domain->max_score ?? 0);
                if ($rawMax <= 0) $rawMax = 1;

                if ($isEccd && $score->domain->is_core) {
                    $chartMax = 19;
                    $chartScore = (float) ($score->scaled_score ?? 0);
                } else {
                    $chartMax = $rawMax;
                    $chartScore = (float) ($score->score ?? 0);
                }

                return [
                    'name' => $score->domain->name,
                    'is_core' => $score->domain->is_core,
                    'description' => $score->domain->description ?? '',
                    'raw_score' => (float) ($score->score ?? 0),
                    'raw_max' => $rawMax,
                    'scaled_score' => (float) ($score->scaled_score ?? 0),
                    'score' => $chartScore,
                    'fullMark' => $chartMax,
                ];
            })
            ->filter()
            ->values();
    }
}
