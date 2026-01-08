import { Dialog } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Child as InertiaChild, Daycare as InertiaDaycare, User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Import UI components
import { AddEditStudentDialog } from '@/components/admin/add-edit-student-dialog';
import { ArchiveStudentDialog } from '@/components/admin/archive-student-dialog';
import { ArchivedStudentsDialog } from '@/components/admin/archived-students-dialog';
import { BulkArchiveDialog } from '@/components/admin/bulk-archive-dialog';
import { BulkRestoreDialog } from '@/components/admin/bulk-restore-dialog';
import { ImportStudentsDialog } from '@/components/admin/import-students-dialog';
import { RestoreStudentDialog } from '@/components/admin/restore-student-dialog';
import { StudentDetailDialog } from '@/components/admin/student-detail-dialog';
import { StudentListView } from '@/components/admin/student-list-view';

// --- Shared Types ---
export interface Student {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    daycare: string;
    daycareId: number;
    parentLinked: boolean;
    parentName?: string;
    status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
    archived: boolean;
    archivedDate?: string;
    nickname: string;
    gender: string;
    special_needs: string;
    notes: string;
    [key: string]: any;
}

export interface StudentFormData {
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

const ITEMS_PER_PAGE = 10;

const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
};

const breadcrumbs = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Student Management', href: '/admin/student-management' },
];

