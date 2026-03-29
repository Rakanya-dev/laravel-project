import { Plus, Users, MessageSquare, ClipboardList, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface QuickAction {
    icon: React.ElementType;
    label: string;
    description: string;
    color: string;
    iconBg: string;
    hoverBg: string;
    onClick: () => void;
}

interface TeacherQuickActionsProps {
    onNewAssessment?: () => void;
    onViewStudents?: () => void;
    onViewMessages?: () => void;
    onViewAssessments?: () => void;
}

export function TeacherQuickActions({
    onNewAssessment = () => { },
    onViewStudents = () => { },
    onViewMessages = () => { },
    onViewAssessments = () => { }
}: TeacherQuickActionsProps) {
    const actions: QuickAction[] = [
        {
            icon: Plus,
            label: 'New Assessment',
            description: 'Start grading a student',
            color: 'text-indigo-600',
            iconBg: 'bg-indigo-50',
            hoverBg: 'hover:border-indigo-200 hover:bg-indigo-50/30',
            onClick: onNewAssessment
        },
        {
            icon: ClipboardList,
            label: 'Manage Assessments',
            description: 'Resume grading & complete drafts',
            color: 'text-emerald-600',
            iconBg: 'bg-emerald-50',
            hoverBg: 'hover:border-emerald-200 hover:bg-emerald-50/30',
            onClick: onViewAssessments
        },
        {
            icon: Users,
            label: 'Class Roster',
            description: 'View student profiles',
            color: 'text-blue-600',
            iconBg: 'bg-blue-50',
            hoverBg: 'hover:border-blue-200 hover:bg-blue-50/30',
            onClick: onViewStudents
        },
        {
            icon: MessageSquare,
            label: 'Messages',
            description: 'Contact parents or admin',
            color: 'text-amber-600',
            iconBg: 'bg-amber-50',
            hoverBg: 'hover:border-amber-200 hover:bg-amber-50/30',
            onClick: onViewMessages
        }
    ];

    return (
        <div className="grid gap-3">
            {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                    <Button
                        key={index}
                        variant="outline"
                        className={`group h-auto w-full justify-between rounded-2xl border-slate-200 bg-white p-4 transition-all duration-200 ${action.hoverBg}`}
                        onClick={action.onClick}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`rounded-xl ${action.iconBg} p-3 transition-transform group-hover:scale-110`}>
                                <Icon className={`size-5 ${action.color}`} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-800">{action.label}</p>
                                <p className="text-xs font-medium text-slate-500">{action.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="size-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-500" />
                    </Button>
                );
            })}
        </div>
    );
}
