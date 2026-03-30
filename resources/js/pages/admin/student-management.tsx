import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Child as InertiaChild, Daycare as InertiaDaycare, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, CheckCircle2, Copy, Eye, FileText, UserCheck, XCircle } from 'lucide-react';

import { AddEditStudentDialog } from '@/components/admin/add-edit-student-dialog';
import { ImportStudentsDialog } from '@/components/admin/import-students-dialog';
import { StudentDetailDialog } from '@/components/admin/student-detail-dialog';
import { ArchiveStudentDialog } from '@/components/shared/archive-student-dialog';
import { ArchivedStudentsDialog } from '@/components/shared/archived-students-dialog';
import { RestoreStudentDialog } from '@/components/shared/restore-student-dialog';
import { StudentListView } from '@/components/shared/student-list-view';

// 🚀 NEW: Import your brand new, bulletproof date toolkit!
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
    // 🚀 FIX: Tell TypeScript to expect these new fields
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
            // 🚀 FIX: Properly map the Age and Session Name so the Archive Dialog can display them!
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
        // Read the URL parameters
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');

        // If the URL has ?tab=pending, switch the tab automatically
        if (tabParam === 'pending') {
            setActiveTab('pending');
        } else if (tabParam === 'roster') {
            setActiveTab('roster');
        }
    }, []);

    const [reviewingEnrollment, setReviewingEnrollment] = useState<PendingEnrollment | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');
    const [isReviewOpen, setIsReviewOpen] = useState(false);

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
        // ❌ REMOVED: if (!confirm(...)) return;

        // 1. Optimistically update the UI so it feels instant
        setAllStudents((prev) => prev.filter((s) => s.id !== student.id));
        toast.success('Child record permanently deleted');

        // 2. Send the request to the database
        router.delete(route('admin.students.permanent-delete', student.id), {
            preserveScroll: true,
            onError: () => {
                toast.error('Failed to delete.');
                router.reload(); // Reverts the UI if the database fails
            },
        });
    };

    const handleBulkPermanentDelete = async (idsToDelete: number[]) => {
        if (idsToDelete.length === 0) return;

        // ❌ REMOVED: if (!confirm(...)) return;

        // 1. Optimistically update the UI
        setAllStudents((prev) => prev.filter((s) => !idsToDelete.includes(s.id)));
        toast.success(`${idsToDelete.length} record(s) permanently deleted`);

        // 2. Send the request to the database
        router.post(
            route('admin.students.bulk-permanent-delete'),
            { ids: idsToDelete },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Bulk delete failed.');
                    router.reload(); // Reverts the UI if the database fails
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

    const handleRejectEnrollment = () => {
        if (!confirm('Are you sure you want to reject this application? The documents will be deleted.')) return;
        router.post(
            route('admin.enrollments.reject', reviewingEnrollment!.id),
            {},
            {
                onSuccess: () => {
                    toast.success('Application rejected.');
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

    // 1. Grab the flash data from Inertia
    const { flash } = usePage().props as any;

    // 2. Setup state for the PIN Reveal Modal
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pinData, setPinData] = useState({ name: '', code: '' });
    const [copied, setCopied] = useState(false);

    // 3. Listen for the PIN arriving from the Backend
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
            <div className="p-4 sm:p-6 lg:p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="mb-6 flex items-center justify-between">
                        <TabsList className="grid w-[400px] grid-cols-2">
                            <TabsTrigger value="roster">
                                <UserCheck className="mr-2 h-4 w-4" /> Active Roster
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="relative">
                                <FileText className="mr-2 h-4 w-4" /> Pending Enrollments
                                {pendingList.length > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
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
                        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-neutral-900">Applications Awaiting Review</h2>
                                <p className="mb-6 text-sm text-neutral-500">
                                    Verify parent documents and assign students to their specific Daycare Sections.
                                </p>
                                {pendingList.length === 0 ? (
                                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50">
                                        <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400" />
                                        <span className="font-medium text-neutral-600">All caught up!</span>
                                        <p className="text-sm text-neutral-500">No pending enrollments right now.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-neutral-600">
                                            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500 uppercase">
                                                <tr>
                                                    <th className="px-6 py-3 font-semibold">Child Name</th>
                                                    <th className="px-6 py-3 font-semibold">Age</th>
                                                    <th className="px-6 py-3 font-semibold">Applied Daycare</th>
                                                    <th className="px-6 py-3 font-semibold">Submitted By</th>
                                                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-100 bg-white">
                                                {pendingList.map((enrollment) => (
                                                    <tr key={enrollment.id} className="hover:bg-neutral-50/50">
                                                        <td className="px-6 py-4 font-medium text-neutral-900">
                                                            {enrollment.last_name}, {enrollment.first_name}
                                                        </td>
                                                        <td className="px-6 py-4">{calculateAge(enrollment.date_of_birth)} yrs</td>
                                                        <td className="px-6 py-4 font-medium text-indigo-600">{enrollment.daycare.name}</td>
                                                        <td className="px-6 py-4">
                                                            {enrollment.user.first_name} {enrollment.user.last_name}
                                                            <div className="text-xs text-neutral-400">{enrollment.user.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Button
                                                                onClick={() => openReviewModal(enrollment)}
                                                                size="sm"
                                                                className="bg-indigo-600 hover:bg-indigo-700"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" /> Review Docs
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

                <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                    <DialogContent className="max-h-[95vh] sm:max-w-[900px] p-0 overflow-hidden bg-slate-50 border-none shadow-2xl rounded-2xl">
                        {/* --- HEADER --- */}
                        <div className="bg-white border-b border-slate-100 p-6 shadow-sm relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                                    <FileText className="size-7" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Review Application</DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium">
                                        Verification of documents and classroom placement.
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>

                        {reviewingEnrollment && (
                            <div className="overflow-y-auto max-h-[calc(95vh-180px)] scrollbar-thin">
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                                    {/* LEFT SIDE: Document Previews (7 columns) */}
                                    <div className="lg:col-span-7 space-y-6">
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Eye className="size-3" /> Submitted Proofs
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Birth Certificate */}
                                            <div className="group relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
                                                <p className="mb-2 text-xs font-bold text-slate-700">PSA Birth Certificate</p>
                                                <a
                                                    href={getSecureUrl(reviewingEnrollment.birth_cert_path)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 border border-slate-100"
                                                >
                                                    <img
                                                        src={getSecureUrl(reviewingEnrollment.birth_cert_path)}
                                                        alt="Birth Certificate"
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            e.currentTarget.parentElement!.innerHTML =
                                                                '<div class="flex flex-col h-full items-center justify-center bg-slate-50 text-indigo-600 gap-2"><FileText class="size-8 opacity-40" /><span class="text-xs font-bold underline">View PDF Document</span></div>';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                        <div className="bg-white/90 opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg transition-opacity uppercase tracking-wider">Expand Document</div>
                                                    </div>
                                                </a>
                                            </div>

                                            {/* Parent ID */}
                                            <div className="group relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md">
                                                <p className="mb-2 text-xs font-bold text-slate-700">Valid Parent ID</p>
                                                <a
                                                    href={getSecureUrl(reviewingEnrollment.parent_id_path)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 border border-slate-100"
                                                >
                                                    <img
                                                        src={getSecureUrl(reviewingEnrollment.parent_id_path)}
                                                        alt="Parent ID"
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            e.currentTarget.parentElement!.innerHTML =
                                                                '<div class="flex flex-col h-full items-center justify-center bg-slate-50 text-indigo-600 gap-2"><FileText class="size-8 opacity-40" /><span class="text-xs font-bold underline">View PDF Document</span></div>';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                        <div className="bg-white/90 opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg transition-opacity uppercase tracking-wider">Expand Document</div>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 italic text-center italic">Documents are encrypted and will be automatically purged upon approval/rejection.</p>
                                    </div>

                                    {/* RIGHT SIDE: Application Details (5 columns) */}
                                    <div className="lg:col-span-5 space-y-6">
                                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                                            <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.2em] border-b border-slate-50 pb-3">
                                                Identity Details
                                            </h4>

                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Learner Name</p>
                                                    <p className="text-base font-extrabold text-slate-900">{reviewingEnrollment.first_name} {reviewingEnrollment.last_name}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Birthday</p>
                                                        <p className="text-sm font-bold text-slate-800">{formatPHDate(reviewingEnrollment.date_of_birth)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</p>
                                                        <p className="text-sm font-bold text-slate-800">{reviewingEnrollment.gender}</p>
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-slate-50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted By (Parent)</p>
                                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                                                        <UserCheck className="size-3.5 text-slate-400" />
                                                        {reviewingEnrollment.user.first_name} {reviewingEnrollment.user.last_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assignment Area */}
                                        <div className="rounded-2xl border-2 border-indigo-50 bg-indigo-50/40 p-5 shadow-inner space-y-4 relative overflow-hidden">
                                            <div className="absolute -right-4 -top-4 size-20 rounded-full bg-indigo-100 blur-2xl opacity-50"></div>
                                            <h4 className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em] relative z-10">
                                                Final Placement
                                            </h4>

                                            <div className="relative z-10 space-y-4">
                                                <div>
                                                    <label className="mb-2 block text-xs font-black text-slate-700">Assign to Section / Class *</label>
                                                    {sections.filter((s) => s.daycare_id == reviewingEnrollment.daycare.id).length === 0 ? (
                                                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 font-medium">
                                                            No Sections configured for <b>{reviewingEnrollment.daycare.name}</b>. Create a section in settings first.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <select
                                                                className={cn(
                                                                    "w-full h-11 rounded-xl border-slate-200 bg-white px-3 text-sm font-bold shadow-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
                                                                    selectedSectionId ? "text-slate-900" : "text-slate-400"
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
                                                                                className={isFull ? "text-red-400" : "text-slate-900"}
                                                                            >
                                                                                {section.name} — {currentCount}/{section.capacity}
                                                                                {isFull ? " (FULL)" : ` (${remaining} slots left)`}
                                                                            </option>
                                                                        );
                                                                    })}
                                                            </select>
                                                            {selectedSectionId && (
                                                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/50 p-2 border border-indigo-100/50">
                                                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">
                                                                        Real-time Slot Verification Active
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <p className="mt-2 text-[10px] text-indigo-500 font-medium">
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

                        <DialogFooter className="p-6 border-t border-slate-100 bg-white flex flex-row items-center justify-between sm:justify-between rounded-b-2xl">
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold h-11 rounded-xl"
                                onClick={handleRejectEnrollment}
                            >
                                <XCircle className="mr-2 size-4" /> Reject Application
                            </Button>
                            <Button
                                onClick={handleApproveEnrollment}
                                className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 px-8 h-11 rounded-xl font-bold transition-all hover:-translate-y-0.5"
                            >
                                <CheckCircle2 className="mr-2 size-4" /> Approve & Enroll
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
                <DialogContent className="text-center sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold text-indigo-600">Student Added Successfully!</DialogTitle>
                        <DialogDescription className="pt-2 text-center text-slate-600">
                            Please provide this Secret PIN to the parents of <br />
                            <span className="font-semibold text-slate-900">{pinData.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center justify-center space-y-4 py-6">
                        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 px-8 py-4">
                            <span className="font-mono text-4xl font-black tracking-[0.2em] text-slate-900">{pinData.code}</span>
                        </div>
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-600">
                            Parents will need this code + the child's exact Date of Birth to link their accounts.
                        </p>
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
                        <Button type="button" variant="outline" onClick={copyToClipboard} className="gap-2">
                            {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
                            {copied ? 'Copied!' : 'Copy Code'}
                        </Button>
                        <Button type="button" onClick={() => setPinModalOpen(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
