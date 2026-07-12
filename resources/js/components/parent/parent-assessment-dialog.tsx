import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Activity, CalendarDays, UserSquare2, Lightbulb, MessageSquare, Target, Info, Calculator, FileText, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPHDate } from '@/utils/date';

// Official Interpretation Logic (for Core ECCD Domains)
import { getEccdDomainInterpretation } from '@/utils/eccd-scoring-system';
import { cn } from '@/lib/utils';

interface ParentAssessmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assessment: any;
}

export function ParentAssessmentDialog({ open, onOpenChange, assessment }: ParentAssessmentDialogProps) {
    if (!assessment) return null;

    const studentName = assessment.student ? `${assessment.student.first_name} ${assessment.student.last_name}` : 'Student';

    // Strip decimals for standard/overall scores
    const standardScore = Math.round(Number(assessment.standardScore ?? assessment.overall_score ?? assessment.standard_score ?? 0));
    const sumOfScaledScores = Math.round(Number(assessment.sumOfScaled ?? assessment.sum_of_scaled ?? 0));

    // Overall Standard Score Interpretation
    const getOverallInterpretation = (score: number) => {
        if (score === 0) return 'Needs Monitoring';
        if (score >= 130) return 'Highly Advanced Development';
        if (score >= 120) return 'Slightly Advanced Development';
        if (score >= 80) return 'Average Development';
        if (score >= 70) return 'Slight Delay in Development';
        return 'Significant Delay in Development';
    };

    const overallInterpretation = getOverallInterpretation(standardScore);

    // Safe Percentage Calculation
    const getVisualPercentage = (score: number, max: number) => {
        if (!max || max <= 0) return 0;
        const percentage = (score / max) * 100;
        return Math.min(Math.max(percentage, 0), 100); // Clamp between 0 and 100
    };

    // Dynamic Interpretation based on Core vs Supplemental
    const getDomainInterpretation = (score: number, max: number, isCore: boolean) => {
        if (isCore && max === 19) {
            return getEccdDomainInterpretation(score);
        }

        const percentage = (score / max) * 100;
        if (percentage >= 90) return 'Highly Proficient';
        if (percentage >= 75) return 'Proficient';
        if (percentage >= 50) return 'Developing';
        return 'Needs Monitoring';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideClose className="sm:max-w-7xl w-[95vw] h-[90vh] max-h-[900px] p-0 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-slate-50 dark:bg-zinc-950 transition-colors duration-200 print:w-full print:h-auto print:max-h-none print:border-none print:shadow-none print:overflow-visible">

                {/* --- 🚀 PREMIUM UNIFIED HEADER --- */}
                <div className="bg-white dark:bg-zinc-900 px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors shrink-0 print:border-slate-300">
                    <DialogHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 text-left">
                        <div className="flex items-center gap-4 sm:gap-5">
                            <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors print:border print:border-slate-300">
                                <Target className="size-7 sm:size-8" strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap mb-1">
                                    <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {assessment.evaluation || assessment.assessment_type || 'Developmental Assessment'}
                                    </DialogTitle>
                                    <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 px-2.5 py-0.5 text-[11px] uppercase tracking-widest font-bold shadow-none transition-colors border">
                                        {assessment.status || 'Completed'}
                                    </Badge>
                                </div>
                                <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
                                    Developmental Progress Report for <strong className="text-slate-900 dark:text-white font-black">{studentName}</strong>
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors shadow-sm print:border-slate-300 print:bg-white">
                                <CalendarDays className="size-4 text-slate-400" />
                                {formatPHDate(assessment.dateCreated || assessment.assessment_date || assessment.created_at)}
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors shadow-sm print:border-slate-300 print:bg-white">
                                <UserSquare2 className="size-4 text-slate-400" />
                                <span className="hidden sm:inline">Evaluator:</span> {assessment.evaluator || assessment.teacher?.last_name || 'Teacher'}
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* --- MAIN DASHBOARD BODY --- */}
                <div className="flex-1 min-h-0 p-6 sm:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-y-auto custom-scrollbar transition-colors print:overflow-visible print:h-auto">

                    {/* 👈 LEFT COLUMN: Summary & Feedback */}
                    <div className="w-full lg:w-5/12 flex flex-col gap-6 lg:gap-8 min-h-0 print:min-h-0 print:h-auto">

                        {/* HERO SCORE CARD */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 shrink-0 relative overflow-hidden transition-colors print:border-slate-300 print:shadow-none">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 transition-colors">
                                Overall Standard Score
                            </p>
                            <div className="flex items-baseline gap-3">
                                <p className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter truncate transition-colors">
                                    {standardScore > 0 ? standardScore : '-'}
                                </p>
                            </div>

                            {standardScore > 0 && (
                                <div className="mt-5">
                                    <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 transition-colors">
                                        {overallInterpretation}
                                    </span>
                                </div>
                            )}

                            <p className="text-base text-slate-500 dark:text-slate-400 mt-6 leading-relaxed font-medium transition-colors">
                                A comprehensive measure of the child's developmental milestones based on standard age expectations.
                            </p>

                            {/* Sum of Scaled Scores Indicator */}
                            {sumOfScaledScores > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors print:border-slate-300">
                                    <span className="flex items-center gap-2.5"><Calculator className="size-4 text-slate-400" /> Sum of Scaled Scores</span>
                                    <span className="bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-slate-800 dark:text-slate-200 print:border print:border-slate-300">{sumOfScaledScores}</span>
                                </div>
                            )}
                        </div>

                        {/* TEACHER'S NOTES */}
                        <div className="flex-1 min-h-0 flex flex-col gap-6 lg:gap-8 print:h-auto">
                            {(assessment.assessmentSummary || assessment.remarks) && (
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors print:border-slate-300 print:shadow-none">
                                    <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-950/50 transition-colors print:border-slate-300 print:bg-slate-50">
                                        <MessageSquare className="size-5 text-indigo-500 dark:text-indigo-400" />
                                        <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Teacher's Remarks</h4>
                                    </div>
                                    <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar print:overflow-visible">
                                        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium transition-colors">
                                            {assessment.assessmentSummary || assessment.remarks}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {assessment.recommendation && (
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors print:border-slate-300 print:shadow-none">
                                    <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-950/50 transition-colors print:border-slate-300 print:bg-slate-50">
                                        <Lightbulb className="size-5 text-amber-500 dark:text-amber-400" />
                                        <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">Recommendations</h4>
                                    </div>
                                    <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar print:overflow-visible">
                                        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium transition-colors">
                                            {assessment.recommendation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 👉 RIGHT COLUMN: Domain Breakdown */}
                    <div className="w-full lg:w-7/12 flex flex-col min-h-0 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors print:border-slate-300 print:shadow-none print:min-h-0 print:h-auto">

                        {/* Domain Header */}
                        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-950/50 transition-colors print:border-slate-300 print:bg-slate-50">
                            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3 transition-colors">
                                <Activity className="size-6 text-indigo-500 dark:text-indigo-400" /> Milestone Breakdown
                            </h3>
                            <span className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors print:border-slate-300 print:shadow-none">
                                <Info className="size-4" /> Performance Matrix
                            </span>
                        </div>

                        {/* DOMAINS LIST */}
                        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-zinc-950/30 print:overflow-visible print:bg-white">
                            {assessment.scores && assessment.scores.length > 0 ? (
                                assessment.scores.map((s: any, idx: number) => {
                                    const domainName = s.domain?.name || s.name || s.domain_name || 'Domain';
                                    const domainDescription = s.domain?.description || s.description || 'Measures specific developmental milestones for this category based on standard expectations.';
                                    const isCore = s.is_core ?? true;

                                    // Grab RAW values
                                    const rawScore = Math.round(Number(s.raw_score ?? s.score ?? 0));
                                    const rawMax = Math.round(Number(s.raw_max ?? s.max_score ?? s.fullMark ?? 19));

                                    // Grab SCALED score
                                    const scaledScore = Math.round(Number(s.scaled_score ?? 0));

                                    const interpretationScore = isCore ? scaledScore : rawScore;
                                    const interpretationMax = isCore ? 19 : rawMax;
                                    const interpretation = getDomainInterpretation(interpretationScore, interpretationMax, isCore);

                                    return (
                                        <div key={idx} className="group w-full p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-700 print:shadow-none print:border-slate-300 print:break-inside-avoid">

                                            <div className="flex flex-col xl:flex-row justify-between items-start gap-6 mb-5">

                                                {/* Left side: Domain Name & Full DB Desc */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                                            {domainName}
                                                        </h4>
                                                        {!isCore && (
                                                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                                                Supplemental
                                                            </span>
                                                        )}
                                                        <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                                                            {interpretation}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                        {domainDescription}
                                                    </p>
                                                </div>

                                                {/* Right side: Score Box */}
                                                <div className="shrink-0 w-full xl:w-auto flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950/80 px-6 py-4 rounded-xl border border-slate-100 dark:border-slate-800 print:border-slate-300">
                                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Score</span>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-3xl font-black text-slate-900 dark:text-white">{rawScore}</span>
                                                        <span className="text-base font-bold text-slate-400 dark:text-slate-500">/ {rawMax}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden transition-colors print:border print:border-slate-300">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 ease-out bg-indigo-500 dark:bg-indigo-400 shadow-sm print:bg-slate-400"
                                                    style={{ width: `${getVisualPercentage(rawScore, rawMax)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20 px-6 text-center transition-colors border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-zinc-950/50 print:border-slate-300 print:bg-white">
                                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl mb-5 shadow-sm border border-slate-100 dark:border-slate-800 print:border-slate-300">
                                        <FileText className="size-10 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white transition-colors">No milestone data recorded yet.</p>
                                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2">This section will populate once the evaluation is finalized.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* --- 🚀 PREMIUM UNIFIED FOOTER --- */}
                <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex justify-end shrink-0 transition-colors m-0 print:hidden">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="h-12 w-full sm:w-auto px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-base font-bold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                    >
                        Close Report
                    </Button>
                </DialogFooter>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                    @media print {
                        .custom-scrollbar::-webkit-scrollbar { display: none; }
                    }

                    @media (prefers-color-scheme: dark) {
                        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
                        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}
