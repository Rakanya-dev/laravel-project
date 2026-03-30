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
        // This prevents double-querying and saves PHP RAM.
        $students = $parent->students()
            ->with([
                'daycare',
                'assessments' => fn($q) => $q->orderBy('assessment_date', 'desc'),
                'assessments.scores.domain',
                'assessments.teacher',
                'reports' => fn($q) => $q->orderBy('report_date', 'desc')
            ])
            ->get();

        return Inertia::render('parent/dashboard', [
            'user' => $parent,
            // Pass the pre-loaded students collection to the helpers
            'conversations' => $this->getConversations($parent, $students),
            'students' => $this->getStudentsData($students),
            'daycares' => Daycare::select('id', 'name')->get(),
            'pendingEnrollment' => EnrollmentRequest::where('user_id', $parent->id)->where('status', 'Pending')->first(),
        ]);
    }

    /**
     * 2. EXTRACTED: CONVERSATION LOGIC
     */
    private function getConversations($parent, $students)
    {
        // Get active chats
        $existingConversations = Message::where('sender_id', $parent->id)
            ->orWhere('recipient_id', $parent->id)
            ->with(['sender', 'recipient'])
            ->get()
            ->groupBy(function ($msg) use ($parent) {
                return $msg->sender_id === $parent->id ? $msg->recipient_id : $msg->sender_id;
            })
            ->map(function ($msgs) use ($parent) {
                $lastMsg = $msgs->sortByDesc('created_at')->first();
                $otherUser = $lastMsg->sender_id === $parent->id ? $lastMsg->recipient : $lastMsg->sender;

                if (!$otherUser)
                    return null;

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

        // Get teachers the parent hasn't talked to yet
        $existingContactIds = $existingConversations->pluck('contact_id')->toArray();

        // 🚀 OPTIMIZATION 2: Re-use the in-memory students collection instead of hitting the DB again!
        $daycareIds = $students->pluck('daycare_id')->unique()->filter()->toArray();

        $availableTeachers = User::where('role', 'teacher')
            ->whereIn('daycare_id', $daycareIds)
            ->whereNotIn('id', $existingContactIds)
            ->get()
            ->map(function ($teacher) {
                return [
                    'contact_id' => $teacher->id,
                    'contact_name' => $teacher->first_name . ' ' . $teacher->last_name,
                    'contact_avatar' => $teacher->profile_photo,
                    'contact_role' => 'Teacher',
                    'last_message' => 'Say hello to start the conversation!',
                    'time' => '',
                ];
            });

        return collect($existingConversations)->concat($availableTeachers)->values();
    }

    /**
     * 3. EXTRACTED: STUDENT DATA LOGIC
     */
    private function getStudentsData($students)
    {
        return $students->map(function ($child) {
            // 🚀 OPTIMIZATION 3: No need to sortByDesc() here anymore! The DB already did it perfectly.
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
                        'scores' => $a->scores,
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
        if (!$lastAssessment || !$lastAssessment->scores)
            return [];

        $totalMonths = (($lastAssessment->age_years ?? 0) * 12) + ($lastAssessment->age_months ?? 0);
        $isEccd = $totalMonths >= 37;

        return $lastAssessment->scores->map(function ($score) use ($isEccd) {
            $itedMaxScores = [
                'Gross Motor' => 13,
                'Fine Motor' => 11,
                'Self-Help' => 27,
                'Receptive Language' => 5,
                'Expressive Language' => 8,
                'Cognitive' => 21,
                'Socio-Emotional' => 24,
            ];

            $fullMark = $isEccd ? 19 : (float) ($score->max_score ?: ($itedMaxScores[$score->domain->name] ?? 20));

            return [
                'name' => $score->domain ? $score->domain->name : 'Domain',
                'score' => $isEccd ? (float) ($score->scaled_score ?? 0) : (float) ($score->score ?? 0),
                'fullMark' => $fullMark,
            ];
        })->values();
    }
}
