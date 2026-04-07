import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Eye, Download, Printer, CalendarDays, UserSquare2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Assessment {
    id: number;
    evaluation: string;
    evaluator: string;
    dateCreated: string;
    standardScore: number;
    sumOfScaled: number;
    nextAssessmentDue: string;
    domainScores: Array<{
        domain: string;
        rawScore: number;
        scaledScore: number;
        interpretation: string;
    }>;
}

interface ChildAssessmentsListProps {
    assessments: Assessment[];
    onViewDetails: (assessment: Assessment) => void;
    onDownload: (id: number) => void;
    onPrint: (id: number) => void;
}

export function ChildAssessmentsList({ assessments, onViewDetails, onDownload, onPrint }: ChildAssessmentsListProps) {

    // Sort newest to oldest so the most recent assessment is always at the top
    const sortedAssessments = [...assessments].sort((a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );

    // Dynamic badge styling based on Standard Score (ECCD Logic)
    const getScoreBadge = (score: number) => {
        if (score === 0) return { label: 'In Progress', className: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
        if (score >= 120) return { label: 'Highly Advanced', className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' };
        if (score >= 115) return { label: 'Above Average', className: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/30' };
        if (score >= 80) return { label: 'Average', className: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' };
        return { label: 'Needs Monitoring', className: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' };
    };

    if (sortedAssessments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-slate-50/50 dark:bg-zinc-950/50 rounded-b-xl border-t border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 transition-colors">
                    <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 transition-colors">No Assessment Records Found</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm transition-colors">
                    Developmental assessments will appear here once the teacher completes them.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-200">
            {sortedAssessments.map((assessment, index) => {
                const badge = getScoreBadge(assessment.standardScore);
                const isLatest = index === 0;

                return (
                    <div
                        key={assessment.id}
                        className={cn(
                            "flex flex-col gap-4 p-5 sm:p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/40",
                            isLatest && "bg-indigo-50/10 dark:bg-indigo-500/5" // Subtle highlight for the most recent one
                        )}
                    >
                        {/* --- TOP ROW: Title & Status --- */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-none transition-colors">
                                        {assessment.evaluation}
                                    </h4>
                                    {isLatest && (
                                        <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border-none px-2 py-0 text-[10px] uppercase tracking-wider font-bold shadow-none transition-colors">
                                            Latest
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-2 flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                    <span className="flex items-center gap-1.5">
                                        <CalendarDays className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-colors" />
                                        {new Date(assessment.dateCreated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <UserSquare2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-colors" />
                                        {assessment.evaluator}
                                    </span>
                                </div>
                            </div>

                            <Badge variant="outline" className={cn("px-3 py-1 text-xs font-bold shadow-sm border transition-colors", badge.className)}>
                                {badge.label}
                            </Badge>
                        </div>

                        {/* --- MIDDLE ROW: Quick Stats --- */}
                        <div className="mt-2 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-100 dark:border-slate-800 sm:w-fit sm:grid-cols-3 sm:gap-8 transition-colors">
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1 transition-colors">Standard Score</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none transition-colors">
                                    {assessment.standardScore > 0 ? assessment.standardScore : '--'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1 transition-colors">Sum of Scaled</p>
                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 leading-none transition-colors">
                                    {assessment.sumOfScaled > 0 ? assessment.sumOfScaled : '--'}
                                </p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1 flex items-center gap-1 transition-colors">
                                    Next Due <ArrowRight className="h-3 w-3" />
                                </p>
                                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md inline-block transition-colors border border-indigo-100 dark:border-transparent">
                                    {assessment.nextAssessmentDue || 'TBD'}
                                </p>
                            </div>
                        </div>

                        {/* --- BOTTOM ROW: Action Buttons --- */}
                        <div className="mt-2 flex flex-wrap items-center gap-2 sm:justify-end">
                            <Button
                                size="sm"
                                className="h-9 gap-2 bg-indigo-600 dark:bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 w-full sm:w-auto font-bold transition-colors"
                                onClick={() => onViewDetails(assessment)}
                            >
                                <Eye className="h-4 w-4" /> View Full Results
                            </Button>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 flex-1 sm:flex-none gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors"
                                    onClick={() => onDownload(assessment.id)}
                                >
                                    <Download className="h-4 w-4" /> <span className="sm:hidden lg:inline">Download</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-9 flex-1 sm:flex-none gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors"
                                    onClick={() => onPrint(assessment.id)}
                                >
                                    <Printer className="h-4 w-4" /> <span className="sm:hidden lg:inline">Print</span>
                                </Button>
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}