export default function StudentManagement() {
    type StudentPageProps = {
        students: InertiaChild[];
        daycares: InertiaDaycare[];
        parents: User[];
    };
    const { students: rawStudents, daycares: rawDaycares } = usePage<StudentPageProps>().props;

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
            archivedDate: student.deleted_at ? formatDateForDisplay(student.deleted_at) : undefined,
            nickname: student.nickname || '',
            gender: student.gender || '',
            special_needs: student.special_needs || '',
            notes: student.notes || '',
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
    // --- 2. Local State (For Instant Updates) ---
    const [allStudents, setAllStudents] = useState<Student[]>(() => rawStudents.map(transformStudent));

    // Sync if server props change (e.g. reload)
    useEffect(() => {
        setAllStudents(rawStudents.map(transformStudent));
    }, [rawStudents]);

    // --- 3. Filter State ---
    // Main List Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDaycare, setFilterDaycare] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [archivedSearchQuery, setArchivedSearchQuery] = useState('');
    const [archivedFilterDaycare, setArchivedFilterDaycare] = useState<string>('all');
    const [filterDate, setFilterDate] = useState<string>('all');

    const [currentPage, setCurrentPage] = useState(1);

    // --- 4. Derived Lists ---
    const students = useMemo(() => allStudents.filter((s) => !s.archived), [allStudents]);
    const archivedStudents = useMemo(() => allStudents.filter((s) => s.archived), [allStudents]);

    // Filter Active Students
    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(searchQuery.toLowerCase());
            const matchesDaycare = filterDaycare === 'all' || student.daycare === filterDaycare;
            const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
            return matchesSearch && matchesDaycare && matchesStatus;
        });
    }, [students, searchQuery, filterDaycare, filterStatus]);

    const paginatedStudents = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredStudents, currentPage]);

    // Filter Archived Students (Uses NEW independent state)
    const filteredArchivedStudents = useMemo(() => {
        return archivedStudents.filter((student) => {
            const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.toLowerCase();

            // Use archivedSearchQuery
            const matchesSearch = fullName.includes(archivedSearchQuery.toLowerCase());

            // Use archivedFilterDaycare
            const matchesDaycare = archivedFilterDaycare === 'all' || student.daycare === archivedFilterDaycare;

            const matchesDate = filterDate === 'all' || !student.archivedDate || student.archivedDate === filterDate;
            return matchesSearch && matchesDaycare && matchesDate;
        });
    }, [archivedStudents, archivedSearchQuery, archivedFilterDaycare, filterDate]); // Dependencies updated

    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

    // --- 5. UI State ---
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [selectedArchivedStudents, setSelectedArchivedStudents] = useState<Set<number>>(new Set());
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isArchivedOpen, setIsArchivedOpen] = useState(false);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [isBulkArchiveDialogOpen, setIsBulkArchiveDialogOpen] = useState(false);
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
        nickname: '',
        gender: '',
        special_needs: '',
        notes: '',
    });

    const [archiveStatus, setArchiveStatus] = useState<'Active' | 'Inactive' | 'Graduated' | 'Transferred'>('Graduated');
    const [bulkArchiveStatus, setBulkArchiveStatus] = useState<'Active' | 'Inactive' | 'Graduated' | 'Transferred'>('Graduated');
    const [restoreStatus, setRestoreStatus] = useState<'Active' | 'Inactive' | 'Graduated' | 'Transferred'>('Active');
    const [bulkRestoreStatus, setBulkRestoreStatus] = useState<'Active' | 'Inactive' | 'Graduated' | 'Transferred'>('Active');
    const [archiveReason, setArchiveReason] = useState('');
    const [bulkArchiveReason, setBulkArchiveReason] = useState('');

    // --- 6. OPTIMISTIC HANDLERS (The "No Refresh" Magic) ---

    const handleDelete = async (studentId: number) => {
        if (!confirm('Are you sure you want to temporarily delete (archive) this child record?')) return;

        // ⚡ Optimistic Update: Remove from list instantly
        setAllStudents((prev) =>
            prev.map((s) =>
                s.id === studentId ? { ...s, archived: true, archivedDate: formatDateForDisplay(new Date().toISOString()), status: 'Inactive' } : s,
            ),
        );
        toast.success('Child record moved to archive.');

        router.delete(route('admin.students.destroy', studentId), {
            preserveScroll: true,
            onError: () => {
                toast.error('Failed to delete. Reverting...');
                router.reload(); // Revert on error
            },
        });
    };

    const handleArchive = async () => {
        if (!archivingStudent) return;
        const tempId = archivingStudent.id;
        const tempStatus = archiveStatus;

        // ⚡ Optimistic Update
        setAllStudents((prev) =>
            prev.map((s) =>
                s.id === tempId ? { ...s, archived: true, status: tempStatus, archivedDate: formatDateForDisplay(new Date().toISOString()) } : s,
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
                    toast.error('Failed to archive. Reverting...');
                    router.reload();
                },
            },
        );
    };

    const handleRestore = async () => {
        if (!restoringStudent) return;
        const tempId = restoringStudent.id;
        const tempStatus = restoreStatus;

        // ⚡ Optimistic Update
        setAllStudents((prev) => prev.map((s) => (s.id === tempId ? { ...s, archived: false, status: tempStatus, archivedDate: undefined } : s)));
        setIsRestoreDialogOpen(false);
        toast.success(`Child record restored as "${restoreStatus}"`);

        router.post(
            route('admin.students.restore', tempId),
            { status: restoreStatus },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Failed to restore. Reverting...');
                    router.reload();
                },
            },
        );
    };

    const handleBulkArchive = async () => {
        if (selectedStudents.size === 0) return;
        const idsToArchive = Array.from(selectedStudents);
        const tempStatus = bulkArchiveStatus;

        // ⚡ Optimistic Update
        setAllStudents((prev) =>
            prev.map((s) =>
                idsToArchive.includes(s.id)
                    ? { ...s, archived: true, status: tempStatus, archivedDate: formatDateForDisplay(new Date().toISOString()) }
                    : s,
            ),
        );
        setIsBulkArchiveDialogOpen(false);
        setSelectedStudents(new Set());
        toast.success(`${idsToArchive.length} student(s) archived`);

        router.post(
            route('admin.students.bulk-archive'),
            { ids: idsToArchive, status: bulkArchiveStatus, reason: bulkArchiveReason },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Bulk archive failed. Reverting...');
                    router.reload();
                },
            },
        );
    };

    const handleBulkRestore = async () => {
        if (selectedArchivedStudents.size === 0) return;
        const idsToRestore = Array.from(selectedArchivedStudents);
        const tempStatus = bulkRestoreStatus;

        // ⚡ Optimistic Update
        setAllStudents((prev) =>
            prev.map((s) => (idsToRestore.includes(s.id) ? { ...s, archived: false, status: tempStatus, archivedDate: undefined } : s)),
        );
        setIsBulkRestoreDialogOpen(false);
        setSelectedArchivedStudents(new Set());
        toast.success(`${idsToRestore.length} student(s) restored`);

        router.post(
            route('admin.students.bulk-restore'),
            { ids: idsToRestore, status: bulkRestoreStatus },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Bulk restore failed. Reverting...');
                    router.reload();
                },
            },
        );
    };

    const handlePermanentDelete = async (studentId: number) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this record?')) return;

        // ⚡ Optimistic Update
        setAllStudents((prev) => prev.filter((s) => s.id !== studentId));
        toast.success('Child record permanently deleted');

        router.delete(route('admin.students.permanent-delete', studentId), {
            preserveScroll: true,
            onError: () => {
                toast.error('Failed to delete. Reverting...');
                router.reload();
            },
        });
    };

    const handleBulkPermanentDelete = async () => {
        if (selectedArchivedStudents.size === 0) return;
        const idsToDelete = Array.from(selectedArchivedStudents);
        if (!confirm(`Permanently delete ${idsToDelete.length} record(s)?`)) return;

        // ⚡ Optimistic Update
        setAllStudents((prev) => prev.filter((s) => !idsToDelete.includes(s.id)));
        setSelectedArchivedStudents(new Set());
        toast.success(`${idsToDelete.length} record(s) permanently deleted`);

        router.post(
            route('admin.students.bulk-permanent-delete'),
            { ids: idsToDelete },
            {
                preserveScroll: true,
                onError: () => {
                    toast.error('Bulk delete failed. Reverting...');
                    router.reload();
                },
            },
        );
    };

    // --- Standard Form Handlers ---
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
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Failed to update record.');
                },
                preserveScroll: true,
            });
        } else {
            router.post(route('admin.students.store'), apiData, {
                onSuccess: () => {
                    toast.success('Child record added');
                    setIsAddEditOpen(false);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Failed to add record.');
                },
                preserveScroll: true,
            });
        }
    };

    // --- Helpers ---
    const suggestArchiveStatus = (student: Student): 'Active' | 'Inactive' | 'Graduated' | 'Transferred' => {
        const age = calculateAge(student.dateOfBirth);
        if (student.status === 'Inactive') return 'Inactive';
        if (age >= 5) return 'Graduated';
        return 'Graduated';
    };

    const openAddDialog = () => {
        setEditingStudent(null);
        setFormData({
            firstName: '',
            middleName: '',
            lastName: '',
            dateOfBirth: '',
            daycare: '',
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
            middleName: student.middleName,
            lastName: student.lastName,
            dateOfBirth: formatDateForInput(student.dateOfBirth),
            daycare: student.daycare,
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
        setArchivingStudent(student);
        setArchiveStatus(suggestArchiveStatus(student));
        setArchiveReason('');
        setIsArchiveDialogOpen(true);
    };
    const openRestoreDialog = (student: Student) => {
        setRestoringStudent(student);
        setRestoreStatus('Active');
        setIsRestoreDialogOpen(true);
    };
    const openBulkArchiveDialog = () => {
        if (selectedStudents.size === 0) {
            toast.warning('Please select students');
            return;
        }
        setBulkArchiveStatus('Graduated');
        setBulkArchiveReason('');
        setIsBulkArchiveDialogOpen(true);
    };
    const openBulkRestoreDialog = () => {
        if (selectedArchivedStudents.size === 0) {
            toast.warning('Please select students');
            return;
        }
        setBulkRestoreStatus('Active');
        setIsBulkRestoreDialogOpen(true);
    };

    // Toggles
    const handleToggleStudent = (studentId: number) => {
        setSelectedStudents((prev) => {
            const newSet = new Set(prev);
            newSet.has(studentId) ? newSet.delete(studentId) : newSet.add(studentId);
            return newSet;
        });
    };
    const handleToggleAll = () => {
        setSelectedStudents(selectedStudents.size === paginatedStudents.length ? new Set() : new Set(paginatedStudents.map((s) => s.id)));
    };
    const handleToggleArchivedStudent = (studentId: number) => {
        setSelectedArchivedStudents((prev) => {
            const newSet = new Set(prev);
            newSet.has(studentId) ? newSet.delete(studentId) : newSet.add(studentId);
            return newSet;
        });
    };
    const handleToggleAllArchived = () => {
        setSelectedArchivedStudents(
            selectedArchivedStudents.size === filteredArchivedStudents.length ? new Set() : new Set(filteredArchivedStudents.map((s) => s.id)),
        );
    };
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Management" />
            <div className="p-4 sm:p-6 lg:p-8">
                <StudentListView
                    paginatedStudents={paginatedStudents}
                    filteredStudents={filteredStudents}
                    selectedStudents={selectedStudents}
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
                    onDelete={handleDelete}
                    onOpenBulkArchive={openBulkArchiveDialog}
                    itemsPerPage={ITEMS_PER_PAGE}
                />

                <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
                    <AddEditStudentDialog
                        editingStudent={editingStudent}
                        formData={formData}
                        onFormDataChange={setFormData}
                        onSubmit={handleSubmit}
                        daycareList={daycareList}
                        onOpenChange={setIsAddEditOpen} // 👈 PASS THIS HERE
                    />
                </Dialog>
                <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                    <ImportStudentsDialog onClose={() => setIsImportOpen(false)} />
                </Dialog>
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <StudentDetailDialog student={viewingStudent} onOpenChange={setIsDetailOpen} onOpenEdit={openEditDialog} />
                </Dialog>

                {/* ARCHIVED DIALOG WITH SEPARATE FILTERS */}
                <Dialog
                    open={isArchivedOpen}
                    onOpenChange={(open) => {
                        setIsArchivedOpen(open);
                        if (!open) {
                            setSelectedArchivedStudents(new Set());
                            setArchivedSearchQuery('');
                            setArchivedFilterDaycare('all');
                        }
                    }}
                >
                    <ArchivedStudentsDialog
                        onOpenChange={setIsArchivedOpen}
                        archivedStudents={filteredArchivedStudents}
                        daycareList={daycareList}
                        selectedArchivedStudents={selectedArchivedStudents}
                        searchQuery={archivedSearchQuery}
                        onSearchChange={setArchivedSearchQuery}
                        filterDaycare={archivedFilterDaycare}
                        onDaycareChange={setArchivedFilterDaycare}
                        filterDate={filterDate}
                        onDateChange={setFilterDate}
                        onToggleAllArchived={handleToggleAllArchived}
                        onToggleArchivedStudent={handleToggleArchivedStudent}
                        onOpenDetail={openDetailDialog}
                        onOpenRestore={openRestoreDialog}
                        onPermanentDelete={handlePermanentDelete}
                        onBulkRestore={openBulkRestoreDialog}
                        onBulkDelete={handleBulkPermanentDelete}
                        open={false}
                    />
                </Dialog>

                <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                    <ArchiveStudentDialog
                        student={archivingStudent}
                        archiveStatus={archiveStatus}
                        onArchiveStatusChange={setArchiveStatus}
                        archiveReason={archiveReason}
                        onArchiveReasonChange={setArchiveReason}
                        onConfirm={handleArchive}
                        onCancel={() => setIsArchiveDialogOpen(false)}
                    />
                </Dialog>
                <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
                    <RestoreStudentDialog
                        student={restoringStudent}
                        restoreStatus={restoreStatus}
                        onRestoreStatusChange={setRestoreStatus}
                        onConfirm={handleRestore}
                        onCancel={() => setIsRestoreDialogOpen(false)}
                    />
                </Dialog>
                <Dialog open={isBulkArchiveDialogOpen} onOpenChange={setIsBulkArchiveDialogOpen}>
                    <BulkArchiveDialog
                        selectedStudents={students.filter((s) => selectedStudents.has(s.id))}
                        bulkArchiveStatus={bulkArchiveStatus}
                        onArchiveStatusChange={setBulkArchiveStatus}
                        bulkArchiveReason={bulkArchiveReason}
                        onArchiveReasonChange={setBulkArchiveReason}
                        onConfirm={handleBulkArchive}
                        onCancel={() => setIsBulkArchiveDialogOpen(false)}
                    />
                </Dialog>
                <Dialog open={isBulkRestoreDialogOpen} onOpenChange={setIsBulkRestoreDialogOpen}>
                    <BulkRestoreDialog
                        selectedArchivedStudents={archivedStudents.filter((s) => selectedArchivedStudents.has(s.id))}
                        bulkRestoreStatus={bulkRestoreStatus}
                        onRestoreStatusChange={setBulkRestoreStatus}
                        onConfirm={handleBulkRestore}
                        onCancel={() => setIsBulkRestoreDialogOpen(false)}
                    />
                </Dialog>
            </div>
        </AppLayout>
    );
}
