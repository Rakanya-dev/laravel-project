import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// UI Components
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, FileEdit, Loader2, Lock, Plus, Search, Users, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// --- TYPES ---
import type { Assessment as InertiaAssessment, BreadcrumbItem, Child as InertiaChild, User as InertiaUser } from '@/types';

interface AssessmentWithScores extends InertiaAssessment {
    overall_score?: number;
    assessment_type: '1st Assessment' | '2nd Assessment' | '3rd Assessment';
    status: 'Not Started' | 'Draft' | 'In Progress' | 'Completed';
}

interface AssessmentPageProps extends PageProps {
    auth: { user: InertiaUser };
    assessments: AssessmentWithScores[];
    students: InertiaChild[];
    domains: { id: number; name: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Evaluation Matrix', href: '/teacher/assessments' }];

// --- HELPER FUNCTIONS ---
const formatName = (person: { first_name: string; middle_name?: string | null; last_name: string }) => {
    return [person.last_name, person.first_name].filter(Boolean).join(', ');
};

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

const calculateAge = (birthdate?: string) => {
    if (!birthdate) return 0;
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
};

export default function AssessmentManagementPage() {
    const { auth: { user }, assessments: rawAssessments, students: rawStudents, domains } = usePage<AssessmentPageProps>().props;

    useEffect(() => {
        if (!user?.daycare_id) return;
        const channelName = `daycare.${user.daycare_id}`;
        if (window.Echo) {
            window.Echo.private(channelName)
                .listen('.assessment.updated', (e: any) => {
                    router.reload({ only: ['assessments'] });
                });
        }
        return () => { if (window.Echo) window.Echo.leave(channelName); };
    }, [user?.daycare_id]);

    const [searchQuery, setSearchQuery] = useState('');
    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [creatingFor, setCreatingFor] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const availableSections = useMemo(() => {
        const sections = (rawStudents || []).map((s: any) => s.section?.name || s.section_name).filter(Boolean) as string[];
        return Array.from(new Set(sections)).sort();
    }, [rawStudents]);

    const gradebookData = useMemo(() => {
        return (rawStudents || [])
            .filter((student: any) => {
                const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
                const matchesSearch = fullName.includes(searchQuery.toLowerCase());
                const studentSession = student.section?.name || student.section_name;
                let matchesSession = true;
                if (sectionFilter !== 'all') {
                    matchesSession = sectionFilter === 'unassigned' ? !studentSession : studentSession === sectionFilter;
                }
                return matchesSearch && matchesSession;
            })
            .map((student: any) => {
                const history = (rawAssessments || []).filter((a) => a.student_id === student.id);
                return {
                    studentId: student.id,
                    firstName: student.first_name,
                    lastName: student.last_name,
                    name: formatName(student),
                    age: calculateAge(student.date_of_birth),
                    sessionName: (student.section?.name || student.section_name) || 'Unassigned',
                    assessments: {
                        '1st Assessment': history.find((a) => a.assessment_type === '1st Assessment'),
                        '2nd Assessment': history.find((a) => a.assessment_type === '2nd Assessment'),
                        '3rd Assessment': history.find((a) => a.assessment_type === '3rd Assessment'),
                    },
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [rawStudents, rawAssessments, searchQuery, sectionFilter]);

    const totalPages = Math.ceil(gradebookData.length / rowsPerPage);
    const paginatedData = gradebookData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const startNewAssessment = (studentId: number, type: string) => {
        setCreatingFor(`${studentId}-${type}`);
        router.post(route('teacher.assessments.bulk-store'), {
            assessments: [{ student_id: studentId, assessment_type: type }],
            domain_ids: domains.map((d) => d.id),
        }, {
            preserveScroll: true,
            onSuccess: () => { toast.success(`${type} Draft Created!`); setCreatingFor(null); },
            onError: () => { toast.error('Failed to create draft.'); setCreatingFor(null); },
        });
    };

    const renderCell = (studentId: number, type: string, assessment?: AssessmentWithScores, isEligibleToStart: boolean = true) => {
        if (creatingFor === `${studentId}-${type}`) return (
            <div className="flex h-14 w-full items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 transition-colors">
                <Loader2 className="size-5 animate-spin text-indigo-500" />
            </div>
        );

        if (!assessment && !isEligibleToStart) return (
            <div className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-slate-500 transition-colors shadow-sm">
                <Lock className="size-4" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Locked</span>
            </div>
        );

        if (!assessment) return (
            <button onClick={() => startNewAssessment(studentId, type)} className="group flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all hover:scale-[1.02] shadow-sm">
                <Plus className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Evaluate</span>
            </button>
        );

        if (assessment.status === 'Completed') return (
            <button onClick={() => router.visit(route('teacher.assessments.show', assessment.id))} className="group flex h-14 w-full items-center justify-between rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-500/10 px-5 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all hover:scale-[1.02] shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-5" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Done</span>
                </div>
                <div className="flex flex-col items-end leading-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-1">Score</span>
                    <span className="text-base font-black text-emerald-900 dark:text-emerald-100">{assessment.overall_score ?? '-'}</span>
                </div>
            </button>
        );

        return (
            <button onClick={() => router.visit(route('teacher.assessments.show', assessment.id))} className="group flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all hover:scale-[1.02] shadow-sm">
                <FileEdit className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-widest">Resume</span>
            </button>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluation Matrix" />

            {/* 🚀 PREMIUM PAGE WRAPPER */}
            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

                {/* --- HEADER --- */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                            Evaluation Matrix
                        </h2>
                        <p className="mt-1.5 flex items-center gap-2 text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
                            <Users className="size-5 shrink-0" />
                            Tracking progress for <strong className="text-slate-900 dark:text-white font-bold">{gradebookData.length} students</strong>
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center shrink-0">
                        <Select value={sectionFilter} onValueChange={setSectionFilter}>
                            <SelectTrigger className="h-12 text-base w-full sm:w-[240px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 font-bold text-slate-900 dark:text-white shadow-sm transition-colors focus:ring-indigo-500">
                                <SelectValue placeholder="All Sessions" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-900 dark:border-slate-800 rounded-xl transition-colors">
                                <SelectItem value="all" className="font-bold rounded-lg py-2.5">All Sessions</SelectItem>
                                {availableSections.map((sec) => (
                                    <SelectItem key={sec} value={sec} className="font-bold rounded-lg py-2.5">{sec}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute top-1/2 left-4 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500 transition-colors" />
                            <Input
                                placeholder="Search by student name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 h-12 text-base rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 shadow-sm transition-colors focus-visible:ring-indigo-500 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* --- MATRIX TABLE CARD --- */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors duration-200">
                    <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                        <Table className="w-full min-w-[950px] table-fixed">
                            <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-slate-100 dark:border-slate-800">
                                    <TableHead className="w-[30%] py-5 pl-6 sm:pl-8 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Learner Profile</TableHead>
                                    <TableHead className="w-[23%] py-5 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">1st Evaluation</TableHead>
                                    <TableHead className="w-[23%] py-5 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">2nd Evaluation</TableHead>
                                    <TableHead className="w-[23%] py-5 pr-6 sm:pr-8 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">3rd Evaluation</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                {paginatedData.length === 0 ? (
                                    <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                                        <TableCell colSpan={4} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center py-24 px-4">
                                                <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                                    <ClipboardList className="size-10 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No learners found</h3>
                                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors max-w-md">Try adjusting your filters or search query.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((row) => (
                                        <TableRow key={row.studentId} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors border-slate-100 dark:border-slate-800 h-[88px]">
                                            <TableCell className="pl-6 sm:pl-8">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="size-14 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl shrink-0 transition-colors">
                                                        <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/20 font-black text-lg text-indigo-700 dark:text-indigo-400 rounded-2xl transition-colors">
                                                            {getInitials(row.firstName, row.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col overflow-hidden mt-0.5">
                                                        <p className="text-lg font-black text-slate-900 dark:text-white truncate transition-colors">{row.name}</p>
                                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 truncate mt-1 transition-colors">{row.sessionName} • {row.age} yrs</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="p-4">{renderCell(row.studentId, '1st Assessment', row.assessments['1st Assessment'], true)}</TableCell>
                                            <TableCell className="p-4">{renderCell(row.studentId, '2nd Assessment', row.assessments['2nd Assessment'], !!row.assessments['1st Assessment']?.status?.includes('Completed'))}</TableCell>
                                            <TableCell className="p-4 pr-6 sm:pr-8">{renderCell(row.studentId, '3rd Assessment', row.assessments['3rd Assessment'], !!row.assessments['2nd Assessment']?.status?.includes('Completed'))}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* --- FOOTER PAGINATION --- */}
                    {gradebookData.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 px-6 py-5 sm:flex-row sm:px-8 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors mt-0.5">Rows</span>
                                <Select value={rowsPerPage.toString()} onValueChange={(val) => setRowsPerPage(Number(val))}>
                                    <SelectTrigger className="h-12 w-[80px] rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 font-bold text-base shadow-sm transition-colors focus:ring-indigo-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-zinc-900 dark:border-slate-800 rounded-xl transition-colors">
                                        {[10, 25, 50].map(v => <SelectItem key={v} value={v.toString()} className="font-bold text-base rounded-lg py-2.5 transition-colors">{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-5">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:inline-block transition-colors mt-0.5">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-12 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm transition-colors"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    >
                                        <ChevronLeft className="size-5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-12 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm transition-colors"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    >
                                        <ChevronRight className="size-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
