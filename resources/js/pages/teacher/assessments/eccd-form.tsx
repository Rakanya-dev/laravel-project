import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Activity, ArrowLeft, Calendar, CheckCircle, ClipboardList, Save, User, Calculator, X, AlertTriangle, Baby } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { getEccdDomainInterpretation, getOverallInterpretation } from '@/utils/eccd-scoring-system';

export default function EccdForm({ assessment, scoringRules = { scale: [], standard: [] } }: { assessment: any, scoringRules?: any }) {
    const student = assessment.student;
    const isReadOnly = assessment.status === 'Completed';

    const targetStatus = useRef(assessment.status);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const { data, setData, patch, processing, isDirty, transform } = useForm({
        status: assessment.status,
        next_assessment_date: assessment.next_assessment_date || '',
        scores: assessment.scores.map((s: any) => {
            const numericScore = Number(s.score);
            const numericMax = Number(s.max_score);

            return {
                id: s.id,
                domain_id: s.domain_id,
                domain_name: s.domain.name,
                is_core: s.domain?.is_core === undefined ? true : (s.domain.is_core === 1 || s.domain.is_core === true || s.domain.is_core === '1'),
                score: numericScore === 0 && assessment.status !== 'Completed' ? '' : Math.round(numericScore),
                max_score: Math.round(numericMax),
                isIncluded: s.is_included === 1 || s.is_included === true,
            };
        }),
    });

    transform((data) => ({
        ...data,
        status: targetStatus.current,
        scores: data.scores.map((s: any) => ({
            ...s,
            score: s.score === '' ? 0 : s.score,
        })),
    }));

    // --- 🚀 ROBUST AGE CALCULATION FALLBACK ---
    let ageY = Number(assessment.age_years) || 0;
    let ageM = Number(assessment.age_months) || 0;
    let totalMonths = (ageY * 12) + ageM;

    if (totalMonths === 0 && student?.date_of_birth) {
        const dob = new Date(student.date_of_birth);
        const evalDate = assessment.assessment_date ? new Date(assessment.assessment_date) : new Date();
        totalMonths = (evalDate.getFullYear() - dob.getFullYear()) * 12 + (evalDate.getMonth() - dob.getMonth());
        if (totalMonths < 0) totalMonths = 0;
        ageY = Math.floor(totalMonths / 12);
        ageM = totalMonths % 12;
    }

    // --- DIAGNOSTICS ---
    const isMissingRules = !scoringRules?.scale || scoringRules.scale.length === 0;
    const isIted = totalMonths <= 36;

    // --- DYNAMIC SCORING LOGIC ---
    const getScaledScore = (domainId: number, rawScore: number | string, scaleRules: any[]) => {
        if (rawScore === '' || isNaN(Number(rawScore))) return 0;
        const numericScore = Number(rawScore);

        if (totalMonths <= 36) return numericScore;
        if (isMissingRules) return numericScore;

        const applicableRules = scaleRules.filter((r: any) =>
            Number(r.domain_id) === Number(domainId) &&
            totalMonths >= Number(r.min_months_age) &&
            totalMonths <= Number(r.max_months_age)
        );

        if (applicableRules.length === 0) return numericScore;

        const match = applicableRules.find((r: any) =>
            numericScore >= Number(r.min_raw_score) &&
            numericScore <= Number(r.max_raw_score)
        );
        if (match) return Number(match.scaled_score);

        const maxRule = applicableRules.reduce((prev: any, current: any) =>
            (Number(prev.max_raw_score) > Number(current.max_raw_score)) ? prev : current
        );
        if (numericScore > Number(maxRule.max_raw_score)) return Number(maxRule.scaled_score);

        return 1;
    };

    const liveSumScaled = data.scores.reduce((total: number, s: any) => {
        if (s.is_core && s.score !== '') {
            const scaled = getScaledScore(s.domain_id, Number(s.score), scoringRules.scale);
            return total + scaled;
        }
        return total;
    }, 0);

    const getStandardScore = (sumOfScaled: number, standardRules: any[]) => {
        if (sumOfScaled === 0) return 0;

        const match = standardRules.find((r: any) => Number(r.sum_scaled_score) === sumOfScaled);
        if (match) return Number(match.standard_score);

        if (standardRules.length > 0) {
            const minSum = Math.min(...standardRules.map((r: any) => Number(r.sum_scaled_score)));
            const maxSum = Math.max(...standardRules.map((r: any) => Number(r.sum_scaled_score)));

            const minStandard = standardRules.find((r: any) => Number(r.sum_scaled_score) === minSum)?.standard_score || 69;
            const maxStandard = standardRules.find((r: any) => Number(r.sum_scaled_score) === maxSum)?.standard_score || 138;

            if (sumOfScaled < minSum) return Number(minStandard);
            if (sumOfScaled > maxSum) return Number(maxStandard);
        }
        return 69;
    };

    const liveStandardScore = getStandardScore(liveSumScaled, scoringRules.standard);
    const liveOverallInterpretation = liveStandardScore > 0
        ? getOverallInterpretation(liveStandardScore, ageY, ageM, 0)
        : 'Not Started';

    // --- ACTIONS ---
    const handleScoreChange = (index: number, value: string) => {
        const newScores = [...data.scores];
        const updatedRow = { ...newScores[index] };

        if (value === '') {
            updatedRow.score = '';
        } else {
            const cleanValue = value.replace(/\D/g, '');
            let numValue = parseInt(cleanValue, 10);
            if (!isNaN(numValue)) {
                if (numValue > updatedRow.max_score) numValue = updatedRow.max_score;
                updatedRow.score = numValue;
            }
        }
        newScores[index] = updatedRow;
        setData('scores', newScores);
    };

    const submit = (newStatus: 'Draft' | 'In Progress' | 'Completed') => {
        targetStatus.current = newStatus;
        setData('status', newStatus);

        patch(route('teacher.assessments.update', assessment.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(newStatus === 'Completed' ? 'Assessment Completed!' : 'Progress Saved!');
                if (newStatus === 'Completed') router.visit(route('teacher.my-students.index'));
            },
            onError: () => toast.error('Failed to save assessment.'),
        });
    };

    const totalDomains = data.scores.length;
    const scoredDomains = data.scores.filter((s: any) => s.score !== '').length;
    const progressPercentage = Math.round((scoredDomains / totalDomains) * 100);

    return (
        <AppLayout breadcrumbs={[{ title: 'My Students', href: route('teacher.my-students.index') }, { title: 'ECCD Assessment', href: '#' }]}>
            <Head title={`ECCD - ${student.first_name} ${student.last_name}`} />

            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

                <div className="flex items-center justify-between pb-2">
                    <Link
                        href={route('teacher.my-students.index')}
                        className="group flex items-center gap-2 text-base font-bold text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
                        <span className="hidden sm:inline">Back to My Students</span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* LEFT COLUMN: Fixed Sidebar */}
                    <div className="space-y-6 lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-8 space-y-6">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                                {/* CLEANED UP HEADER */}
                                <div className="h-16 bg-slate-100 dark:bg-zinc-800/50"></div>
                                <div className="px-6 pb-8 sm:px-8 pt-0">
                                    <div className="flex items-end justify-between -mt-8 mb-5">
                                        <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 text-slate-400">
                                            <User className="size-10" />
                                        </div>
                                        <Badge variant={isReadOnly ? 'default' : 'outline'} className={cn("px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest shadow-none border transition-colors", isReadOnly ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950' : 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-900/50 dark:text-indigo-400')}>
                                            {data.status}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{student.first_name} {student.last_name}</h2>
                                    <p className="mt-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">ECCD Checklist (3 - 5 Years)</p>

                                    <div className="mt-6 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 shrink-0"><Activity className="size-5" /></div>
                                            <span className="text-base font-bold">{assessment.assessment_type}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 shrink-0"><Calendar className="size-5" /></div>
                                            <span className="text-base font-medium">{new Date(assessment.assessment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 p-5 sm:p-6 border border-indigo-100 dark:border-indigo-500/20 shadow-sm flex flex-col">
                                        <div className="flex flex-col gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <Calculator className="size-5 text-indigo-600 dark:text-indigo-400" />
                                                <span className="font-bold text-indigo-900 dark:text-indigo-300 text-[11px] uppercase tracking-widest">Live Standard Score</span>
                                            </div>
                                            {liveStandardScore > 0 && (
                                                <Badge className="bg-indigo-600 dark:bg-indigo-500 text-white font-bold self-start mt-1 border-0 shadow-sm">
                                                    {liveOverallInterpretation}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                            {liveStandardScore > 0 ? liveStandardScore : '-'}
                                        </div>
                                        <div className="text-[11px] font-bold text-indigo-600/80 dark:text-indigo-400/80 mt-2 uppercase tracking-widest">
                                            Based on {liveSumScaled} sum of scaled scores
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-zinc-950 p-5 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <div className="mb-2.5 flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Completion</span>
                                            <span className="text-[11px] font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-400">{scoredDomains} / {totalDomains}</span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                                            <div className="h-full transition-all duration-500 ease-out shadow-sm bg-indigo-600 dark:bg-indigo-500" style={{ width: `${progressPercentage}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!isReadOnly && (
                                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-5 shadow-sm transition-colors">
                                    <div className="space-y-4">
                                        <Button
                                            className="h-14 w-full bg-indigo-600 text-lg font-bold text-white shadow-sm hover:bg-indigo-700 rounded-xl transition-colors"
                                            onClick={() => setShowConfirmDialog(true)}
                                            disabled={processing || scoredDomains !== totalDomains}
                                        >
                                            <CheckCircle className="mr-2 size-6" /> Submit Final Score
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="h-14 w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 text-base font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl shadow-sm transition-colors"
                                            onClick={() => submit('In Progress')}
                                            disabled={processing || !isDirty}
                                        >
                                            <Save className={`mr-2 size-5 ${isDirty ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} /> {isDirty ? 'Save Progress' : 'Changes Saved'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The Scoring Table */}
                    <div className="lg:col-span-8 xl:col-span-9">

                        {/* 🚀 SMART DIAGNOSTICS BANNERS */}
                        {isMissingRules && (
                            <div className="mb-6 p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 font-bold border border-red-200 dark:border-red-500/20 flex items-center gap-4 shadow-sm">
                                <AlertTriangle className="size-6 shrink-0" />
                                <div>
                                    <p className="text-base uppercase tracking-widest font-black">Missing Rules Database</p>
                                    <p className="text-sm font-medium mt-1">The system cannot compute scaled scores because the database is empty. Please open your terminal and run: <code className="bg-red-100 dark:bg-red-900/50">php artisan db:seed</code></p>
                                </div>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                            <div className="border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 flex items-center gap-4 sm:gap-5 transition-colors">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><ClipboardList className="size-7" /></div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Domain Scoring</h2>
                                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1">Enter the raw score observed for each developmental domain.</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto p-0 custom-scrollbar">
                                <Table className="w-full min-w-[750px]">
                                    <TableHeader className="bg-slate-50/80 dark:bg-zinc-950/50 transition-colors">
                                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent">
                                            <TableHead className="w-[30%] py-5 pl-6 sm:pl-8 text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Development Domain</TableHead>
                                            <TableHead className="w-[15%] py-5 text-center text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Max Score</TableHead>
                                            <TableHead className="w-[15%] py-5 text-center text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Scaled (Live)</TableHead>
                                            <TableHead className="w-[20%] py-5 text-center text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Interpretation</TableHead>
                                            <TableHead className="w-[20%] py-5 pr-6 sm:pr-8 text-right text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Raw Score</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                        {data.scores.map((score: any, index: number) => {
                                            const hasScore = score.score !== '';

                                            const liveScaledScore = hasScore ? getScaledScore(score.domain_id, Number(score.score), scoringRules.scale) : '-';

                                            return (
                                                <TableRow key={score.id} className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors h-[88px] ${hasScore ? 'bg-indigo-50/10 dark:bg-indigo-500/5' : ''}`}>
                                                    <TableCell className="py-6 sm:py-7 pl-6 sm:pl-8">
                                                        <div className="flex flex-col">
                                                            <span className="text-lg font-black text-slate-900 dark:text-slate-100 transition-colors">{score.domain_name}</span>
                                                            {!score.is_core && (
                                                                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mt-1">Supplemental</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-6 sm:py-7 text-center">
                                                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">/ {score.max_score}</span>
                                                    </TableCell>

                                                    <TableCell className="py-6 sm:py-7 text-center">
                                                        {score.is_core ? (
                                                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 transition-colors">{liveScaledScore}</span>
                                                        ) : (
                                                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 transition-colors">N/A</span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="py-6 sm:py-7 text-center">
                                                        {hasScore && score.is_core && !isIted ? (
                                                            <Badge variant="outline" className="text-xs font-bold bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 shadow-sm whitespace-nowrap">
                                                                {getEccdDomainInterpretation(Number(liveScaledScore))}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 transition-colors">-</span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="py-6 sm:py-7 pr-6 sm:pr-8">
                                                        <div className="flex justify-end">
                                                            <Input
                                                                type="number" min="0" max={score.max_score} step="1"
                                                                value={score.score}
                                                                onKeyDown={(e) => { if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                                                                onChange={(e) => handleScoreChange(index, e.target.value)}
                                                                className={`h-14 w-32 sm:w-36 text-center text-2xl font-black shadow-sm focus-visible:ring-4 dark:bg-zinc-950 transition-colors rounded-xl ${hasScore ? 'border-indigo-400 bg-indigo-50 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-400' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'}`}
                                                                placeholder="-" disabled={isReadOnly}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent hideClose className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col">

                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors shrink-0">
                        <DialogHeader className="text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                                    <CheckCircle className="size-6" strokeWidth={2.5} />
                                </div>
                                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Lock & Submit Assessment?
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                                You are about to submit the final score. Once completed, this assessment will be locked and cannot be edited.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                        <Button
                            variant="ghost"
                            onClick={() => setShowConfirmDialog(false)}
                            className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold bg-transparent border-0 text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors m-0 shadow-none"
                        >
                            <X className="mr-2 size-5" /> Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowConfirmDialog(false);
                                submit('Completed');
                            }}
                            className="h-12 w-full sm:w-auto px-8 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm transition-colors m-0"
                            disabled={processing}
                        >
                            <CheckCircle className="mr-2 size-5" /> Yes, Lock & Submit
                        </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
