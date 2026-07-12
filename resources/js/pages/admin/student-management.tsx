import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Child as InertiaChild, Daycare as InertiaDaycare, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, CheckCircle2, Copy, Eye, FileText, UserCheck, XCircle, Users } from 'lucide-react';

import { AddEditStudentDialog } from '@/components/admin/add-edit-student-dialog';
import { ImportStudentsDialog } from '@/components/admin/import-students-dialog';
import { StudentDetailDialog } from '@/components/admin/student-detail-dialog';
import { ArchiveStudentDialog } from '@/components/shared/archive-student-dialog';
import { ArchivedStudentsDialog } from '@/components/shared/archived-students-dialog';
import { RestoreStudentDialog } from '@/components/shared/restore-student-dialog';
import { StudentListView } from '@/components/shared/student-list-view';

import { calculateAge, formatForInput, formatPHDate } from '@/utils/date';
import { cn } from '@/lib/utils';

// --- Shared Types ---
export interface Student {
    id: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth?: string;
    daycare?: string;
    daycareId: number;
    parentLinked?: boolean;
    parentName?: string;
    status: string;
    archived: boolean;
    archivedDate?: string;
    nickname: string;
    gender: string;
    special_needs: string;
    notes: string;
    age?: number | string;
    section_name?: string;
    [key: string]: any;
}

export interface StudentFormData {
    section_id: any;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    daycare: string;
    nickname: string;
    gender: string;
    special_needs: string;
    notes: string;
}

export interface Section {
    capacity: number;
    id: number;
    name: string;
    daycare_id: number;
    students_count?: number;
}

export interface PendingEnrollment {
    id: number;
    user: { id: number; first_name: string; last_name: string; email: string };
    daycare: { id: number; name: string };
    first_name: string;
    middle_name: string | null;
    last_name: string;
    date_of_birth: string;
    gender: string;
    birth_cert_path: string;
    parent_id_path: string;
    status: string;
    created_at: string;
}

const ITEMS_PER_PAGE = 10;

const breadcrumbs = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Student Management', href: '/admin/student-management' },
];

