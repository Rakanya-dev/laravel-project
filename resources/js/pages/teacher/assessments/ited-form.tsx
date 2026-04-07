import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, ClipboardList, Info, ListChecks, Save, User } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

export default function ItedForm({ assessment }: { assessment: any }) {
    const student = assessment.student;
    const isReadOnly = assessment.status === 'Completed';

    // 1. Create an instant-updating ref
    const targetStatus = useRef(assessment.status);

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

    // 2. Update transform to forcefully inject the targetStatus
    transform((data) => ({
        ...data,
        status: targetStatus.current,
        scores: data.scores.map((s: any) => ({
            ...s,
            score: s.score === '' ? 0 : s.score,
        })),
    }));

    const handleScoreChange = (index: number, value: string) => {
        const newScores = [...data.scores];
        const updatedRow = { ...newScores[index] };

        if (value === '') {
            updatedRow.score = '';
            newScores[index] = updatedRow;
            setData('scores', newScores);
            return;
        }

        const cleanValue = value.replace(/\D/g, '');
        let numValue = parseInt(cleanValue, 10);

        if (isNaN(numValue)) {
            updatedRow.score = '';
        } else {
            if (numValue > updatedRow.max_score) numValue = updatedRow.max_score;
            updatedRow.score = numValue;
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
                    router.visit('/teacher/my-students');
                }
            },
            onError: () => toast.error('Failed to save tracking.'),
        });
    };

    const totalDomains = data.scores.length;
    const scoredDomains = data.scores.filter((s: any) => s.score !== '').length;
    const progressPercentage = Math.round((scoredDomains / totalDomains) * 100);
    const handleBack = () => {
        window.history.back();
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'My Students', href: '/teacher/my-students' },
                { title: 'ITED Assessment', href: '#' },
            ]}
        >
            <Head title={`ITED - ${student.first_name} ${student.last_name}`} />

            <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 transition-colors duration-200">

                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between pb-2">
                    <Button variant="ghost" onClick={handleBack} className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                        <ArrowLeft className="mr-2 size-4" /> Go Back
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* LEFT COLUMN: Fixed Sidebar */}
                    <div className="space-y-6 lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-8 space-y-6">

                            {/* Student Context Card */}
                            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                                <div className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-600 dark:to-blue-700"></div>

                                <div className="px-6 pb-6 pt-0">
                                    <div className="mb-4 -mt-6 flex items-end justify-between">
                                        <div className="flex size-14 items-center justify-center rounded-2xl border-4 border-white dark:border-zinc-900 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 shadow-sm transition-colors">
                                            <User className="size-6" />
                                        </div>
                                        <Badge
                                            variant={isReadOnly ? 'default' : 'outline'}
                                            className={`border transition-colors ${isReadOnly
                                                ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                                                : 'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
                                            }`}
                                        >
                                            {data.status}
                                        </Badge>
                                    </div>

                                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white transition-colors">
                                        {student.first_name} {student.last_name}
                                    </h2>
                                    <p className="mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">
                                        ITED Milestone Tracker (0 - 3 Years)
                                    </p>

                                    <div className="mt-6 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5 transition-colors">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                <ListChecks className="size-4" />
                                            </div>
                                            <span className="text-sm font-bold">{assessment.assessment_type}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                <Calendar className="size-4" />
                                            </div>
                                            <span className="text-sm font-medium">
                                                {new Date(assessment.assessment_date).toLocaleDateString('en-US', {
                                                    month: 'long', day: 'numeric', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 p-4 transition-colors">
                                        <div className="mb-2 flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completion</span>
                                            <span className="font-black text-blue-600 dark:text-blue-400 transition-colors">
                                                {scoredDomains} / {totalDomains}
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800 transition-colors">
                                            <div
                                                className={`h-full transition-all duration-500 ease-out ${progressPercentage === 100 ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-blue-500 dark:bg-blue-400'
                                                    }`}
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                        {progressPercentage === 100 && !isReadOnly && (
                                            <p className="mt-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-center uppercase tracking-widest transition-colors">
                                                Ready to lock tracker
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons Panel */}
                            {!isReadOnly && (
                                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-4 shadow-sm transition-colors">
                                    <div className="space-y-3">
                                        <Button
                                            className="h-12 w-full bg-blue-600 dark:bg-blue-600 text-base font-bold text-white shadow-md transition-all hover:bg-blue-700 dark:hover:bg-blue-500 rounded-xl"
                                            onClick={() => {
                                                if (confirm('Are you sure you want to lock this tracking period? It will be secured from further edits.')) {
                                                    submit('Completed');
                                                }
                                            }}
                                            disabled={processing || scoredDomains !== totalDomains}
                                        >
                                            <CheckCircle className="mr-2 size-5" /> Lock Tracker
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="h-12 w-full border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                            onClick={() => submit('In Progress')}
                                            disabled={processing || !isDirty}
                                        >
                                            <Save className={`mr-2 size-5 ${isDirty ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400'}`} />
                                            {isDirty ? 'Save Progress' : 'Changes Saved'}
                                        </Button>
                                    </div>
                                    {scoredDomains !== totalDomains && (
                                        <p className="mt-3 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">
                                            Complete all domains to lock
                                        </p>
                                    )}
                                </div>
                            )}

                            {isReadOnly && (
                                <Alert className="rounded-2xl border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-500/5 p-4 text-blue-800 dark:text-blue-300 shadow-sm transition-colors">
                                    <Info className="size-5 text-blue-600 dark:text-blue-400" />
                                    <AlertDescription className="ml-2 text-xs font-bold leading-relaxed transition-colors">
                                        This milestone tracker is locked. The records have been finalized for this period.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The Tracking Table */}
                    <div className="lg:col-span-8 xl:col-span-9 transition-colors">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 transition-colors">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors">
                                    <ClipboardList className="size-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white transition-colors">Milestone Tracking</h2>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">Enter the number of milestones successfully demonstrated by the child.</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto p-0">
                                <Table className="w-full min-w-[500px]">
                                    <TableHeader className="bg-slate-50/80 dark:bg-zinc-950/50 transition-colors">
                                        <TableRow className="border-slate-200 dark:border-slate-800">
                                            <TableHead className="w-[50%] py-4 pl-8 text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                                                Development Domain
                                            </TableHead>
                                            <TableHead className="py-4 text-center text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                                                Total Milestones
                                            </TableHead>
                                            <TableHead className="w-[25%] py-4 pr-8 text-right text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                                                Passed
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                        {data.scores.map((score: any, index: number) => {
                                            const hasScore = score.score !== '';
                                            const isMaxed = score.score === score.max_score;

                                            return (
                                                <TableRow
                                                    key={score.id}
                                                    className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 ${hasScore ? 'bg-blue-50/10 dark:bg-blue-500/5' : ''
                                                        }`}
                                                >
                                                    <TableCell className="py-5 pl-8">
                                                        <span className="text-[15px] font-bold text-slate-800 dark:text-slate-200 transition-colors">
                                                            {score.domain_name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-5 text-center">
                                                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-xs font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">
                                                            / {Math.round(score.max_score)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-5 pr-8">
                                                        <div className="flex justify-end">
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    max={score.max_score}
                                                                    step="1"
                                                                    value={score.score}
                                                                    onKeyDown={(e) => {
                                                                        if (['.', 'e', 'E', '+', '-'].includes(e.key)) {
                                                                            e.preventDefault();
                                                                        }
                                                                    }}
                                                                    onChange={(e) => handleScoreChange(index, e.target.value)}
                                                                    className={`h-12 w-32 text-center text-xl font-black shadow-sm transition-all focus-visible:ring-4 dark:bg-zinc-950 ${hasScore
                                                                        ? isMaxed
                                                                            ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-400 focus-visible:ring-indigo-500/20'
                                                                            : 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-500/10 text-blue-900 dark:text-blue-400 focus-visible:ring-blue-500/20'
                                                                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus-visible:ring-slate-400/20'
                                                                        }`}
                                                                    placeholder="-"
                                                                    disabled={isReadOnly}
                                                                />
                                                                {hasScore && !isReadOnly && (
                                                                    <div className="absolute -right-2 -top-2">
                                                                        <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500 dark:bg-emerald-600 text-white shadow-md ring-2 ring-white dark:ring-zinc-900 transition-colors">
                                                                            <CheckCircle className="size-3" />
                                                                        </div>
                                                                    </div>
                                                                )}
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
        </AppLayout>
    );
}
