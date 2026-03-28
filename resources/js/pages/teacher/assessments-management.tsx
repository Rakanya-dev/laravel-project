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

        window.Echo.private(channelName)
            .listen('.assessment.updated', (e: any) => {
                router.reload({
                    only: ['assessments'],
                    // Using @ts-ignore for the preserveScroll bug below
                    // @ts-ignore
                    preserveScroll: true
                });
            });

        return () => window.Echo.leave(channelName);
    }, [user?.daycare_id]);

    const [searchQuery, setSearchQuery] = useState('');
    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [creatingFor, setCreatingFor] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const availableSections = useMemo(() => {
        // Change s.section_name to s.section?.name
        const sections = (rawStudents || []).map((s: any) => s.section?.name || s.section_name).filter(Boolean) as string[];
        return Array.from(new Set(sections)).sort();
    }, [rawStudents]);

    const gradebookData = useMemo(() => {
        return (rawStudents || [])
            .filter((student: any) => {
                const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
                const matchesSearch = fullName.includes(searchQuery.toLowerCase());

                // Get the actual session name, checking both nested and flat structures
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

                // Get the actual session name here too
                const studentSession = student.section?.name || student.section_name;

                return {
                    studentId: student.id,
                    firstName: student.first_name,
                    lastName: student.last_name,
                    name: formatName(student),
                    age: calculateAge(student.date_of_birth),

                    // 👇 Use the resolved session name here
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
                <div className="flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50/50 shadow-inner">
                    <Loader2 className="size-4 animate-spin text-blue-500" />
                </div>
            );
        }

        if (!assessment && !isEligibleToStart) {
            return (
                <div
                    title="Complete previous evaluation first"
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 cursor-not-allowed text-slate-400"
                >
                    <Lock className="size-3.5 opacity-60" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">Locked</span>
                </div>
            );
        }

        if (!assessment) {
            return (
                <button
                    onClick={() => startNewAssessment(studentId, type)}
                    className="group flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-blue-300 bg-blue-50/30 text-blue-600 transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm"
                >
                    <Plus className="size-3.5 transition-transform group-hover:scale-110 group-hover:text-blue-700" />
                    <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-blue-700">Evaluate</span>
                </button>
            );
        }

        if (assessment.status === 'Completed') {
            return (
                <button
                    onClick={() => openAssessment(assessment.id)}
                    className="group flex h-11 w-full items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 transition-all hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm"
                >
                    <div className="flex items-center gap-2 text-emerald-700">
                        <CheckCircle2 className="size-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Done</span>
                    </div>
                    <div className="flex flex-col items-end justify-center leading-none">
                        <span className="text-[9px] font-bold uppercase text-emerald-600/60 mb-0.5">Score</span>
                        <span className="text-sm font-black text-emerald-800">{assessment.overall_score ?? '-'}</span>
                    </div>
                </button>
            );
        }

        return (
            <button
                onClick={() => openAssessment(assessment.id)}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition-all hover:border-amber-300 hover:bg-amber-100 hover:shadow-sm"
            >
                <FileEdit className="size-4 text-amber-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Resume</span>
            </button>
        );
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Evaluation Matrix" />

            <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">

                {/* --- HERO HEADER --- */}
                <div className="flex flex-col justify-between gap-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner">
                            <BookOpen className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">ECCD Evaluation Matrix</h2>
                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                                <Users className="size-4" />
                                Tracking progress for <strong className="text-slate-700">{gradebookData.length} students</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <Select value={sectionFilter} onValueChange={setSectionFilter}>
                            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-blue-500 sm:w-[200px]">
                                <SelectValue placeholder="All Sessions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sessions</SelectItem>
                                {availableSections.map((sec) => (
                                    <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                                ))}
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative w-full sm:w-80">
                            <Search className="absolute top-3 left-3.5 size-4 text-slate-400" />
                            <Input
                                placeholder="Search by student name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 font-medium placeholder:text-slate-400 focus-visible:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* --- THE MATRIX TABLE & PAGINATION --- */}
                <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* 🚀 REMOVED: max-h and overflow-y-auto. The table now expands naturally based on rowsPerPage */}
                    <div className="overflow-x-auto">
                        <Table className="w-full min-w-[950px] table-fixed">
                            <TableHeader className="bg-slate-50/95 shadow-sm">
                                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                                    <TableHead className="w-[30%] py-5 pl-6 text-xs font-bold tracking-widest text-slate-600 uppercase">
                                        Learner Profile
                                    </TableHead>
                                    <TableHead className="w-[23%] text-center text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <span className="flex size-6 items-center justify-center rounded-full bg-slate-200 text-slate-700">1</span>
                                            First Evaluation
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[23%] text-center text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <span className="flex size-6 items-center justify-center rounded-full bg-slate-200 text-slate-700">2</span>
                                            Second Evaluation
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[23%] pr-6 text-center text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            <span className="flex size-6 items-center justify-center rounded-full bg-slate-200 text-slate-700">3</span>
                                            Third Evaluation
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-slate-100">
                                {paginatedData.length === 0 ? (
                                    <TableRow>
                                        {/* Adjusted height for empty state to look natural without fixed scrolling */}
                                        <TableCell colSpan={4} className="h-48 text-center py-12">
                                            <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-slate-400">
                                                <Users className="mb-4 size-12 opacity-50" />
                                                <p className="text-base font-medium text-slate-600">No learners found</p>
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
                                            <TableRow key={row.studentId} className="group transition-colors hover:bg-slate-50/50">
                                                <TableCell className="py-4 pl-6">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="size-11 border border-slate-200 bg-white shadow-sm transition-transform group-hover:scale-105">
                                                            <AvatarFallback className="bg-indigo-50 text-sm font-bold text-indigo-700">
                                                                {getInitials(row.firstName, row.lastName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col justify-center">
                                                            <span className="text-sm font-bold text-slate-900 truncate max-w-[200px] xl:max-w-[300px]">{row.name}</span>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600">
                                                                    {row.sessionName}
                                                                </span>
                                                                <span className="text-[11px] text-slate-400">{row.age} years old</span>
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
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                            <div className="flex items-center gap-3 mb-4 sm:mb-0">
                                <span className="text-sm font-medium text-slate-500">Rows per page:</span>
                                <Select
                                    value={rowsPerPage.toString()}
                                    onValueChange={(val) => setRowsPerPage(Number(val))}
                                >
                                    <SelectTrigger className="h-8 w-[70px] bg-white text-xs font-semibold">
                                        <SelectValue placeholder="10" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-slate-500">
                                    Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong>
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
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
