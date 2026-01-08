import { AssessmentStatsCards } from '@/components/admin/assessment-stats-cards';
import { AssessmentStatusCharts } from '@/components/admin/assessment-status-charts';
import { AssessmentTable } from '@/components/admin/assessment-table';
import { AssessmentDetailsDialog } from '@/components/shared/assessment-details-dialog';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

// --- TYPES ---
interface RawAssessment {
    id: number;
    student_id: number;
    teacher_id: number;
    daycare_id: number;
    evaluation_number?: string;
    assessment_date: string;
    status: 'Draft' | 'In Progress' | 'Completed';
    overall_score?: number;
    student?: { first_name: string; last_name: string };
    teacher?: { first_name: string; last_name: string };
    daycare?: { name: string };
    scores?: any[];
}

interface AssessmentOverviewProps {
    assessments: RawAssessment[];
    daycares: { id: number; name: string }[];
    evaluators: { id: number; first_name: string; last_name: string }[];
}
const breadcrumbs = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Assessment Overview', href: '/admin/assessments/overview' },
];
export default function AssessmentOverview({ assessments = [], daycares = [], evaluators = [] }: AssessmentOverviewProps) {
    // Global State (only for details dialog if needed)
    const [viewingAssessment, setViewingAssessment] = useState<any | null>(null);

    // 1. Data Transformation
    const formattedAssessments = useMemo(() => {
        return assessments.map((a) => {
            const sumOfScaled = a.scores ? a.scores.reduce((acc: number, curr: any) => acc + (Number(curr.score) || 0), 0) : 0;
            return {
                id: a.id,
                childName: a.student ? `${a.student.first_name} ${a.student.last_name}` : 'Unknown Child',
                childId: a.student_id,
                evaluation: a.evaluation_number || `#${a.id}`,
                dateCreated: new Date(a.assessment_date).toLocaleDateString(),
                evaluator: a.teacher ? `${a.teacher.first_name} ${a.teacher.last_name}` : 'Unknown',
                daycareName: a.daycare?.name || 'Unknown Daycare',
                status: a.status,
                standardScore: Number(a.overall_score) || 0,
                sumOfScaled: sumOfScaled,
                original: a,
            };
        });
    }, [assessments]);

    // 2. Global Calculations
    const stats = useMemo(() => {
        const total = formattedAssessments.length;
        const completed = formattedAssessments.filter((a) => a.status === 'Completed').length;
        const draft = formattedAssessments.filter((a) => a.status === 'Draft').length;
        const inProgress = formattedAssessments.filter((a) => a.status === 'In Progress').length;

        const completedItems = formattedAssessments.filter((a) => a.status === 'Completed');
        const avgScore =
            completedItems.length > 0 ? Math.round(completedItems.reduce((acc, a) => acc + a.standardScore, 0) / completedItems.length) : 0;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const uniqueChildren = new Set(formattedAssessments.map((a) => a.childId)).size;

        return { total, completed, draft, inProgress, avgScore, rate, uniqueChildren };
    }, [formattedAssessments]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assessment Overview" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-black">Assessment System Overview</h2>
                        <p className="mt-2 text-[rgba(64,64,64,0.7)]">Monitor and analyze assessment data across all daycare centers</p>
                    </div>

                    {/* Sub-Components */}
                    <AssessmentStatsCards stats={stats} evaluatorCount={evaluators.length} />

                    <AssessmentStatusCharts stats={stats} />

                    <AssessmentTable
                        assessments={formattedAssessments}
                        daycares={daycares}
                        evaluators={evaluators}
                        onViewDetails={(a) => setViewingAssessment(a)}
                    />

                    {viewingAssessment && (
                        <AssessmentDetailsDialog
                            open={!!viewingAssessment}
                            onOpenChange={(open) => !open && setViewingAssessment(null)}
                            assessment={viewingAssessment}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
