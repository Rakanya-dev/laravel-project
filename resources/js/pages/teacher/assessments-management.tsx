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
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, FileEdit, Loader2, Lock, Plus, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
                    router.reload({
                        only: ['assessments'],
                        // @ts-ignore
                        preserveScroll: true
                    });
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
                    if (sectionFilter === 'unassigned') {
                        matchesSession = !studentSession;
                    } else {
                        matchesSession = studentSession === sectionFilter;
                    }
                }
                return matchesSearch && matchesSession;
            })
            .map((student: any) => {
                const history = (rawAssessments || []).filter((a) => a.student_id === student.id);
                const studentSession = student.section?.name || student.section_name;

                return {
                    studentId: student.id,
                    firstName: student.first_name,
                    lastName: student.last_name,
                    name: formatName(student),
                    age: calculateAge(student.date_of_birth),
                    sessionName: studentSession || 'Unassigned',
                    assessments: {
                        '1st Assessment': history.find((a) => a.assessment_type === '1st Assessment'),
                        '2nd Assessment': history.find((a) => a.assessment_type === '2nd Assessment'),
                        '3rd Assessment': history.find((a) => a.assessment_type === '3rd Assessment'),
                    },
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [rawStudents, rawAssessments, searchQuery, sectionFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sectionFilter, rowsPerPage]);

    const totalPages = Math.ceil(gradebookData.length / rowsPerPage);
    const paginatedData = gradebookData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const openAssessment = (assessmentId: number) => {
        router.visit(route('teacher.assessments.show', assessmentId));
    };

    const startNewAssessment = (studentId: number, type: string) => {
        const loadingKey = `${studentId}-${type}`;
        setCreatingFor(loadingKey);

        router.post(
            route('teacher.assessments.bulk-store'),
            {
                assessments: [{ student_id: studentId, assessment_type: type }],
                domain_ids: domains.map((d) => d.id),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${type} Draft Created!`);
                    setCreatingFor(null);
                },
                onError: () => {
                    toast.error('Failed to create draft.');
                    setCreatingFor(null);
                },
            },
        );
    };

    const renderCell = (studentId: number, type: string, assessment?: AssessmentWithScores, isEligibleToStart: boolean = true) => {
        const isLoading = creatingFor === `${studentId}-${type}`;

        if (isLoading) {
            return (
                <div className="flex h-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 shadow-inner">
                    <Loader2 className="size-4 animate-spin text-indigo-500" />
                </div>
            );
        }

        if (!assessment && !isEligibleToStart) {
            return (
                <div
                    title="Complete previous evaluation first"
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-zinc-950/30 cursor-not-allowed text-slate-400 dark:text-slate-600 transition-colors"
                >
                    <Lock className="size-3.5 opacity-60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Locked</span>
                </div>
            );
        }

        if (!assessment) {
            return (
                <button
                    onClick={() => startNewAssessment(studentId, type)}
                    className="group flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 transition-all hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:shadow-sm"
                >
                    <Plus className="size-3.5 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Evaluate</span>
                </button>
            );
        }

        if (assessment.status === 'Completed') {
            return (
                <button
                    onClick={() => openAssessment(assessment.id)}
                    className="group flex h-11 w-full items-center justify-between rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-sm"
                >
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="size-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Done</span>
                    </div>
                    <div className="flex flex-col items-end justify-center leading-none">
                        <span className="text-[8px] font-bold uppercase text-emerald-600/60 dark:text-emerald-400/50 mb-0.5">Score</span>
                        <span className="text-sm font-black text-emerald-800 dark:text-emerald-200">{assessment.overall_score ?? '-'}</span>
                    </div>
                </button>
            );
        }

        return (
            <button
                onClick={() => openAssessment(assessment.id)}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 transition-all hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:shadow-sm"
            >
                <FileEdit className="size-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Resume</span>
            </button>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluation Matrix" />

            <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 transition-colors duration-200">

                {/* --- HERO HEADER --- */}
                <div className="flex flex-col justify-between gap-6 rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800 sm:flex-row sm:items-center transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-inner">
                            <BookOpen className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">ECCD Evaluation Matrix</h2>
                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                <Users className="size-4" />
                                Tracking progress for <strong className="text-slate-700 dark:text-slate-200">{gradebookData.length} students</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <Select value={sectionFilter} onValueChange={setSectionFilter}>
                            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 font-medium text-slate-700 dark:text-slate-300 focus:ring-indigo-500 transition-colors sm:w-[200px]">
                                <SelectValue placeholder="All Sessions" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                <SelectItem value="all" className="dark:text-slate-200 dark:focus:bg-zinc-800">All Sessions</SelectItem>
                                {availableSections.map((sec) => (
                                    <SelectItem key={sec} value={sec} className="dark:text-slate-200 dark:focus:bg-zinc-800">{sec}</SelectItem>
                                ))}
                                <SelectItem value="unassigned" className="dark:text-slate-200 dark:focus:bg-zinc-800">Unassigned</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute top-3.5 left-3.5 size-4 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by student name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 pl-10 font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-indigo-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* --- THE MATRIX TABLE & PAGINATION --- */}
                <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table className="w-full min-w-[950px] table-fixed">
                            <TableHeader className="bg-slate-50/95 dark:bg-zinc-950/50 shadow-sm transition-colors">
                                <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent transition-colors">
                                    <TableHead className="w-[30%] py-5 pl-6 text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
                                        Learner Profile
                                    </TableHead>
                                    <TableHead className="w-[23%] text-center text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <span className="flex size-6 items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">1</span>
                                            First Evaluation
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[23%] text-center text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <span className="flex size-6 items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">2</span>
                                            Second Evaluation
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[23%] pr-6 text-center text-[10px] font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <span className="flex size-6 items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">3</span>
                                            Third Evaluation
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                {paginatedData.length === 0 ? (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={4} className="h-48 text-center py-12">
                                            <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                                <Users className="mb-4 size-12 opacity-50" />
                                                <p className="text-base font-medium text-slate-600 dark:text-slate-400">No learners found</p>
                                                <p className="mt-1 text-sm">Try adjusting your search or session filter.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((row) => {
                                        const first = row.assessments['1st Assessment'];
                                        const second = row.assessments['2nd Assessment'];
                                        const third = row.assessments['3rd Assessment'];

                                        const canStartSecond = first?.status === 'Completed';
                                        const canStartThird = second?.status === 'Completed';

                                        return (
                                            <TableRow key={row.studentId} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/40">
                                                <TableCell className="py-4 pl-6">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="size-11 border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 shadow-sm transition-transform group-hover:scale-105 duration-300">
                                                            <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/10 text-sm font-bold text-indigo-700 dark:text-indigo-400">
                                                                {getInitials(row.firstName, row.lastName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col justify-center">
                                                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] xl:max-w-[300px] transition-colors">{row.name}</span>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">
                                                                    {row.sessionName}
                                                                </span>
                                                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 transition-colors">{row.age} yrs</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="p-3 align-middle">
                                                    {renderCell(row.studentId, '1st Assessment', first, true)}
                                                </TableCell>
                                                <TableCell className="p-3 align-middle">
                                                    {renderCell(row.studentId, '2nd Assessment', second, canStartSecond)}
                                                </TableCell>
                                                <TableCell className="p-3 pr-6 align-middle">
                                                    {renderCell(row.studentId, '3rd Assessment', third, canStartThird)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    {gradebookData.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 px-6 py-4 transition-colors">
                            <div className="flex items-center gap-3 mb-4 sm:mb-0">
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Rows:</span>
                                <Select
                                    value={rowsPerPage.toString()}
                                    onValueChange={(val) => setRowsPerPage(Number(val))}
                                >
                                    <SelectTrigger className="h-9 w-[75px] bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-xs font-bold transition-colors">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                        <SelectItem value="10" className="dark:text-slate-200 dark:focus:bg-zinc-800">10</SelectItem>
                                        <SelectItem value="25" className="dark:text-slate-200 dark:focus:bg-zinc-800">25</SelectItem>
                                        <SelectItem value="50" className="dark:text-slate-200 dark:focus:bg-zinc-800">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-6">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    Page <strong className="text-slate-900 dark:text-white mx-1">{currentPage}</strong> of <strong className="text-slate-900 dark:text-white mx-1">{totalPages}</strong>
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 transition-colors"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 transition-colors"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
