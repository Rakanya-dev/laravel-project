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
            color: 'text-indigo-600 dark:text-indigo-400',
            iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
            hoverBg: 'hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10',
            onClick: onNewAssessment
        },
        {
            icon: ClipboardList,
            label: 'Manage Assessments',
            description: 'Resume grading & complete drafts',
            color: 'text-emerald-600 dark:text-emerald-400',
            iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
            hoverBg: 'hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
            onClick: onViewAssessments
        },
        {
            icon: Users,
            label: 'Class Roster',
            description: 'View student profiles',
            color: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-500/20',
            hoverBg: 'hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10',
            onClick: onViewStudents
        },
        {
            icon: MessageSquare,
            label: 'Messages',
            description: 'Contact parents or admin',
            color: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-100 dark:bg-amber-500/20',
            hoverBg: 'hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10',
            onClick: onViewMessages
        }
    ];

    return (
        <div className="grid gap-4 sm:gap-5">
            {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                    <Button
                        key={index}
                        variant="outline"
                        className={`group h-auto w-full justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${action.hoverBg}`}
                        onClick={action.onClick}
                    >
                        <div className="flex items-center gap-4 sm:gap-5">
                            <div className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${action.iconBg} transition-transform group-hover:scale-105 duration-300`}>
                                <Icon className={`size-6 ${action.color} transition-colors`} strokeWidth={2.5} />
                            </div>
                            <div className="text-left mt-0.5">
                                <p className="text-lg font-black text-slate-900 dark:text-white transition-colors">
                                    {action.label}
                                </p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="size-6 shrink-0 text-slate-300 dark:text-slate-600 ml-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-500 dark:group-hover:text-slate-400" />
                    </Button>
                );
            })}
        </div>
    );
}
