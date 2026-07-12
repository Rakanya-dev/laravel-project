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

    // 🚀 Added these optional properties so the frontend can read the backend's exact text & age
    overall_rating?: string;
    status?: string;
    age_years?: number;

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

    // 🚀 DYNAMIC BADGE LOGIC (Trusts backend text first, falls back to safe math)
    const getScoreBadge = (assessment: Assessment) => {
        if (assessment.status === 'Draft' || assessment.status === 'In Progress' || assessment.standardScore === 0) {
            return { label: 'In Progress', className: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' };
        }

        // 1. If your backend sends the exact rating text, use it to determine colors!
        if (assessment.overall_rating) {
            const r = assessment.overall_rating.toLowerCase();
            if (r.includes('highly advanced') || r.includes('advanced development')) return { label: assessment.overall_rating, className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' };
            if (r.includes('slightly advanced') || r.includes('on track')) return { label: assessment.overall_rating, className: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/30' };
            if (r.includes('average')) return { label: assessment.overall_rating, className: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' };

            return { label: assessment.overall_rating, className: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' };
        }

        // 2. Math Fallback just in case the text is missing
        const score = assessment.standardScore;
        const isEccd = assessment.sumOfScaled > 0 || (assessment.age_years !== undefined && assessment.age_years >= 3);

        if (isEccd) {
            if (score >= 130) return { label: 'Highly Advanced', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            if (score >= 120) return { label: 'Slightly Advanced', className: 'bg-teal-50 text-teal-700 border-teal-200' };
            if (score >= 80) return { label: 'Average', className: 'bg-blue-50 text-blue-700 border-blue-200' };
            if (score >= 70) return { label: 'Slight Delay', className: 'bg-orange-50 text-orange-700 border-orange-200' };
            return { label: 'Significant Delay', className: 'bg-red-50 text-red-700 border-red-200' };
        } else {
            // For ITED without backend text, we just safely mark it as Evaluated
            return { label: 'Evaluated', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
        }
    };

    if (sortedAssessments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-slate-50/50 dark:bg-zinc-950/50 rounded-b-xl border-t border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 transition-colors">
                    <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 transition-colors">No Assessment Records Found</h3>
                <p className="mt-2 text-base text-slate-500 dark:text-slate-400 max-w-sm transition-colors">
                    Developmental assessments will appear here once the teacher completes them.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 transition-colors duration-200">
            {sortedAssessments.map((assessment, index) => {
                const badge = getScoreBadge(assessment);
                const isLatest = index === 0;

                // 🚀 Bulletproof ITED vs ECCD detection
                const isEccd = assessment.sumOfScaled > 0 || (assessment.age_years !== undefined && assessment.age_years >= 3) || assessment.evaluation.includes('ECCD');

                return (
                    <div
                        key={assessment.id}
                        className={cn(
                            "flex flex-col gap-5 p-6 sm:p-8 transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/40",
                            isLatest && "bg-indigo-50/10 dark:bg-indigo-500/5" // Subtle highlight for the most recent one
                        )}
                    >
                        {/* --- TOP ROW: Title & Status --- */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none transition-colors">
                                        {assessment.evaluation}
                                    </h4>
                                    {isLatest && (
                                        <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border-none px-2.5 py-0.5 text-xs uppercase tracking-wider font-bold shadow-none transition-colors">
                                            Latest
                                        </Badge>
                                    )}
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                    <span className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors" />
                                        {new Date(assessment.dateCreated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <UserSquare2 className="h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors" />
                                        {assessment.evaluator}
                                    </span>
                                </div>
                            </div>

                            <Badge variant="outline" className={cn("px-4 py-1.5 text-sm font-bold shadow-sm border transition-colors", badge.className)}>
                                {badge.label}
                            </Badge>
                        </div>

                        {/* --- MIDDLE ROW: Quick Stats --- */}
                        <div className="mt-2 grid grid-cols-2 gap-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 p-5 border border-slate-100 dark:border-slate-800 sm:w-fit sm:grid-cols-3 sm:gap-10 transition-colors">

                            {/* 🚀 TOGGLE THE LABELS SO IT MAKES SENSE FOR INFANTS */}
                            {isEccd ? (
                                <>
                                    <div>
                                        <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1.5 transition-colors">Standard Score</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none transition-colors">
                                            {assessment.standardScore > 0 ? assessment.standardScore : '--'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1.5 transition-colors">Sum of Scaled</p>
                                        <p className="text-xl font-bold text-slate-700 dark:text-slate-300 leading-none transition-colors">
                                            {assessment.sumOfScaled > 0 ? assessment.sumOfScaled : '--'}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1.5 transition-colors">Total Raw Score</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none transition-colors">
                                            {assessment.standardScore > 0 ? assessment.standardScore : '--'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1.5 transition-colors">Checklist Mode</p>
                                        <p className="text-base font-bold text-slate-700 dark:text-slate-300 leading-none mt-1 transition-colors">
                                            ITED
                                        </p>
                                    </div>
                                </>
                            )}

                            <div className="col-span-2 sm:col-span-1">
                                <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1.5 transition-colors">
                                    Next Due <ArrowRight className="h-4 w-4" />
                                </p>
                                <p className="text-base font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg inline-block transition-colors border border-indigo-100 dark:border-transparent">
                                    {assessment.nextAssessmentDue || 'TBD'}
                                </p>
                            </div>
                        </div>

                        {/* --- BOTTOM ROW: Action Buttons --- */}
                        <div className="mt-3 flex flex-wrap items-center gap-3 sm:justify-end">
                            <Button
                                className="h-11 px-5 gap-2 bg-indigo-600 dark:bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 w-full sm:w-auto text-base font-bold transition-colors"
                                onClick={() => onViewDetails(assessment)}
                            >
                                <Eye className="h-5 w-5" /> View Full Results
                            </Button>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    className="h-11 px-5 flex-1 sm:flex-none gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 text-base font-bold transition-colors"
                                    onClick={() => onDownload(assessment.id)}
                                >
                                    <Download className="h-5 w-5" /> <span className="sm:hidden lg:inline">Download</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-11 px-5 flex-1 sm:flex-none gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 text-base font-bold transition-colors"
                                    onClick={() => onPrint(assessment.id)}
                                >
                                    <Printer className="h-5 w-5" /> <span className="sm:hidden lg:inline">Print</span>
                                </Button>
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}
