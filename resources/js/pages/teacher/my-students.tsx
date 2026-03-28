import AppLayout from '@/layouts/app-layout';
import { Assessment as InertiaAssessment, Child as InertiaChild, User as InertiaUser } from '@/types';
import { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// --- Logic Imports ---
import { ArchiveStudentDialog } from '@/components/shared/archive-student-dialog';
import { AddEditStudentDialog } from '@/components/teacher/add-edit-student-dialog';
import { NewAssessmentDialog } from '@/components/teacher/new-assessment-dialog';
import { ViewStudentDialog } from '@/components/teacher/view-student-dialog';
import { Dialog } from '@/components/ui/dialog';

// --- UI Imports ---
import { ArchivedStudentsDialog } from '@/components/shared/archived-students-dialog';
import { StudentListView } from '@/components/shared/student-list-view';

// 🚀 FIXED: Unified single Student Interface
export interface Student {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    age: number;
    date_of_birth?: string;
    status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred' | 'Completed';
    assessmentStatus: 'Completed' | 'In Progress' | 'Draft' | 'Not Started';
    lastAssessment: string;
    score?: number;
    parentName: string;
    parentEmail: string;
    archived: boolean;
    archivedDate?: string;
    archiveReason?: string | null;
    daycare: string;
    canGraduate?: boolean;
    section_id?: number | null;
    section_name?: string;
    created_at?: string;
    [key: string]: any;
}

interface TeacherStudentPageProps extends PageProps {
    auth: { user: InertiaUser };
    daycareName: string;
    students: InertiaChild[];
    assessments: InertiaAssessment[];
    domains: { id: number; name: string }[];
    sections: { id: number; name: string }[];
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

const formatDateForDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatAgeWithMonths = (dobString?: string) => {
    if (!dobString) return '-';
    const dob = new Date(dobString);
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
        years--;
        months += 12;
    }
    if (today.getDate() < dob.getDate()) months--;
    if (months < 0) {
        months += 12;
        years--;
    }

    return `${years}y ${months}m`;
};

export default function TeacherStudentsPage() {
    const { auth, daycareName, students: rawStudents, assessments, domains, sections } = usePage<TeacherStudentPageProps>().props;

    // --- DATA TRANSFORMATION ---
    const transformStudents = (raw: InertiaChild[], assess: InertiaAssessment[]): Student[] => {
        if (!raw) return [];
        return raw.map((student) => {
            const studentAssessments = (assess || []).filter((a) => a.student_id === student.id);

            // 1. Sort them safely (newest first)
            const sortedAssessments = [...studentAssessments].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // 2. Define both variables so TypeScript is happy!
            const latestAssessment = sortedAssessments[0];
            const latestCompleted = sortedAssessments.find(a => a.status === 'Completed');

            const parent = student.parents?.[0];
            const isArchived = !!student.deleted_at;
            const studentSection = sections?.find((s) => s.id === student.section_id);
            const completedCount = studentAssessments.filter((a) => a.status === 'Completed').length;
            const currentAge = calculateAge(student.date_of_birth);

            const isAcademicComplete = completedCount >= 3;
            const isOldEnough = currentAge >= 4;
            const meetsGraduationRules = isAcademicComplete && isOldEnough;

            let finalStatus = student.status as string;

            if (!isArchived && isAcademicComplete && !isOldEnough) {
                finalStatus = 'Active';
            } else if (meetsGraduationRules && !isArchived) {
                finalStatus = 'Completed';
            }

            let assessStatus: Student['assessmentStatus'] = 'Not Started';
            if (latestAssessment) assessStatus = latestAssessment.status as Student['assessmentStatus'];

            return {
                ...student,
                id: student.id,
                firstName: student.first_name,
                middleName: student.middle_name || '',
                lastName: student.last_name,
                age: calculateAge(student.date_of_birth),
                dateOfBirth: student.date_of_birth,
                status: finalStatus as Student['status'],
                assessmentStatus: assessStatus,
                lastAssessment: latestAssessment?.assessment_date ? new Date(latestAssessment.assessment_date).toLocaleDateString() : 'N/A',

                // 3. The Ultimate Score Fix!
                score: latestAssessment?.overall_score ?? latestAssessment?.sum_of_scaled ?? undefined,

                parentName: parent ? [parent.first_name, parent.last_name].join(' ') : 'Not Linked',
                parentEmail: parent?.email || 'N/A',
                archived: isArchived,
                archivedDate: student.deleted_at ? formatDateForDisplay(student.deleted_at) : undefined,
                archiveReason: student.notes || student.archive_reason || null,
                daycare: daycareName,
                section_id: student.section_id,
                canGraduate: meetsGraduationRules,
                section_name: studentSection ? studentSection.name : undefined,
                created_at: student.created_at,
            };
        });
    };

    const [allStudents, setAllStudents] = useState<Student[]>(() => transformStudents(rawStudents, assessments));

    // --- STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());

    // Dialog States
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [archivingStudent, setArchivingStudent] = useState<Student | null>(null);
    const [archiveStatus, setArchiveStatus] = useState('');
    const [archiveReason, setArchiveReason] = useState('');
    const [isViewStudentOpen, setIsViewStudentOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isArchivedListOpen, setIsArchivedListOpen] = useState(false);
    const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Filter Logic ---
    const studentsList = useMemo(() => allStudents.filter((s) => !s.archived), [allStudents]);
    const archivedStudentsList = useMemo(() => allStudents.filter((s) => s.archived), [allStudents]);

    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [assessmentFilter, setAssessmentFilter] = useState<string>('all');

    const filteredStudents = useMemo(() => {
        let result = studentsList;

        if (statusFilter !== 'all') result = result.filter((s) => s.status === statusFilter);

        if (sectionFilter !== 'all') {
            if (sectionFilter === 'unassigned') result = result.filter((s) => !s.section_name);
            else result = result.filter((s) => s.section_name === sectionFilter);
        }

        if (assessmentFilter !== 'all') result = result.filter((s) => s.assessmentStatus === assessmentFilter);

        if (searchQuery) {
            const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
            result = result.filter((s) => {
                const first = (s.firstName || '').toLowerCase();
                const middle = (s.middleName || '').toLowerCase();
                const last = (s.lastName || '').toLowerCase();
                return searchTerms.every((term) => first.startsWith(term) || last.startsWith(term) || middle.startsWith(term));
            });
        }

        // 🚀 FIX: Smart Sorting Logic
        return result.sort((a, b) => {
            // Priority 1: Bring Draft & In Progress assessments to the very top
            const aNeedsAttention = a.assessmentStatus === 'In Progress' || a.assessmentStatus === 'Draft' ? 1 : 0;
            const bNeedsAttention = b.assessmentStatus === 'In Progress' || b.assessmentStatus === 'Draft' ? 1 : 0;

            if (aNeedsAttention !== bNeedsAttention) {
                return bNeedsAttention - aNeedsAttention; // Put the '1's before the '0's
            }

            // Priority 2: Sort by Newest Added (Highest ID comes first)
            return b.id - a.id;
        });
    }, [studentsList, searchQuery, statusFilter, sectionFilter, assessmentFilter]);

    // --- MISSING PAGINATION & SECTION LOGIC ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStudents, currentPage]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const availableSections = useMemo(() => {
        const uniqueSections = allStudents.map((s) => s.section_name).filter(Boolean) as string[];
        return Array.from(new Set(uniqueSections)).sort();
    }, [allStudents]);

    useEffect(() => {
        setAllStudents(transformStudents(rawStudents, assessments));
    }, [rawStudents, assessments]);

    useEffect(() => {
        // @ts-ignore
        if (window.Echo) {
            window.Echo.channel('students').listen('StudentUpdated', () => router.reload({ only: ['students'] }));
        }
        return () => {
            // @ts-ignore
            if (window.Echo) window.Echo.leave('students');
        };
    }, []);

    // --- HANDLERS ---
    const handleToggleStudent = (id: number) => {
        setSelectedStudents((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleToggleAll = () => {
        selectedStudents.size === filteredStudents.length
            ? setSelectedStudents(new Set())
            : setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
    };

    const handleRestore = (student: Student) => {
        if (confirm(`Are you sure you want to restore ${student.firstName} to the active roster?`)) {
            router.post(
                route('teacher.students.restore', student.id),
                { status: 'Active' },
                { preserveState: true, preserveScroll: true, onSuccess: () => toast.success(`${student.firstName} has been restored!`) },
            );
        }
    };

    const handleBulkRestore = (ids: number[]) => {
        if (confirm(`Are you sure you want to restore ${ids.length} students to the active roster?`)) {
            router.post(
                route('teacher.students.bulk-restore'),
                { ids, status: 'Active' },
                { preserveState: true, preserveScroll: true, onSuccess: () => toast.success(`${ids.length} students restored!`) },
            );
        }
    };

    const handleGraduate = (student: Student) => {
        if (confirm(`Are you sure you want to officially graduate ${student.firstName}?`)) {
            router.post(
                route('teacher.students.archive', student.id),
                { status: 'Graduated', reason: 'Completed ECCD Curriculum' },
                { preserveState: true, preserveScroll: true, onSuccess: () => toast.success(`${student.firstName} has officially graduated! 🎓`) },
            );
        }
    };

    const handleSaveStudent = (data: any) => {
        const routeName = editingStudent ? 'teacher.students.update' : 'teacher.students.store';
        const method = editingStudent ? 'patch' : 'post';
        // @ts-ignore
        router[method](route(routeName, editingStudent?.id), data, {
            onSuccess: () => {
                setIsAddEditOpen(false);
                toast.success('Saved');
            },
            onError: () => toast.error('Failed'),
        });
    };

    const handleArchiveClick = (student: Student) => {
        setArchivingStudent(student);
        setArchiveStatus('');
        setArchiveReason('');
        setIsArchiveDialogOpen(true);
    };

    const handleBulkArchiveClick = () => {
        setArchivingStudent(null);
        setArchiveStatus('');
        setArchiveReason('');
        setIsArchiveDialogOpen(true);
    };

    const handleArchiveConfirm = () => {
        const items =
            selectedStudents.size > 0
                ? Array.from(selectedStudents).map((id) => ({ id, status: archiveStatus }))
                : [{ id: archivingStudent!.id, status: archiveStatus }];

        const endpoint = selectedStudents.size > 0 ? 'teacher.students.bulk-archive' : 'teacher.students.archive';
        const payload = selectedStudents.size > 0 ? { items, reason: archiveReason } : { status: archiveStatus, reason: archiveReason };
        const idParam = selectedStudents.size > 0 ? undefined : archivingStudent!.id;

        // @ts-ignore
        router.post(route(endpoint, idParam), payload, {
            onSuccess: () => {
                setIsArchiveDialogOpen(false);
                setSelectedStudents(new Set());
                toast.success('Archived');
            },
        });
    };

    const handleCreateAssessment = (payload: { student_id: number; assessment_type: string }[], domainIds: number[]) => {
        setIsSubmitting(true);
        router.post(
            route('teacher.assessments.bulk-store'),
            { assessments: payload, domain_ids: domainIds },
            {
                onSuccess: () => {
                    toast.success(`${payload.length} draft(s) created successfully!`);
                    setIsAddAssessmentOpen(false);
                    router.reload({ only: ['students', 'assessments'] });
                },
                onError: () => toast.error('Failed to create drafts.'),
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleNewAssessmentTrigger = (id?: number) => {
        if (id) {
            const student = allStudents.find((s) => s.id === id);
            if (student?.status === 'Completed' || student?.status === 'Graduated' || student?.canGraduate) {
                toast.error('Cannot assess a student who has completed the curriculum.');
                return;
            }
            setIsViewStudentOpen(false);
            router.get(route('teacher.assessments.create', { student_id: id }));
        } else {
            setIsAddAssessmentOpen(true);
        }
    };

    const dropdownStudents = useMemo(() => {
        return studentsList
            .map((s) => {
                const history = (assessments || []).filter((a) => a.student_id === s.id);
                const hasActiveDraft = history.some((a) => a.status === 'Draft' || a.status === 'In Progress');
                const completedCount = history.filter((a) => a.status === 'Completed').length;
                const isProgramCompleted = s.status === 'Completed' || s.status === 'Graduated' || s.canGraduate;
                const isFullyCompleted = completedCount >= 3 || isProgramCompleted;

                let statusLabel = '';
                let isDisabled = false;

                if (isFullyCompleted) {
                    statusLabel = '- Curriculum Completed';
                    isDisabled = true;
                } else if (hasActiveDraft) {
                    statusLabel = '- Has Active Draft';
                    isDisabled = true;
                }

                return {
                    id: s.id,
                    name: `${s.firstName} ${s.lastName}`,
                    age: s.age,
                    isDisabled,
                    statusLabel,
                    sortWeight: isDisabled ? 1 : 0,
                };
            })
            .sort((a, b) => {
                if (a.sortWeight !== b.sortWeight) return a.sortWeight - b.sortWeight;
                return a.name.localeCompare(b.name);
            });
    }, [studentsList, assessments]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/teacher/dashboard' },
                { title: 'My Students', href: '/teacher/my-students' },
            ]}
        >
            <Head title="My Students" />
            <div className="p-4 sm:p-6 lg:p-8">
                <StudentListView
                    role="teacher"
                    paginatedStudents={paginatedData} // Change from `paginatedStudents` to `paginatedData` which is defined in your page
                    filteredStudents={filteredStudents}
                    selectedStudents={selectedStudents}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    searchQuery={searchQuery}
                    itemsPerPage={itemsPerPage} // Change from ITEMS_PER_PAGE to itemsPerPage
                    sectionList={availableSections}
                    filterSection={sectionFilter}
                    filterStatus={statusFilter}
                    filterAssessment={assessmentFilter}
                    onSearchChange={setSearchQuery}
                    onSectionChange={setSectionFilter}
                    onStatusChange={setStatusFilter}
                    onAssessmentChange={setAssessmentFilter}
                    onClearFilters={() => {
                        setSearchQuery('');
                        setSectionFilter('all');
                        setStatusFilter('all');
                        setAssessmentFilter('all');
                        setCurrentPage(1);
                    }}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        setSelectedStudents(new Set());
                    }}
                    onToggleAll={handleToggleAll}
                    onToggleStudent={handleToggleStudent}
                    onCancelSelection={() => setSelectedStudents(new Set())}
                    onOpenArchived={() => setIsArchivedListOpen(true)}
                    onOpenBulkArchive={handleBulkArchiveClick}
                    onExport={() => (window.location.href = route('teacher.students.export'))}
                    onNewAssessment={handleNewAssessmentTrigger}
                    onConsolidatedReport={() => router.visit(route('teacher.reports.consolidated'))}
                    onAnalysisReport={() => router.visit(route('teacher.reports.analysis'))}
                    onOpenDetail={(s) => {
                        setSelectedStudent(s);
                        setIsViewStudentOpen(true);
                    }}
                    onOpenEdit={(s) => {
                        setEditingStudent(s);
                        setIsAddEditOpen(true);
                    }}
                    onOpenArchive={handleArchiveClick}
                    onGraduate={handleGraduate}
                    // FIX: Renamed from onGrades to onProgressReport to match the component props
                    onProgressReport={(s) => router.visit(route('teacher.reports.student', s.id))}
                />
            </div>
            <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                <ArchiveStudentDialog
                    student={archivingStudent}
                    archiveStatus={archiveStatus}
                    onArchiveStatusChange={setArchiveStatus}
                    archiveReason={archiveReason}
                    onArchiveReasonChange={setArchiveReason}
                    onConfirm={handleArchiveConfirm}
                    onCancel={() => setIsArchiveDialogOpen(false)}
                    // Teachers use Bulk, so we pass these two props:
                    isBulk={selectedStudents.size > 0}
                    selectedStudents={Array.from(selectedStudents)
                        .map((id) => allStudents.find((s) => s.id === id)!)
                        .filter(Boolean)}
                />
            </Dialog>
            <ViewStudentDialog
                open={isViewStudentOpen}
                onOpenChange={setIsViewStudentOpen}
                student={selectedStudent}
                daycareName={daycareName}
                onStartAssessment={() => handleNewAssessmentTrigger(selectedStudent?.id)}
                isArchived={selectedStudent?.archived}
            />
            {isAddEditOpen && (
                <AddEditStudentDialog
                    open={isAddEditOpen}
                    onOpenChange={setIsAddEditOpen}
                    student={editingStudent}
                    onStudentChange={setEditingStudent}
                    onSave={handleSaveStudent}
                    currentDaycare={daycareName}
                    sections={sections}
                />
            )}
            <NewAssessmentDialog
                open={isAddAssessmentOpen}
                onOpenChange={setIsAddAssessmentOpen}
                students={dropdownStudents}
                domains={domains}
                assessments={assessments}
                onSave={handleCreateAssessment}
                isSubmitting={isSubmitting}
            />
            <ArchivedStudentsDialog
                open={isArchivedListOpen}
                onOpenChange={setIsArchivedListOpen}
                archivedStudents={archivedStudentsList}
                onOpenDetail={(student) => {
                    setSelectedStudent(student);
                    setIsViewStudentOpen(true);
                }}
                onRestore={handleRestore}
                onBulkRestore={handleBulkRestore}
                onPrintReport={(student) => window.open(route('teacher.students.consolidated-report', student.id), '_blank')}            // Notice: We do NOT pass daycareList or onDelete. The component protects itself!
            />
        </AppLayout>
    );
}
