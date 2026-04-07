import { Badge } from '@/components/ui/badge';

export const getEnrollmentBadge = (status?: string | null) => {
    if (!status) return <span className="text-xs text-slate-400 dark:text-slate-500">-</span>;

    const styles: Record<string, string> = {
        Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
        Inactive: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-zinc-800/50 dark:text-slate-400 dark:border-slate-700/50',
        Graduated: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
        Completed: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
        Transferred: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20',
    };

    const appliedStyle = styles[status] || 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:border-slate-700';

    return (
        <Badge className={`border text-[10px] whitespace-nowrap sm:text-xs md:text-sm transition-colors ${appliedStyle}`}>
            {status}
        </Badge>
    );
};

export const getAssessmentBadge = (status?: string | null) => {
    if (!status) return <span className="text-xs text-slate-400 dark:text-slate-500">-</span>;

    const styles: Record<string, string> = {
        Completed: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
        'In Progress': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
        Draft: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800/50 dark:text-gray-300 dark:border-gray-700/50',
        'Not Started': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
    };

    const appliedStyle = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-gray-700';

    return (
        <Badge className={`border text-[10px] whitespace-nowrap sm:text-xs md:text-sm transition-colors ${appliedStyle}`}>
            {status}
        </Badge>
    );
};
