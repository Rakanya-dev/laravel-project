import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, CalendarDays, UserSquare2, Lightbulb, MessageSquare, Target, Info, Sparkles, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPHDate } from '@/utils/date';

// 🚀 Official Interpretation Logic
import { getEccdDomainInterpretation } from '@/utils/eccd-scoring-system';

interface ParentAssessmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assessment: any;
}

export function ParentAssessmentDialog({ open, onOpenChange, assessment }: ParentAssessmentDialogProps) {
    if (!assessment) return null;

    const studentName = assessment.student ? `${assessment.student.first_name} ${assessment.student.last_name}` : 'Student';
    const standardScore = assessment.standardScore ?? assessment.overall_score ?? assessment.standard_score ?? 0;

    // Calculate Sum of Scaled Scores
    const sumOfScaledScores = assessment.scores?.reduce((sum: number, s: any) => {
        return sum + (s.scaled_score ?? s.score ?? 0);
    }, 0) || 0;

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

    const getVisualPercentage = (score: number) => {
        const percentage = (score / 19) * 100;
        return percentage > 100 ? 100 : percentage;
    };

    const getInterpretationColors = (interpretation: string) => {
        if (interpretation.includes('Advanced')) return { bar: 'bg-emerald-400 dark:bg-emerald-500', track: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' };
        if (interpretation.includes('Average')) return { bar: 'bg-blue-400 dark:bg-blue-500', track: 'bg-blue-100 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400' };
        if (interpretation.includes('Delay') || interpretation.includes('Monitor')) return { bar: 'bg-amber-400 dark:bg-amber-500', track: 'bg-amber-100 dark:bg-amber-950/50', text: 'text-amber-800 dark:text-amber-500', badge: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400' };
        return { bar: 'bg-indigo-400 dark:bg-indigo-500', track: 'bg-indigo-100 dark:bg-indigo-950/50', text: 'text-indigo-700 dark:text-indigo-400', badge: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400' };
    };

    const overallColors = getInterpretationColors(overallInterpretation);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-5xl !w-[95vw] h-[88vh] max-h-[850px] p-0 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-[#f8fafc] dark:bg-zinc-950 transition-colors duration-200">

                {/* --- PREMIUM HEADER --- */}
                <div className="shrink-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-900 dark:via-violet-900 dark:to-purple-900 px-6 py-5 sm:px-8 sm:py-6 text-white flex flex-col md:flex-row justify-between md:items-center gap-4 z-10 shadow-md transition-colors">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <Sparkles className="size-5 sm:size-6 text-indigo-200 dark:text-indigo-400 hidden sm:block" />
                            <DialogTitle className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                                {assessment.evaluation || assessment.assessment_type || 'Developmental Assessment'}
                            </DialogTitle>
                            <Badge className="bg-white/20 dark:bg-black/20 text-white border-none shadow-none px-3 py-1 text-[10px] sm:text-xs uppercase tracking-widest font-bold backdrop-blur-sm transition-colors">
                                {assessment.status || 'Completed'}
                            </Badge>
                        </div>
                        <DialogDescription className="text-indigo-100 dark:text-indigo-200/80 font-medium text-xs sm:text-sm mt-1.5 sm:ml-9 transition-colors">
                            Developmental Progress Report for <strong className="text-white font-bold">{studentName}</strong>
                        </DialogDescription>
                    </div>

                    <div className="flex gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-indigo-100 dark:text-indigo-200/80 transition-colors">
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/15 dark:bg-black/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl backdrop-blur-sm transition-colors">
                            <CalendarDays className="size-3.5 sm:size-4 opacity-90" />
                            {formatPHDate(assessment.dateCreated || assessment.assessment_date || assessment.created_at)}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/15 dark:bg-black/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl backdrop-blur-sm transition-colors">
                            <UserSquare2 className="size-3.5 sm:size-4 opacity-90" />
                            <span className="hidden sm:inline">Evaluated by:</span> {assessment.evaluator || assessment.teacher?.last_name || 'Teacher'}
                        </div>
                    </div>
                </div>

                {/* --- MAIN DASHBOARD BODY --- */}
                <div className="flex-1 min-h-0 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 overflow-y-auto md:overflow-hidden transition-colors">

                    {/* 👈 LEFT COLUMN: Summary & Feedback */}
                    <div className="w-full md:w-5/12 flex flex-col gap-6 min-h-0">

                        {/* HERO SCORE CARD */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm p-6 shrink-0 relative overflow-hidden transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 pointer-events-none">
                                <Target className="size-24 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2 relative z-10 transition-colors">
                                Overall Standard Score
                            </p>
                            <div className="flex items-baseline gap-3 relative z-10">
                                <p className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter truncate transition-colors">
                                    {standardScore > 0 ? standardScore : '-'}
                                </p>
                            </div>

                            {/* Parent-friendly Overall Interpretation Badge */}
                            {standardScore > 0 && (
                                <div className="mt-3 relative z-10 inline-block">
                                    <span className={`text-sm font-bold px-3 py-1.5 rounded-md border ${overallColors.badge} transition-colors`}>
                                        {overallInterpretation}
                                    </span>
                                </div>
                            )}

                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-4 relative z-10 font-medium leading-relaxed transition-colors">
                                A comprehensive measure of your child's developmental milestones based on standard age expectations.
                            </p>

                            {/* Sum of Scaled Scores Indicator */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-300 relative z-10 transition-colors">
                                <span className="flex items-center gap-2"><Calculator className="size-4 text-slate-400 dark:text-slate-500 transition-colors" /> Sum of Scaled Scores:</span>
                                <span>{sumOfScaledScores > 0 ? sumOfScaledScores : '-'}</span>
                            </div>
                        </div>

                        {/* TEACHER'S NOTES */}
                        <div className="flex-1 min-h-0 flex flex-col gap-6">
                            {(assessment.assessmentSummary || assessment.remarks) && (
                                <div className="bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/20 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden transition-colors">
                                    <div className="px-5 py-4 border-b border-blue-100/50 dark:border-blue-500/20 shrink-0 flex items-center gap-2 transition-colors">
                                        <MessageSquare className="size-5 text-blue-500 dark:text-blue-400 shrink-0 transition-colors" />
                                        <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm tracking-wide transition-colors">Teacher's Remarks</h4>
                                    </div>
                                    <div className="p-5 overflow-y-auto custom-scrollbar">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium transition-colors">
                                            {assessment.assessmentSummary || assessment.remarks}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {assessment.recommendation && (
                                <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/20 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden transition-colors">
                                    <div className="px-5 py-4 border-b border-amber-100/50 dark:border-amber-500/20 shrink-0 flex items-center gap-2 transition-colors">
                                        <Lightbulb className="size-5 text-amber-500 dark:text-amber-400 shrink-0 transition-colors" />
                                        <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm tracking-wide transition-colors">Recommendations</h4>
                                    </div>
                                    <div className="p-5 overflow-y-auto custom-scrollbar">
                                        <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed font-medium transition-colors">
                                            {assessment.recommendation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 👉 RIGHT COLUMN: Domain Breakdown */}
                    <div className="w-full md:w-7/12 flex flex-col min-h-0 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">

                        {/* Domain Header */}
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-zinc-950/50 transition-colors">
                            <h3 className="text-sm lg:text-base font-bold uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
                                <Activity className="size-5 text-indigo-500 dark:text-indigo-400 transition-colors" /> Milestone Breakdown
                            </h3>
                            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                                <Info className="size-3.5" /> Scale 1 to 19
                            </span>
                        </div>

                        {/* DOMAINS LIST */}
                        <div className="flex-1 p-5 sm:p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                            {assessment.scores && assessment.scores.length > 0 ? (
                                assessment.scores.map((s: any, idx: number) => {
                                    const domainName = s.domain?.name || s.domain_name || 'Domain';
                                    const scoreValue = s.scaled_score ?? s.score ?? 0;

                                    const interpretation = getEccdDomainInterpretation(scoreValue);
                                    const colors = getInterpretationColors(interpretation);

                                    return (
                                        <div key={idx} className="group w-full py-1">
                                            <div className="flex flex-wrap items-end justify-between mb-2 gap-x-4 gap-y-1">
                                                <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                                                    <span className="text-xs lg:text-sm font-black text-slate-800 dark:text-slate-200 tracking-wide truncate transition-colors">
                                                        {domainName}
                                                    </span>
                                                    <span className={`text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded border whitespace-nowrap ${colors.badge} opacity-90 transition-all group-hover:opacity-100`}>
                                                        {interpretation}
                                                    </span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-black text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0 transition-colors">
                                                    Score: <span className="text-slate-700 dark:text-slate-300">{scoreValue}</span>
                                                </span>
                                            </div>

                                            <div className={`h-2.5 sm:h-3 w-full ${colors.track} rounded-full overflow-hidden shadow-inner transition-colors`}>
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
                                                    style={{ width: `${getVisualPercentage(scoreValue)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 text-center transition-colors">
                                    <Activity className="size-12 mb-4 opacity-20" />
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors">No milestone data recorded.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </DialogContent>

            {/* Custom Scrollbar Styles appended directly, using standard variables where possible */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                @media (prefers-color-scheme: dark) {
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
                }
            `}</style>
        </Dialog>
    );
}
