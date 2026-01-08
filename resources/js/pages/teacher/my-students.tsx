import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Assessment as InertiaAssessment, Child as InertiaChild, User as InertiaUser } from '@/types';
import { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// --- Components ---
import { ArchiveStudentDialog } from '@/components/teacher/archive-student-dialog';
import { AddEditStudentDialog } from '@/components/teacher/add-edit-student-dialog';
import { ImportStudentsDialog } from '@/components/teacher/import-students-dialog';
import { NewAssessmentDialog } from '@/components/teacher/new-assessment-dialog';
import { RestoreStudentDialog } from '@/components/teacher/restore-student-dialog';
import { TeacherArchivedStudentsDialog } from '@/components/teacher/teacher-archived-student-dialog';
import { TeacherStudentList } from '@/components/teacher/teacher-student-list';
import { ViewStudentDialog } from '@/components/teacher/view-student-dialog';
import { Dialog } from '@/components/ui/dialog';

// --- Shared Types ---
export interface Student {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    age: number;
    status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
    assessmentStatus: 'Completed' | 'In Progress' | 'Draft' | 'Not Started';
    lastAssessment: string;
    score?: number;
    parentName: string;
    parentEmail: string;
    archived: boolean;
    archivedDate?: string;
    archiveReason?: string | null;
    daycare: string;
    accessCode?: string | null;
    [key: string]: any;
}

interface TeacherStudentPageProps extends PageProps {
    auth: { user: InertiaUser };
    daycareName: string;
    students: InertiaChild[];
    assessments: InertiaAssessment[];
    [key: string]: any;
}

// --- Helpers ---
const calculateAge = (birthdate: string) => {
    if (!birthdate) return 0;
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
};

const formatName = (person: { first_name: string; middle_name?: string | null; last_name: string }) => {
    return [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ');
};

const formatDateForDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/teacher/dashboard' },
    { title: 'My Students', href: '/teacher/my-students' },
];

export default function TeacherStudentsPage() {
    // 1. Get Server Data
    const { auth, daycareName, students: rawStudents, assessments } = usePage<TeacherStudentPageProps>().props;

    // 2. Data Transformation
    const transformStudents = (raw: InertiaChild[], assess: InertiaAssessment[]): Student[] => {
        if (!raw) return [];
        return raw.map((student) => {
            const studentAssessments = (assess || []).filter((a) => a.student_id === student.id);
            const latestAssessment = studentAssessments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            const parent = student.parents?.[0];
            const isArchived = !!student.deleted_at;

            let enrollmentStatus = (student.status as any) || 'Active';
            if (isArchived && enrollmentStatus === 'Active') enrollmentStatus = 'Inactive';
            let assessStatus: Student['assessmentStatus'] = 'Not Started';
            if (latestAssessment) assessStatus = latestAssessment.status as Student['assessmentStatus'];

            return {
                ...student,
                id: student.id,
                firstName: student.first_name,
                middleName: student.middle_name || '',
                lastName: student.last_name,
                age: calculateAge(student.date_of_birth),
                status: enrollmentStatus,
                assessmentStatus: assessStatus,
                lastAssessment: latestAssessment?.assessment_date ? new Date(latestAssessment.assessment_date).toLocaleDateString() : 'N/A',
                score: latestAssessment?.overall_score || undefined,
                parentName: parent ? formatName(parent) : 'Not Linked',
                parentEmail: parent?.email || 'N/A',
                archived: isArchived,
                archivedDate: student.deleted_at ? formatDateForDisplay(student.deleted_at) : undefined,
                archiveReason: student.archive_reason || student.notes || null,
                daycare: daycareName,
                accessCode: student.access_code,
            };
        });
    };

    // 3. Local State (Optimistic UI & Real-Time)
    const [allStudents, setAllStudents] = useState<Student[]>(() => transformStudents(rawStudents, assessments));

    useEffect(() => {
        setAllStudents(transformStudents(rawStudents, assessments));
    }, [rawStudents, assessments]);

    // REAL-TIME LISTENER
    useEffect(() => {
        // @ts-ignore
        if (window.Echo) {
            // @ts-ignore
            window.Echo.channel('students').listen('StudentUpdated', (e: any) => {
                setAllStudents((prev) => {
                    if (e.action === 'archive' || e.action === 'delete') {
                        return prev.map((s) =>
                            s.id === e.id
                                ? { ...s, archived: true, status: 'Inactive', archivedDate: formatDateForDisplay(new Date().toISOString()) }
                                : s,
                        );
                    }
                    if (e.action === 'restore') {
                        return prev.map((s) => (s.id === e.id ? { ...s, archived: false, status: 'Active', archivedDate: undefined } : s));
                    }
                    if (e.action === 'update') {
                        return prev.map((s) => (s.id === e.id ? { ...s, ...e } : s));
                    }
                    if (e.action === 'create') {
                        router.reload({ only: ['students'] });
                        return prev;
                    }
                    return prev;
                });
            });
        }
        return () => {
            // @ts-ignore
            if (window.Echo) window.Echo.leave('students');
        };
    }, []);

    // 4. Filtering Logic
    const [searchQuery, setSearchQuery] = useState('');
    const [archivedSearchQuery, setArchivedSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState<string>('all');

    const studentsList = useMemo(() => allStudents.filter((s) => !s.archived), [allStudents]);
    const archivedStudentsList = useMemo(() => {
        return allStudents.filter((s) => s.archived && (filterDate === 'all' || s.archivedDate === filterDate));
    }, [allStudents, filterDate]);

    const filteredStudents = useMemo(
        () =>
            studentsList.filter((student) => {
                const fullName = `${student.firstName} ${student.middleName} ${student.lastName}`.trim().toLowerCase();
                return (
                    fullName.includes(searchQuery.toLowerCase()) ||
                    student.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    student.parentEmail.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }),
        [studentsList, searchQuery],
    );

    // 5. UI State
    const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isViewStudentOpen, setIsViewStudentOpen] = useState(false);

    // Add/Edit Dialog State
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [isArchivedListOpen, setIsArchivedListOpen] = useState(false);
    const [selectedArchivedStudents, setSelectedArchivedStudents] = useState<Set<number>>(new Set());

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [archivingStudent, setArchivingStudent] = useState<Student | null>(null);
    const [archiveStatus, setArchiveStatus] = useState('');
    const [archiveReason, setArchiveReason] = useState('');

    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
    const [restoringStudent, setRestoringStudent] = useState<Student | null>(null);
    const [isImportOpen, setIsImportOpen] = useState(false);

    // --- HANDLERS ---

    const handleExport = () => {
        if (studentsList.length === 0) {
            toast.error('No students to export.');
            return;
        }
        const headers = ['ID', 'First Name', 'Middle Name', 'Last Name', 'Age', 'Status', 'Parent Name', 'Email', 'Access Code'];
        const rows = studentsList.map((s) => [
            s.id,
            s.firstName,
            s.middleName,
            s.lastName,
            s.age,
            s.status,
            s.parentName,
            s.parentEmail,
            s.accessCode || '',
        ]);
        const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('Export downloaded.');
    };

    const handleAddStudent = () => {
        setEditingStudent(null);
        setIsAddEditOpen(true);
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudent(student);
        setIsAddEditOpen(true);
    };

    const handleSaveStudent = (childFormData: any) => {
        // 1. Validation (Frontend)
        if (!childFormData.firstName || !childFormData.lastName || !childFormData.dateOfBirth) {
            toast.error('Please fill in required fields (*)');
            return;
        }

        const endpoint = editingStudent ? route('teacher.students.update', editingStudent.id) : route('teacher.students.store');

        const method = editingStudent ? 'patch' : 'post';

        // 2. Map camelCase (Frontend) to snake_case (Backend)
        const apiData = {
            first_name: childFormData.firstName,
            middle_name: childFormData.middleName,
            last_name: childFormData.lastName,
            nickname: childFormData.nickname,
            date_of_birth: childFormData.dateOfBirth,
            gender: childFormData.gender,
            special_needs: childFormData.special_needs,
            notes: childFormData.notes,
        };

        // @ts-ignore
        router[method](endpoint, apiData, {
            onSuccess: () => {
                setIsAddEditOpen(false);
                setEditingStudent(null); // Reset editing state
                toast.success(editingStudent ? 'Student updated successfully' : 'Student added successfully');
            },
            onError: (err: any) => {
                toast.error('Failed to save student. Please check input.');
                console.error(err);
            },
        });
    };

    const handleArchiveConfirm = (individualStatuses?: Record<number, string>) => {
        const today = formatDateForDisplay(new Date().toISOString());
        if (selectedStudents.size > 0) {
            const items = Array.from(selectedStudents).map((id) => ({ id, status: individualStatuses?.[id] || archiveStatus }));
            setAllStudents((prev) =>
                prev.map((s) =>
                    selectedStudents.has(s.id)
                        ? { ...s, archived: true, status: (individualStatuses?.[s.id] || archiveStatus) as any, archivedDate: today }
                        : s,
                ),
            );
            setIsArchiveDialogOpen(false);
            setSelectedStudents(new Set());
            toast.success(`${items.length} students archived`);
            router.post(route('teacher.students.bulk-archive'), { items, reason: archiveReason }, { onError: () => router.reload() });
        } else if (archivingStudent) {
            const tempId = archivingStudent.id;
            setAllStudents((prev) =>
                prev.map((s) => (s.id === tempId ? { ...s, archived: true, status: archiveStatus as any, archivedDate: today } : s)),
            );
            setIsArchiveDialogOpen(false);
            toast.success('Student archived');
            router.post(
                route('teacher.students.archive', tempId),
                { status: archiveStatus, reason: archiveReason },
                { onError: () => router.reload() },
            );
        }
    };

    const handleConfirmRestore = () => {
        if (!restoringStudent) return;
        const tempId = restoringStudent.id;
        setAllStudents((prev) => prev.map((s) => (s.id === tempId ? { ...s, archived: false, status: 'Active', archivedDate: undefined } : s)));
        setIsRestoreDialogOpen(false);
        if (selectedStudent?.id === tempId) setIsViewStudentOpen(false);
        toast.success('Student restored');
        router.post(route('teacher.students.restore', tempId), { status: 'Active' }, { onError: () => router.reload() });
    };

    const handleBulkRestore = () => {
        if (selectedArchivedStudents.size === 0) return;
        const ids = Array.from(selectedArchivedStudents);
        setAllStudents((prev) => prev.map((s) => (ids.includes(s.id) ? { ...s, archived: false, status: 'Active', archivedDate: undefined } : s)));
        setSelectedArchivedStudents(new Set());
        toast.success('Students restored');
        router.post(route('teacher.students.bulk-restore'), { ids, status: 'Active' }, { onError: () => router.reload() });
    };

    const handleCreateAssessment = (studentId: string, assessmentType: string) => {
        setIsSubmitting(true);
        router.post(
            route('teacher.assessments.store'),
            { student_id: studentId, assessment_type: assessmentType },
            {
                onSuccess: () => {
                    toast.success('New assessment created!');
                    setIsAddAssessmentOpen(false);
                    router.visit(route('teacher.assessment-management'));
                },
                onError: () => toast.error('Failed to create assessment.'),
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleToggleStudent = (id: number) => {
        setSelectedStudents((p) => {
            const n = new Set(p);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };
    const handleToggleAll = () => {
        setSelectedStudents(selectedStudents.size === filteredStudents.length ? new Set() : new Set(filteredStudents.map((s) => s.id)));
    };
    const handleToggleArchivedStudent = (id: number) => {
        setSelectedArchivedStudents((p) => {
            const n = new Set(p);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };
    const handleToggleAllArchived = () => {
        setSelectedArchivedStudents(
            selectedArchivedStudents.size === archivedStudentsList.length ? new Set() : new Set(archivedStudentsList.map((s) => s.id)),
        );
    };

    const handleViewStudent = (student: Student) => {
        setSelectedStudent(student);
        setIsViewStudentOpen(true);
    };
    const handleRestoreClick = (student: Student) => {
        setRestoringStudent(student);
        setIsRestoreDialogOpen(true);
    };
    const openArchiveDialog = (student: Student) => {
        setArchivingStudent(student);
        setArchiveStatus('');
        setArchiveReason('');
        setSelectedStudents(new Set());
        setIsArchiveDialogOpen(true);
    };
    const handleBulkArchiveClick = () => {
        if (selectedStudents.size === 0) return;
        setArchivingStudent(null);
        setArchiveStatus('');
        setArchiveReason('');
        setIsArchiveDialogOpen(true);
    };
    const handlePermanentDeleteBlock = () => {
        toast.error('Teachers cannot permanently delete records. Please contact an admin.');
    };
    const selectedStudentObjects = useMemo(() => studentsList.filter((s) => selectedStudents.has(s.id)), [studentsList, selectedStudents]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Students" />
            <div className="p-4 sm:p-6 lg:p-8">
                <TeacherStudentList
                    students={filteredStudents}
                    daycareName={daycareName}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onNewAssessment={() => setIsAddAssessmentOpen(true)}
                    // Handlers
                    onExportData={handleExport}
                    onAddStudent={handleAddStudent}
                    onBulkImport={() => setIsImportOpen(true)}
                    onViewStudent={handleViewStudent}
                    onEditStudent={handleEditStudent}
                    onArchiveStudent={openArchiveDialog}
                    onOpenArchivedList={() => setIsArchivedListOpen(true)}
                    selectedStudents={selectedStudents}
                    onToggleStudent={handleToggleStudent}
                    onToggleAll={handleToggleAll}
                    onBulkArchive={handleBulkArchiveClick}
                />
            </div>

            <ViewStudentDialog
                open={isViewStudentOpen}
                onOpenChange={setIsViewStudentOpen}
                student={selectedStudent}
                daycareName={daycareName}
                onStartAssessment={() => {
                    setIsViewStudentOpen(false);
                    setIsAddAssessmentOpen(true);
                }}
            />

            {isAddEditOpen && (
                <AddEditStudentDialog
                    open={isAddEditOpen}
                    onOpenChange={setIsAddEditOpen}
                    student={editingStudent}
                    onStudentChange={setEditingStudent}
                    onSave={handleSaveStudent}
                    currentDaycare={daycareName}
                />
            )}

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <ImportStudentsDialog
                    onClose={() => setIsImportOpen(false)}
                    currentDaycare={daycareName}
                />
            </Dialog>

            <NewAssessmentDialog
                open={isAddAssessmentOpen}
                onOpenChange={setIsAddAssessmentOpen}
                students={studentsList.map((student) => ({
                    id: student.id,
                    name: `${student.firstName} ${student.middleName} ${student.lastName}`.replace(/\s+/g, ' ').trim(),
                    age: student.age,
                    isDisabled: ['Draft', 'In Progress'].includes(student.assessmentStatus),
                }))}
                onSave={handleCreateAssessment}
                isSubmitting={isSubmitting}
            />
            <RestoreStudentDialog
                open={isRestoreDialogOpen}
                onOpenChange={setIsRestoreDialogOpen}
                student={restoringStudent}
                onConfirm={handleConfirmRestore}
            />
            <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                <ArchiveStudentDialog
                    student={archivingStudent}
                    archiveStatus={archiveStatus}
                    onArchiveStatusChange={setArchiveStatus}
                    archiveReason={archiveReason}
                    onArchiveReasonChange={setArchiveReason}
                    onConfirm={handleArchiveConfirm}
                    onCancel={() => setIsArchiveDialogOpen(false)}
                    isBulk={selectedStudents.size > 0}
                    selectedStudents={selectedStudentObjects}
                />
            </Dialog>
            <Dialog
                open={isArchivedListOpen}
                onOpenChange={(open) => {
                    setIsArchivedListOpen(open);
                    if (!open) setSelectedArchivedStudents(new Set());
                }}
            >
                <TeacherArchivedStudentsDialog
                    onOpenChange={setIsArchivedListOpen}
                    archivedStudents={archivedStudentsList}
                    selectedArchivedStudents={selectedArchivedStudents}
                    filterDate={filterDate}
                    searchQuery={archivedSearchQuery}
                    onSearchChange={setArchivedSearchQuery}
                    onDateChange={setFilterDate}
                    onToggleAllArchived={handleToggleAllArchived}
                    onToggleArchivedStudent={handleToggleArchivedStudent}
                    onOpenDetail={handleViewStudent}
                    onOpenRestore={handleRestoreClick}
                    onBulkRestore={handleBulkRestore}
                    onPermanentDelete={handlePermanentDeleteBlock}
                    onBulkDelete={handlePermanentDeleteBlock}
                />
            </Dialog>
        </AppLayout>
    );
}