export default function StudentManagement() {
    type StudentPageProps = {
        students: InertiaChild[];
        daycares: InertiaDaycare[];
        parents: User[];
        sections: Section[];
        pendingEnrollments: PendingEnrollment[];
    };
    const { students: rawStudents, daycares: rawDaycares, sections, pendingEnrollments: rawPending } = usePage<StudentPageProps>().props;

    const daycareList = rawDaycares.map((d) => d.name);

    // --- 1. Data Transformation ---
    const transformStudent = (student: InertiaChild): Student => {
        const hasParent = student.parents && student.parents.length > 0;
        return {
            id: student.id,
            firstName: student.first_name,
            middleName: student.middle_name || '',
            lastName: student.last_name,
            dateOfBirth: student.date_of_birth,
            daycare: student.daycare?.name || 'N/A',
            daycareId: student.daycare_id,
            parentLinked: hasParent || false,
            parentName: hasParent ? `${student.parents![0].first_name} ${student.parents![0].last_name}` : 'N/A',
            status: (student.status as any) || 'Inactive',
            archived: !!student.deleted_at,
            section_id: student.section_id,
            archivedDate: student.deleted_at ? formatPHDate(student.deleted_at) : undefined,
            archiveReason: student.archive_reason || student.notes || '-',
            nickname: student.nickname || '',
            gender: student.gender || '',
            special_needs: student.special_needs || '',
            notes: student.notes || '',
            access_code: student.access_code,
            age: student.date_of_birth ? calculateAge(student.date_of_birth) : '-',
            section_name: student.section?.name || 'Unassigned',
        };
    };

    const handleExport = () => {
        if (filteredStudents.length === 0) {
            toast.error('No students to export.');
            return;
        }

        const headers = ['ID', 'First Name', 'Middle Name', 'Last Name', 'Nickname', 'Gender', 'DOB', 'Daycare', 'Status', 'Parent Name', 'Notes'];
        const rows = filteredStudents.map((s) => [
            s.id,
            s.firstName,
            s.middleName,
            s.lastName,
            s.nickname || '',
            s.gender,
            s.dateOfBirth,
            s.daycare,
            s.status,
            s.parentName || 'N/A',
            (s.notes || '').replace(/\n/g, ' '),
        ]);

        const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Student records exported successfully.');
    };

    // --- 2. Local State ---
    const [allStudents, setAllStudents] = useState<Student[]>(() => rawStudents.map(transformStudent));
    const [pendingList, setPendingList] = useState<PendingEnrollment[]>(rawPending || []);
    const [activeTab, setActiveTab] = useState('roster');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');

        if (tabParam === 'pending') {
            setActiveTab('pending');
        } else if (tabParam === 'roster') {
            setActiveTab('roster');
        }
    }, []);

    const [reviewingEnrollment, setReviewingEnrollment] = useState<PendingEnrollment | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // 🚀 NEW STATE: Handles the rejection logic seamlessly
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        setAllStudents(rawStudents.map(transformStudent));
        setPendingList(rawPending || []);
    }, [rawStudents, rawPending]);

    useEffect(() => {
        // @ts-ignore
        if (window.Echo) {
            window.Echo.channel('students').listen('StudentUpdated', (event: any) => {
                console.log('Admin caught a student update from a teacher!', event);
                router.reload({
                    only: ['students'],
                });
            });
        }
        return () => {
            // @ts-ignore
            if (window.Echo) window.Echo.leave('students');
        };
    }, []);

    // --- 3. Filter State (Active Students Only) ---
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDaycare, setFilterDaycare] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // --- 4. Derived Lists ---
    const students = useMemo(() => allStudents.filter((s) => !s.archived), [allStudents]);
    const archivedStudents = useMemo(() => allStudents.filter((s) => s.archived), [allStudents]);

    const filteredStudents = useMemo(() => {
        let result = students.filter((student) => {
            const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ').toLowerCase().replace(/\s+/g, ' ');

            const matchesSearch = fullName.includes(searchQuery.toLowerCase().trim());
            const matchesDaycare = filterDaycare === 'all' || student.daycare === filterDaycare;
            const matchesStatus = filterStatus === 'all' || student.status === filterStatus;

            return matchesSearch && matchesDaycare && matchesStatus;
        });

        return result.sort((a, b) => {
            const aNeedsAttention = a.assessmentStatus === 'In Progress' || a.assessmentStatus === 'Draft' ? 1 : 0;
            const bNeedsAttention = b.assessmentStatus === 'In Progress' || b.assessmentStatus === 'Draft' ? 1 : 0;

            if (aNeedsAttention !== bNeedsAttention) {
                return bNeedsAttention - aNeedsAttention;
            }

            return b.id - a.id;
        });
    }, [students, searchQuery, filterDaycare, filterStatus]);

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredStudents, currentPage]);

    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

    // --- 5. UI State ---
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [bulkRestoreIds, setBulkRestoreIds] = useState<number[]>([]);

    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isArchivedOpen, setIsArchivedOpen] = useState(false);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
    const [isBulkRestoreDialogOpen, setIsBulkRestoreDialogOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);

    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
    const [archivingStudent, setArchivingStudent] = useState<Student | null>(null);
    const [restoringStudent, setRestoringStudent] = useState<Student | null>(null);

    const [formData, setFormData] = useState<StudentFormData>({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        daycare: '',
        section_id: '',
        nickname: '',
        gender: '',
        special_needs: '',
        notes: '',
    });

    const [archiveMode, setArchiveMode] = useState<'single' | 'bulk'>('single');
    const [archiveStatus, setArchiveStatus] = useState('');
    const [archiveReason, setArchiveReason] = useState('');

    const [restoreMode, setRestoreMode] = useState<'single' | 'bulk'>('single');
    const [restoreStatus, setRestoreStatus] = useState('');

    // --- 6. OPTIMISTIC HANDLERS ---

    const handleArchive = async () => {
        if (!archivingStudent) return;
        const tempId = archivingStudent.id;
        const tempStatus = archiveStatus as Student['status'];

        setAllStudents((prev) =>
            prev.map((s) =>
                s.id === tempId ? { ...s, archived: true, status: tempStatus, archivedDate: formatPHDate(new Date().toISOString()) } : s,
            ),
        );
        setIsArchiveDialogOpen(false);
        toast.success(`Child record archived as "${archiveStatus}"`);

        router.post(
            route('admin.students.archive', tempId),
            { status: archiveStatus, reason: archiveReason },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Failed to archive.');
                    router.reload();
                },
            },
        );
    };

    const handleBulkArchive = async () => {
        if (selectedStudents.size === 0) return;
        const idsToArchive = Array.from(selectedStudents);
        const tempStatus = archiveStatus as Student['status'];

        setAllStudents((prev) =>
            prev.map((s) =>
                idsToArchive.includes(s.id)
                    ? { ...s, archived: true, status: tempStatus, archivedDate: formatPHDate(new Date().toISOString()) }
                    : s,
            ),
        );
        setIsArchiveDialogOpen(false);
        setSelectedStudents(new Set());
        toast.success(`${idsToArchive.length} student(s) archived`);

        router.post(
            route('admin.students.bulk-archive'),
            { ids: idsToArchive, status: archiveStatus, reason: archiveReason },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Bulk archive failed.');
                    router.reload();
                },
            },
        );
    };

    const handleRestore = async () => {
        if (!restoringStudent) return;
        const tempId = restoringStudent.id;
        const tempStatus = restoreStatus as Student['status'];

        setAllStudents((prev) => prev.map((s) => (s.id === tempId ? { ...s, archived: false, status: tempStatus, archivedDate: undefined } : s)));
        setIsRestoreDialogOpen(false);
        toast.success(`Child record restored as "${restoreStatus}"`);

        router.post(
            route('admin.students.restore', tempId),
            { status: restoreStatus },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Failed to restore.');
                    router.reload();
                },
            },
        );
    };

    const handleBulkRestore = async () => {
        if (bulkRestoreIds.length === 0) return;
        const tempStatus = restoreStatus as Student['status'];

        setAllStudents((prev) =>
            prev.map((s) => (bulkRestoreIds.includes(s.id) ? { ...s, archived: false, status: tempStatus, archivedDate: undefined } : s)),
        );
        setIsBulkRestoreDialogOpen(false);
        toast.success(`${bulkRestoreIds.length} student(s) restored`);

        router.post(
            route('admin.students.bulk-restore'),
            { ids: bulkRestoreIds, status: restoreStatus },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Bulk restore failed.');
                    router.reload();
                },
            },
        );
        setBulkRestoreIds([]);
    };

    const handlePermanentDelete = async (student: Student) => {
        setAllStudents((prev) => prev.filter((s) => s.id !== student.id));
        toast.success('Child record permanently deleted');

        router.delete(route('admin.students.permanent-delete', student.id), {
            preserveScroll: true,
            onError: () => {
                toast.error('Failed to delete.');
                router.reload();
            },
        });
    };

    const handleBulkPermanentDelete = async (idsToDelete: number[]) => {
        if (idsToDelete.length === 0) return;

        setAllStudents((prev) => prev.filter((s) => !idsToDelete.includes(s.id)));
        toast.success(`${idsToDelete.length} record(s) permanently deleted`);

        router.post(
            route('admin.students.bulk-permanent-delete'),
            { ids: idsToDelete },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Bulk delete failed.');
                    router.reload();
                },
            },
        );
    };

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.daycare || !formData.gender) {
            toast.error('Please fill in all required fields (*)');
            return;
        }

        const apiData = {
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            date_of_birth: formData.dateOfBirth,
            daycare_name: formData.daycare,
            section_id: formData.section_id,
            nickname: formData.nickname,
            gender: formData.gender,
            special_needs: formData.special_needs,
            notes: formData.notes,
        };

        if (editingStudent) {
            router.patch(route('admin.students.update', editingStudent.id), apiData, {
                onSuccess: () => {
                    toast.success('Child record updated');
                    setIsAddEditOpen(false);
                },
                onError: () => toast.error('Failed to update record.'),
                preserveScroll: true,
            });
        } else {
            router.post(route('admin.students.store'), apiData, {
                onSuccess: () => {
                    toast.success('Child record added');
                    setIsAddEditOpen(false);
                },
                onError: () => toast.error('Failed to add record.'),
                preserveScroll: true,
            });
        }
    };

    // --- ENROLLMENT APPROVAL LOGIC ---
    const getSecureUrl = (fullPath: string) => {
        if (!fullPath) return '';
        const parts = fullPath.split('/');
        if (parts.length >= 3) return `/admin/secure-docs/${parts[1]}/${parts[2]}`;
        return '';
    };

    const openReviewModal = (enrollment: PendingEnrollment) => {
        setReviewingEnrollment(enrollment);
        setSelectedSectionId('');
        setIsReviewOpen(true);
    };

    const handleApproveEnrollment = () => {
        if (!selectedSectionId) return toast.error('You must assign the student to a Section/Class before approving.');
        router.post(
            route('admin.enrollments.approve', reviewingEnrollment!.id),
            { section_id: selectedSectionId },
            {
                onSuccess: () => {
                    toast.success('Enrollment approved and documents securely deleted.');
                    setIsReviewOpen(false);
                },
                preserveScroll: true,
            },
        );
    };

    // 🚀 NEW: Opens the Rejection UI
    const openRejectDialog = () => {
        setRejectReason('');
        setIsRejectDialogOpen(true);
    };

    // 🚀 NEW: Submits the Rejection WITH the reason string
    const handleRejectEnrollment = () => {
        if (!rejectReason.trim()) return toast.error('You must provide a reason for the rejection.');

        router.post(
            route('admin.enrollments.reject', reviewingEnrollment!.id),
            { reason: rejectReason }, // Passed directly to your backend controller
            {
                onSuccess: () => {
                    toast.success('Application rejected.');
                    setIsRejectDialogOpen(false);
                    setIsReviewOpen(false);
                },
                preserveScroll: true,
            },
        );
    };

    // --- Dialog Openers ---
    const openAddDialog = () => {
        setEditingStudent(null);
        setFormData({
            firstName: '',
            middleName: '',
            lastName: '',
            dateOfBirth: '',
            daycare: '',
            section_id: '',
            nickname: '',
            gender: '',
            special_needs: '',
            notes: '',
        });
        setIsAddEditOpen(true);
    };

    const openEditDialog = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            firstName: student.firstName,
            middleName: student.middleName || '',
            lastName: student.lastName,
            dateOfBirth: formatForInput(student.dateOfBirth),
            daycare: student.daycare || '',
            section_id: student.section_id || '',
            nickname: student.nickname || '',
            gender: student.gender || '',
            special_needs: student.special_needs || '',
            notes: student.notes || '',
        });
        setIsAddEditOpen(true);
    };

    const openDetailDialog = (student: Student) => {
        setViewingStudent(student);
        setIsDetailOpen(true);
    };

    const openArchiveDialog = (student: Student) => {
        setArchiveMode('single');
        setArchivingStudent(student);
        setArchiveStatus('');
        setArchiveReason('');
        setIsArchiveDialogOpen(true);
    };

    const openBulkArchiveDialog = () => {
        if (selectedStudents.size === 0) return toast.warning('Please select students');
        setArchiveMode('bulk');
        setArchiveStatus('');
        setArchiveReason('');
        setIsArchiveDialogOpen(true);
    };

    const openRestoreDialog = (student: Student) => {
        setRestoreMode('single');
        setRestoringStudent(student);
        setRestoreStatus('Active');
        setIsRestoreDialogOpen(true);
    };

    const openBulkRestoreDialog = (ids: number[]) => {
        if (ids.length === 0) return;
        setRestoreMode('bulk');
        setBulkRestoreIds(ids);
        setRestoreStatus('Active');
        setIsRestoreDialogOpen(true);
    };

    // Toggles and Pagination
    const handleToggleStudent = (studentId: number) => {
        setSelectedStudents((prev) => {
            const newSet = new Set(prev);
            newSet.has(studentId) ? newSet.delete(studentId) : newSet.add(studentId);
            return newSet;
        });
    };
    const handleToggleAll = () =>
        setSelectedStudents(selectedStudents.size === paginatedStudents.length ? new Set() : new Set(paginatedStudents.map((s) => s.id)));
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setSelectedStudents(new Set());
    };
    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterDaycare('all');
        setFilterStatus('all');
        setCurrentPage(1);
        toast.success('Filters cleared');
    };

    const { flash } = usePage().props as any;

    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pinData, setPinData] = useState({ name: '', code: '' });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (flash?.new_access_code) {
            setPinData({
                name: flash.student_name,
                code: flash.new_access_code,
            });
            setPinModalOpen(true);
        }
    }, [flash]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pinData.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleViewPin = (student: any) => {
        setPinData({
            name: `${student.firstName} ${student.lastName}`,
            code: student.access_code,
        });
        setPinModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Management" />

            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

                {/* MATCHING HEADER STRUCTURE */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3 transition-colors">
                            Student Management
                        </h2>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">
                            Manage your active roster, review pending enrollments, and access student records.
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="mb-6 flex items-center justify-between">
                        <TabsList className="grid w-full sm:w-[480px] h-14 grid-cols-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 shadow-sm p-1.5 rounded-2xl transition-colors">
                            <TabsTrigger value="roster" className="text-base data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-none font-bold h-full rounded-xl transition-colors">
                                <UserCheck className="mr-2 h-5 w-5" /> Active Roster
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="text-base relative dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white data-[state=active]:shadow-none font-bold h-full rounded-xl transition-colors">
                                <FileText className="mr-2 h-5 w-5" /> Pending
                                {pendingList.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-sm border-2 border-white dark:border-zinc-900">
                                        {pendingList.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="roster" className="mt-0 border-none p-0 outline-none">
                        <StudentListView
                            role="admin"
                            paginatedStudents={paginatedStudents}
                            filteredStudents={filteredStudents}
                            selectedStudents={selectedStudents}
                            onCancelSelection={() => setSelectedStudents(new Set())}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            searchQuery={searchQuery}
                            filterDaycare={filterDaycare}
                            filterStatus={filterStatus}
                            daycareList={daycareList}
                            onSearchChange={setSearchQuery}
                            onDaycareChange={setFilterDaycare}
                            onStatusChange={setFilterStatus}
                            onClearFilters={handleClearFilters}
                            onPageChange={handlePageChange}
                            onToggleAll={handleToggleAll}
                            onToggleStudent={handleToggleStudent}
                            onOpenAdd={openAddDialog}
                            onOpenImport={() => setIsImportOpen(true)}
                            onOpenArchived={() => setIsArchivedOpen(true)}
                            onExport={handleExport}
                            onOpenDetail={openDetailDialog}
                            onOpenEdit={openEditDialog}
                            onOpenArchive={openArchiveDialog}
                            onOpenBulkArchive={openBulkArchiveDialog}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onViewPin={handleViewPin}
                        />
                    </TabsContent>

                    <TabsContent value="pending" className="mt-0 border-none p-0 outline-none">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                            <div className="p-6 sm:p-8">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Applications Awaiting Review</h2>
                                <p className="mb-6 text-base font-medium text-slate-500 dark:text-slate-400 mt-2">
                                    Verify parent documents and assign students to their specific Daycare Sections.
                                </p>
                                {pendingList.length === 0 ? (
                                    <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950/50 transition-colors">
                                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-2xl font-black text-slate-900 dark:text-white transition-colors">All caught up!</span>
                                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">No pending enrollments right now.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors custom-scrollbar">
                                        <table className="w-full text-left text-base text-slate-600 dark:text-slate-300">
                                            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">
                                                <tr>
                                                    <th className="px-6 py-4">Child Name</th>
                                                    <th className="px-6 py-4">Age</th>
                                                    <th className="px-6 py-4">Applied Daycare</th>
                                                    <th className="px-6 py-4">Submitted By</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-zinc-900 transition-colors">
                                                {pendingList.map((enrollment) => (
                                                    <tr key={enrollment.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                        <td className="px-6 py-5 text-base font-bold text-slate-900 dark:text-white transition-colors">
                                                            {enrollment.last_name}, {enrollment.first_name}
                                                        </td>
                                                        <td className="px-6 py-5 text-base font-medium transition-colors">{calculateAge(enrollment.date_of_birth)} yrs</td>
                                                        <td className="px-6 py-5 text-base font-bold text-indigo-600 dark:text-indigo-400 transition-colors">{enrollment.daycare.name}</td>
                                                        <td className="px-6 py-5">
                                                            <div className="text-base font-bold text-slate-800 dark:text-slate-200 transition-colors">
                                                                {enrollment.user.first_name} {enrollment.user.last_name}
                                                            </div>
                                                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">{enrollment.user.email}</div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <Button
                                                                onClick={() => openReviewModal(enrollment)}
                                                                className="h-12 px-6 rounded-xl text-base bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold shadow-sm transition-colors"
                                                            >
                                                                <Eye className="mr-2 h-5 w-5" /> Review Docs
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* 🚀 MODALS START HERE */}

                {/* 1. Review Application Modal */}
                <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                    <DialogContent hideClose className="sm:max-w-[1000px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl transition-colors duration-200 flex flex-col max-h-[90vh]">
                        {/* --- HEADER --- */}
                        <div className="bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative z-10 transition-colors shrink-0 text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors">
                                    <FileText className="size-6" strokeWidth={2.5} />
                                </div>
                                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Review Application</DialogTitle>
                            </div>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 text-base font-medium transition-colors mt-2 leading-relaxed">
                                Verification of documents and classroom placement.
                            </DialogDescription>
                        </div>

                        {reviewingEnrollment && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar transition-colors">
                                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                                    {/* LEFT SIDE: Document Previews (7 columns) */}
                                    <div className="lg:col-span-7 space-y-6">
                                        <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 transition-colors">
                                            <Eye className="size-4" /> Submitted Proofs
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {/* Birth Certificate */}
                                            <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-4 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                                                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">PSA Birth Certificate</p>
                                                <a
                                                    href={getSecureUrl(reviewingEnrollment.birth_cert_path)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-slate-800 transition-colors"
                                                >
                                                    <img
                                                        src={getSecureUrl(reviewingEnrollment.birth_cert_path)}
                                                        alt="Birth Certificate"
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            e.currentTarget.parentElement!.innerHTML =
                                                                '<div class="flex flex-col h-full items-center justify-center bg-slate-50 dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 gap-3 transition-colors"><FileText class="size-10 opacity-40" /><span class="text-sm font-bold underline">View PDF Document</span></div>';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                        <div className="bg-white dark:bg-zinc-900 dark:text-white opacity-0 group-hover:opacity-100 px-5 py-2.5 rounded-xl text-[11px] font-bold shadow-lg transition-all uppercase tracking-widest">Expand Document</div>
                                                    </div>
                                                </a>
                                            </div>

                                            {/* Parent ID */}
                                            <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-4 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                                                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Valid Parent ID</p>
                                                <a
                                                    href={getSecureUrl(reviewingEnrollment.parent_id_path)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-slate-800 transition-colors"
                                                >
                                                    <img
                                                        src={getSecureUrl(reviewingEnrollment.parent_id_path)}
                                                        alt="Parent ID"
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            e.currentTarget.parentElement!.innerHTML =
                                                                '<div class="flex flex-col h-full items-center justify-center bg-slate-50 dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 gap-3 transition-colors"><FileText class="size-10 opacity-40" /><span class="text-sm font-bold underline">View PDF Document</span></div>';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 dark:group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                        <div className="bg-white dark:bg-zinc-900 dark:text-white opacity-0 group-hover:opacity-100 px-5 py-2.5 rounded-xl text-[11px] font-bold shadow-lg transition-all uppercase tracking-widest">Expand Document</div>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 text-center italic transition-colors">Documents are encrypted and will be automatically purged upon approval/rejection.</p>
                                    </div>

                                    {/* RIGHT SIDE: Application Details (5 columns) */}
                                    <div className="lg:col-span-5 space-y-6">
                                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
                                            <h4 className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3 transition-colors">
                                                Identity Details
                                            </h4>

                                            <div className="space-y-5">
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Learner Name</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1 transition-colors">{reviewingEnrollment.first_name} {reviewingEnrollment.last_name}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-5">
                                                    <div>
                                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Birthday</p>
                                                        <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 transition-colors">{formatPHDate(reviewingEnrollment.date_of_birth)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Gender</p>
                                                        <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 transition-colors">{reviewingEnrollment.gender}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">Submitted By (Parent)</p>
                                                    <p className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1.5 transition-colors">
                                                        <UserCheck className="size-4 text-slate-400 dark:text-slate-500" />
                                                        {reviewingEnrollment.user.first_name} {reviewingEnrollment.user.last_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assignment Area */}
                                        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden transition-colors">
                                            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-indigo-100 dark:bg-indigo-500/20 blur-3xl transition-colors"></div>
                                            <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest relative z-10 transition-colors">
                                                Final Placement
                                            </h4>

                                            <div className="relative z-10 space-y-4">
                                                <div>
                                                    <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Assign to Section / Class <span className="text-red-500">*</span></label>
                                                    {sections.filter((s) => s.daycare_id == reviewingEnrollment.daycare.id).length === 0 ? (
                                                        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400 font-medium transition-colors">
                                                            No Sections configured for <b className="dark:text-red-300">{reviewingEnrollment.daycare.name}</b>. Create a section in settings first.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <select
                                                                className={cn(
                                                                    "w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 px-4 text-base font-bold shadow-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20",
                                                                    selectedSectionId ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                                                                )}
                                                                value={selectedSectionId}
                                                                onChange={(e) => setSelectedSectionId(e.target.value)}
                                                            >
                                                                <option value="">-- Select a Section --</option>
                                                                {sections
                                                                    .filter((s) => s.daycare_id == reviewingEnrollment.daycare.id)
                                                                    .map((section) => {
                                                                        const currentCount = section.students_count || 0;
                                                                        const isFull = currentCount >= section.capacity;
                                                                        const remaining = section.capacity - currentCount;

                                                                        return (
                                                                            <option
                                                                                key={section.id}
                                                                                value={section.id}
                                                                                disabled={isFull}
                                                                                className={isFull ? "text-red-400 dark:text-red-500 font-bold" : "text-slate-900 dark:text-slate-200 font-bold"}
                                                                            >
                                                                                {section.name} — {currentCount}/{section.capacity}
                                                                                {isFull ? " (FULL)" : ` (${remaining} slots left)`}
                                                                            </option>
                                                                        );
                                                                    })}
                                                            </select>
                                                            {selectedSectionId && (
                                                                <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-white dark:bg-zinc-900 p-4 border border-indigo-100 dark:border-indigo-500/20 shadow-sm transition-colors">
                                                                    <div className="size-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
                                                                    <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest transition-colors">
                                                                        Real-time Slot Verification Active
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <p className="mt-4 text-[11px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest transition-colors leading-relaxed">
                                                                This learner will be added to the teacher's roster immediately upon approval.
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-end sm:justify-between gap-3 shrink-0 transition-colors m-0">
                            <Button
                                variant="ghost"
                                className="w-full sm:w-auto px-6 h-12 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                                onClick={() => setIsReviewOpen(false)}
                            >
                                <XCircle className="mr-2 size-5" /> Cancel Review
                            </Button>
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                {/* 🚀 CHANGED onClick to open the new Reject Dialog */}
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto px-6 h-12 rounded-xl text-base font-bold text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    onClick={openRejectDialog}
                                >
                                    <XCircle className="mr-2 size-5" /> Reject
                                </Button>
                                <Button
                                    onClick={handleApproveEnrollment}
                                    className="w-full sm:w-auto px-8 h-12 rounded-xl text-base font-bold bg-emerald-600 dark:bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500 shadow-sm transition-all"
                                >
                                    <CheckCircle2 className="mr-2 size-5" /> Approve & Enroll
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 🚀 2. NEW REJECT APPLICATION MODAL */}
                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent className="sm:max-w-[450px] bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-0">
                        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                            <DialogHeader className="text-left">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                                        <XCircle className="size-6" strokeWidth={2.5} />
                                    </div>
                                    <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Reject Application</DialogTitle>
                                </div>
                                <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                    Please provide a reason. This will be securely sent to the parent's notification center.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-zinc-950/30">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2.5 block">Reason for Rejection <span className="text-red-500">*</span></label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g., Missing valid parent ID, Daycare section is currently full..."
                                className="w-full h-32 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 px-4 py-3 text-base font-medium text-slate-900 dark:text-white shadow-sm transition-all focus:border-red-500 focus:ring-4 focus:ring-red-500/10 dark:focus:ring-red-500/20 resize-none"
                            />
                        </div>

                        <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                            <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)} className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                                Cancel
                            </Button>
                            <Button onClick={handleRejectEnrollment} className="w-full sm:w-auto h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-8 shadow-sm transition-colors">
                                Confirm Rejection
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                    <ArchiveStudentDialog
                        student={archiveMode === 'single' ? archivingStudent : null}
                        archiveStatus={archiveStatus}
                        onArchiveStatusChange={setArchiveStatus}
                        archiveReason={archiveReason}
                        onArchiveReasonChange={setArchiveReason}
                        onConfirm={archiveMode === 'single' ? handleArchive : handleBulkArchive}
                        onCancel={() => setIsArchiveDialogOpen(false)}
                        isBulk={archiveMode === 'bulk'}
                        selectedStudents={archiveMode === 'bulk' ? students.filter((s) => selectedStudents.has(s.id)) : []}
                    />
                </Dialog>

                <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
                    <AddEditStudentDialog
                        editingStudent={editingStudent}
                        formData={formData}
                        onFormDataChange={setFormData}
                        onSubmit={handleSubmit}
                        daycares={rawDaycares}
                        sections={sections}
                        onOpenChange={setIsAddEditOpen}
                    />
                </Dialog>
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <ImportStudentsDialog onClose={() => setIsImportOpen(false)} />
                </Dialog>
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <StudentDetailDialog student={viewingStudent} onOpenChange={setIsDetailOpen} onOpenEdit={openEditDialog} />
                </Dialog>
                <ArchivedStudentsDialog
                    open={isArchivedOpen}
                    onOpenChange={setIsArchivedOpen}
                    archivedStudents={archivedStudents}
                    daycareList={daycareList}
                    onOpenDetail={openDetailDialog}
                    onRestore={openRestoreDialog}
                    onBulkRestore={openBulkRestoreDialog}
                    onDelete={handlePermanentDelete}
                    onBulkDelete={handleBulkPermanentDelete}
                    onPrintReport={(student) => window.open(route('admin.students.report', student.id), '_blank')}
                />
                <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
                    <RestoreStudentDialog
                        student={restoreMode === 'single' ? restoringStudent : null}
                        restoreStatus={restoreStatus}
                        onRestoreStatusChange={setRestoreStatus}
                        onConfirm={restoreMode === 'single' ? handleRestore : handleBulkRestore}
                        onCancel={() => setIsRestoreDialogOpen(false)}
                        isBulk={restoreMode === 'bulk'}
                        selectedStudents={restoreMode === 'bulk' ? archivedStudents.filter((s) => bulkRestoreIds.includes(s.id)) : []}
                    />
                </Dialog>
            </div>

            <Dialog open={pinModalOpen} onOpenChange={setPinModalOpen}>
                <DialogContent hideClose className="text-center sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl transition-colors duration-200 flex flex-col">

                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <DialogHeader className="text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                                    <CheckCircle2 className="size-6" strokeWidth={2.5} />
                                </div>
                                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Student Added!
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                                Please provide this Secret PIN to the parents of <strong className="text-slate-900 dark:text-white font-black">{pinData.name}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 sm:p-8 space-y-6 bg-slate-50 dark:bg-zinc-950/30 transition-colors">
                        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-900 px-8 py-6 shadow-sm transition-colors w-full">
                            <span className="font-mono text-5xl sm:text-6xl font-black tracking-[0.2em] text-slate-900 dark:text-white transition-colors block text-center">{pinData.code}</span>
                        </div>
                        <p className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 px-5 py-4 text-sm font-bold text-amber-600 dark:text-amber-400 transition-colors w-full text-left leading-relaxed">
                            Parents will need this code + the child's exact Date of Birth to successfully link their accounts.
                        </p>
                    </div>

                    <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                        <Button type="button" variant="ghost" onClick={copyToClipboard} className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                            {copied ? <CheckCircle2 className="mr-2 size-5 text-emerald-600 dark:text-emerald-500" /> : <Copy className="mr-2 size-5" />}
                            {copied ? 'Copied!' : 'Copy PIN'}
                        </Button>
                        <Button type="button" onClick={() => setPinModalOpen(false)} className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors">
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
