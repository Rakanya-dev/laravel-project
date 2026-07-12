import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, ClipboardList, Info, ListChecks, Save, User, Percent, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ItedForm({ assessment }: { assessment: any }) {
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
                domain_name: s.domain.name,
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

    // --- 🚀 LIVE ITED CALCULATIONS ---
    const liveTotalRaw = data.scores.reduce((total: number, s: any) => total + (s.score !== '' ? Number(s.score) : 0), 0);
    const liveTotalMax = data.scores.reduce((total: number, s: any) => total + s.max_score, 0);
    const livePercentage = liveTotalMax > 0 ? Math.round((liveTotalRaw / liveTotalMax) * 100) : 0;

    let liveStatusText = 'Needs Intervention';
    if (livePercentage >= 90) liveStatusText = 'Advanced Development';
    else if (livePercentage >= 75) liveStatusText = 'On Track';
    else if (livePercentage >= 50) liveStatusText = 'Monitor Progress';

    if (liveTotalRaw === 0) liveStatusText = 'Not Started';

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
                toast.success(newStatus === 'Completed' ? 'Tracker Locked!' : 'Progress Saved!');
                if (newStatus === 'Completed') {
                    router.visit(route('teacher.my-students.index'));
                }
            },
            onError: () => toast.error('Failed to save tracking.'),
        });
    };

    const totalDomains = data.scores.length;
    const scoredDomains = data.scores.filter((s: any) => s.score !== '').length;
    const progressPercentage = Math.round((scoredDomains / totalDomains) * 100);

    return (
        <AppLayout breadcrumbs={[{ title: 'My Students', href: route('teacher.my-students.index') }, { title: 'ITED Assessment', href: '#' }]}>
            <Head title={`ITED - ${student.first_name} ${student.last_name}`} />

            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
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
                    <div className="space-y-6 lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-8 space-y-6">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                                {/* CLEANED UP HEADER */}
                                <div className="h-16 bg-slate-100 dark:bg-zinc-800/50"></div>

                                <div className="px-6 pb-8 sm:px-8 pt-0">
                                    <div className="mb-5 -mt-8 flex items-end justify-between">
                                        <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 text-slate-400 shadow-sm">
                                            <User className="size-10" />
                                        </div>
                                        <Badge variant={isReadOnly ? 'default' : 'outline'} className={cn("px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest shadow-none border transition-colors", isReadOnly ? 'bg-slate-900 dark:bg-zinc-100 text-white' : 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-900/50 dark:text-indigo-400')}>
                                            {data.status}
                                        </Badge>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{student.first_name} {student.last_name}</h2>
                                    <p className="mt-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">ITED Milestone Tracker (0 - 3 Years)</p>

                                    <div className="mt-6 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 shrink-0"><ListChecks className="size-5" /></div>
                                            <span className="text-base font-bold">{assessment.assessment_type}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 shrink-0"><Calendar className="size-5" /></div>
                                            <span className="text-base font-medium">{new Date(assessment.assessment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    {/* LIVE OVERALL PROFICIENCY PREVIEW */}
                                    <div className="mt-8 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 p-5 sm:p-6 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Percent className="size-5 text-indigo-600 dark:text-indigo-400" />
                                            <span className="font-bold text-indigo-900 dark:text-indigo-300 text-[11px] uppercase tracking-widest">Overall Proficiency</span>
                                        </div>
                                        <div className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                            {livePercentage}%
                                        </div>
                                        <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 mt-2 uppercase tracking-widest">
                                            {liveStatusText}
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 p-5 sm:p-6 shadow-sm">
                                        <div className="mb-2.5 flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Completion</span>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{scoredDomains} / {totalDomains}</span>
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
                                            <CheckCircle className="mr-2 size-6" /> Lock Tracker
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

                            {isReadOnly && (
                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950/50 p-5 sm:p-6 shadow-sm flex items-start gap-4 transition-colors mt-8">
                                    <Info className="size-6 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                                    <p className="text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                                        This milestone tracker is locked. The records have been finalized for this period.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                            <div className="flex items-center gap-4 sm:gap-5 border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 transition-colors">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><ClipboardList className="size-7" /></div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Milestone Tracking</h2>
                                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1">Enter the number of milestones successfully demonstrated by the child.</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto p-0">
                                <Table className="w-full min-w-[600px]">
                                    <TableHeader className="bg-slate-50/80 dark:bg-zinc-950/50 transition-colors">
                                        <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent dark:hover:bg-transparent">
                                            <TableHead className="w-[50%] py-5 pl-6 sm:pl-8 text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Development Domain</TableHead>
                                            <TableHead className="py-5 text-center text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Total Milestones</TableHead>
                                            <TableHead className="w-[25%] py-5 pr-6 sm:pr-8 text-right text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Passed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                        {data.scores.map((score: any, index: number) => {
                                            const hasScore = score.score !== '';

                                            return (
                                                <TableRow key={score.id} className={`hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors h-[88px] ${hasScore ? 'bg-indigo-50/10 dark:bg-indigo-500/5' : ''}`}>
                                                    <TableCell className="py-6 sm:py-7 pl-6 sm:pl-8">
                                                        <span className="text-lg font-black text-slate-900 dark:text-slate-100 transition-colors">{score.domain_name}</span>
                                                    </TableCell>
                                                    <TableCell className="py-6 sm:py-7 text-center">
                                                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 text-sm font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">/ {score.max_score}</span>
                                                    </TableCell>
                                                    <TableCell className="py-6 sm:py-7 pr-6 sm:pr-8">
                                                        <div className="flex justify-end">
                                                            <div className="relative">
                                                                <Input
                                                                    type="number" min="0" max={score.max_score} step="1"
                                                                    value={score.score}
                                                                    onKeyDown={(e) => { if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); }}
                                                                    onChange={(e) => handleScoreChange(index, e.target.value)}
                                                                    className={`h-14 w-32 sm:w-36 text-center text-2xl font-black shadow-sm focus-visible:ring-4 dark:bg-zinc-950 transition-colors rounded-xl ${hasScore ? 'border-indigo-400 bg-indigo-50 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-400' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'}`}
                                                                    placeholder="-" disabled={isReadOnly}
                                                                />
                                                            </div>
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
                                    Lock & Submit Tracker?
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                                You are about to finalize this milestone tracking period. Once locked, the records cannot be edited.
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
                            <CheckCircle className="mr-2 size-5" /> Yes, Lock Tracker
                        </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
