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
            // 🚀 BUG FIX: Safely convert DB strings to numbers
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
        // 🚀 BUG FIX: Deep copy the specific row so Inertia detects the change!
        const updatedRow = { ...newScores[index] };

        // If the teacher backspaces everything, leave it blank
        if (value === '') {
            updatedRow.score = '';
            newScores[index] = updatedRow;
            setData('scores', newScores);
            return;
        }

        // Strip out decimals and non-numbers
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
        // 🔙 This tells the browser to go back exactly one step in the history
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

            {/* FULL WIDTH LAYOUT */}
            <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">

                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between pb-2">
                    <Button variant="ghost" onClick={handleBack}>
                        Go Back
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* LEFT COLUMN: Fixed Sidebar */}
                    <div className="space-y-6 lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-8 space-y-6">

                            {/* Student Context Card (Indigo/Blue Theme) */}
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {/* Decorative Header Banner */}
                                <div className="h-12 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                                <div className="px-6 pb-6 pt-0">
                                    {/* Floating Avatar & Badge */}
                                    <div className="mb-4 -mt-6 flex items-end justify-between">
                                        <div className="flex size-14 items-center justify-center rounded-xl border-4 border-white bg-slate-100 text-slate-400 shadow-sm">
                                            <User className="size-6" />
                                        </div>
                                        <Badge
                                            variant={isReadOnly ? 'default' : 'outline'}
                                            className={`border border-blue-200 shadow-sm ${isReadOnly ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700'
                                                }`}
                                        >
                                            {data.status}
                                        </Badge>
                                    </div>

                                    <h2 className="text-xl font-extrabold text-slate-900">
                                        {student.first_name} {student.last_name}
                                    </h2>
                                    <p className="mt-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
                                        ITED Milestone Tracker (0 - 3 Years)
                                    </p>

                                    <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                <ListChecks className="size-4" />
                                            </div>
                                            <span className="text-sm font-semibold">{assessment.assessment_type}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
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
                                    <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="font-bold text-slate-700">Completion</span>
                                            <span className="font-bold text-blue-600">
                                                {scoredDomains} / {totalDomains}
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className={`h-full transition-all duration-500 ease-out ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                        {progressPercentage === 100 && !isReadOnly && (
                                            <p className="mt-2 text-center text-xs font-medium text-emerald-600">
                                                Ready to lock tracker!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons Panel */}
                            {!isReadOnly && (
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <div className="space-y-3">
                                        <Button
                                            className="h-12 w-full bg-blue-600 text-base font-bold text-white shadow-sm transition-all hover:bg-blue-700"
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
                                            className="h-12 w-full border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                                            onClick={() => submit('In Progress')}
                                            disabled={processing || !isDirty}
                                        >
                                            <Save className="mr-2 size-5 text-slate-400" />
                                            {isDirty ? 'Save Progress' : 'Saved'}
                                        </Button>
                                    </div>
                                    {scoredDomains !== totalDomains && (
                                        <p className="mt-3 text-center text-xs text-slate-500">
                                            You must record all domains before locking.
                                        </p>
                                    )}
                                </div>
                            )}

                            {isReadOnly && (
                                <Alert className="rounded-2xl border-blue-200 bg-blue-50 p-4 text-blue-800 shadow-sm">
                                    <Info className="size-5 text-blue-600" />
                                    <AlertDescription className="ml-2 text-xs font-medium leading-relaxed">
                                        This milestone tracker is locked. The records have been finalized for this period.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The Tracking Table */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-4 border-b border-slate-100 bg-white p-6 sm:p-8">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <ClipboardList className="size-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900">Milestone Tracking</h2>
                                    <p className="text-sm font-medium text-slate-500">Enter the number of milestones successfully demonstrated by the child.</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto p-0">
                                <Table className="w-full min-w-[500px]">
                                    <TableHeader className="bg-slate-50/80">
                                        <TableRow className="border-slate-200">
                                            <TableHead className="w-[50%] py-4 pl-8 text-xs font-bold tracking-widest text-slate-500 uppercase">
                                                Development Domain
                                            </TableHead>
                                            <TableHead className="py-4 text-center text-xs font-bold tracking-widest text-slate-500 uppercase">
                                                Total Milestones
                                            </TableHead>
                                            <TableHead className="w-[25%] py-4 pr-8 text-right text-xs font-bold tracking-widest text-slate-500 uppercase">
                                                Passed
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-slate-100">
                                        {data.scores.map((score: any, index: number) => {
                                            const hasScore = score.score !== '';
                                            const isMaxed = score.score === score.max_score;

                                            return (
                                                <TableRow
                                                    key={score.id}
                                                    className={`transition-colors hover:bg-slate-50/50 ${hasScore ? 'bg-indigo-50/20' : ''
                                                        }`}
                                                >
                                                    <TableCell className="py-5 pl-8">
                                                        <span className="text-sm font-bold text-slate-800">
                                                            {score.domain_name}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-5 text-center">
                                                        <span className="inline-flex items-center justify-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
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
                                                                    className={`h-12 w-32 text-center text-lg font-black shadow-sm transition-all focus-visible:ring-2 ${hasScore
                                                                        ? isMaxed
                                                                            ? 'border-indigo-400 bg-indigo-50 text-indigo-900 focus-visible:ring-indigo-500'
                                                                            : 'border-blue-400 bg-blue-50 text-blue-900 focus-visible:ring-blue-500'
                                                                        : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-300 focus-visible:ring-slate-400'
                                                                        }`}
                                                                    placeholder="-"
                                                                    disabled={isReadOnly}
                                                                />
                                                                {/* Success Indicator */}
                                                                {hasScore && !isReadOnly && (
                                                                    <div className="absolute -right-2 -top-2">
                                                                        <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white">
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
