import { Badge } from '@/components/ui/badge';

export const getEnrollmentBadge = (status?: string | null) => {
    if (!status) return <span className="text-xs text-slate-400">-</span>;

    const styles: Record<string, string> = {
        Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        Inactive: 'bg-slate-50 text-slate-500 border-slate-200',
        Graduated: 'bg-purple-50 text-purple-700 border-purple-200',
        Completed: 'bg-purple-50 text-purple-700 border-purple-200',
        Transferred: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    };

    const appliedStyle = styles[status] || 'bg-slate-100 text-slate-500 border-slate-200';

    return (
        <Badge className={`border text-[10px] whitespace-nowrap sm:text-xs md:text-sm ${appliedStyle}`}>
            {status}
        </Badge>
    );
};

export const getAssessmentBadge = (status?: string | null) => {
    if (!status) return <span className="text-xs text-slate-400">-</span>;

    const styles: Record<string, string> = {
        Completed: 'bg-green-50 text-green-700 border-green-200',
        'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
        Draft: 'bg-gray-100 text-gray-700 border-gray-200',
        'Not Started': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };

    const appliedStyle = styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <Badge className={`border text-[10px] whitespace-nowrap sm:text-xs md:text-sm ${appliedStyle}`}>
            {status}
        </Badge>
    );
};
