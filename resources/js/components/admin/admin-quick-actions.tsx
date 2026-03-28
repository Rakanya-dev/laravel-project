import { UserCheck, Building2, BarChart3, FileOutput } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface QuickAction {
    icon: React.ElementType;
    label: string;
    description: string;
    color: string;
    iconBg: string;
    onClick: () => void;
}

interface AdminQuickActionsProps {
    onReviewEnrollments: () => void;
    onManageDaycares: () => void;
    onViewAssessmentAnalytics: () => void;
    onGenerateAnnualReport: () => void;
}

export default function AdminQuickActions({
    onReviewEnrollments,
    onManageDaycares,
    onViewAssessmentAnalytics,
    onGenerateAnnualReport
}: AdminQuickActionsProps) {
    const actions: QuickAction[] = [
        {
            icon: UserCheck,
            label: 'Review Enrollments',
            description: 'Approve pending learners',
            color: 'text-blue-600',
            iconBg: 'bg-blue-100',
            onClick: onReviewEnrollments
        },
        {
            icon: Building2,
            label: 'Manage Centers',
            description: 'CDCs and staff mapping',
            color: 'text-emerald-600',
            iconBg: 'bg-emerald-100',
            onClick: onManageDaycares
        },
        {
            icon: BarChart3,
            label: 'Assessment Analytics',
            description: 'ECCD Checklist results',
            color: 'text-purple-600',
            iconBg: 'bg-purple-100',
            onClick: onViewAssessmentAnalytics
        },
        {
            icon: FileOutput,
            label: 'Generate Report',
            description: 'Official LGU consolidation',
            color: 'text-orange-600',
            iconBg: 'bg-orange-100',
            onClick: onGenerateAnnualReport
        }
    ];

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common ECCD management tasks</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                className="flex h-auto flex-col gap-3 py-6 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                                onClick={action.onClick}
                            >
                                <div className={`rounded-xl ${action.iconBg} p-3`}>
                                    <Icon className={`size-6 ${action.color}`} />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800">{action.label}</p>
                                    <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
