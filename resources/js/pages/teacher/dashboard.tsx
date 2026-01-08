import { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { PageProps } from '@inertiajs/core';
import { TeacherDashboardOverview } from '@/components/teacher/teacher-dashboard-overview';
import { NewAssessmentDialog } from '@/components/teacher/new-assessment-dialog';

import type { User as InertiaUser, Daycare as InertiaDaycare, Child as InertiaChild, Assessment as InertiaAssessment, BreadcrumbItem } from '@/types';

export interface Student {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    age: number;
    status: "Completed" | "In Progress" | "Draft" | "Not Started";
    lastAssessment: string;
    score?: number;
    nextDue?: string;
    parentName: string;
    parentEmail: string;
}

interface TeacherDashboardPageProps extends PageProps {
    auth: { user: InertiaUser };
    daycare: InertiaDaycare;
    students: InertiaChild[];
    assessments: InertiaAssessment[];
    daycareUsers: InertiaUser[];
}

const calculateAge = (birthdate: string) => {
    if (!birthdate) return 0;
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/teacher/dashboard' }];

export default function TeacherDashboard() {
    const {
        auth,
        daycare,
        students: rawStudents,
        assessments,
    } = usePage<TeacherDashboardPageProps>().props;

    const user = auth.user;

    // --- State for Modal ---
    const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 1. POLLING LOGIC ---
    useEffect(() => {
        const refreshData = () => {
            if (document.hidden) return;

            router.reload({
                only: ['students', 'assessments'],
            });
        };

        const interval = setInterval(refreshData, 30000); // 30 seconds
        return () => clearInterval(interval);
    }, []);

    // --- 2. DATA TRANSFORMATION ---
    const studentsList: Student[] = useMemo(() => {
        if (!rawStudents) return [];
        return rawStudents.map((student) => {
            const studentAssessments = (assessments || []).filter((a) => a.student_id === student.id);
            const latestAssessment = studentAssessments.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            const parent = student.parents?.[0];

            return {
                id: student.id,
                firstName: student.first_name,
                middleName: student.middle_name || "",
                lastName: student.last_name,
                age: calculateAge(student.date_of_birth),
                status: (latestAssessment?.status as any) || "Not Started",
                lastAssessment: latestAssessment?.assessment_date ? new Date(latestAssessment.assessment_date).toLocaleDateString() : "Not Started",

                score: latestAssessment?.overall_score
                    ? Number(latestAssessment.overall_score)
                    : undefined,

                nextDue: "N/A",
                parentName: parent ? `${parent.first_name} ${parent.last_name}` : "Not Linked",
                parentEmail: parent?.email || "N/A",
            };
        });
    }, [rawStudents, assessments]);

    const dropdownStudents = useMemo(() => {
        return studentsList.map(s => ({
            id: s.id,
            name: `${s.firstName} ${s.middleName} ${s.lastName}`.replace(/\s+/g, ' ').trim(),
            age: s.age,
            // Disable if they already have an active assessment
            isDisabled: ['Draft', 'In Progress'].includes(s.status)
        }));
    }, [studentsList]);

    // --- 3. STATS CALCULATION ---
    const dashboardStats = useMemo(() => {
        const total = studentsList.length;
        const completed = studentsList.filter(s => s.status === 'Completed').length;
        const due = total - completed;

        const scores = studentsList
            .map(s => s.score)
            .filter((s): s is number => typeof s === 'number' && !isNaN(s) && s > 0);

        const avg = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

        return {
            totalStudents: total,
            completedAssessments: completed,
            assessmentsDue: due,
            classAverage: Math.round(avg * 10) / 10
        };
    }, [studentsList]);

    // --- 4. HANDLERS ---
    const onNewAssessment = () => setIsAddAssessmentOpen(true);

    const handleCreateAssessment = (studentId: string, assessmentType: string) => {
        setIsSubmitting(true);
        router.post(
            route('teacher.assessments.store'),
            {
                student_id: studentId,
                assessment_type: assessmentType,
            },
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

    const onViewStudents = () => router.visit(route('teacher.my-students.index'));
    const onViewMessages = () => router.visit(route('teacher.messages'));
    const onViewAssessments = () => router.visit(route('teacher.assessment-management'));
    const onStudentClick = (student: Student) => toast.info(`Viewing student: ${student.firstName}`);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Dashboard" />

            <div className="p-4 sm:p-6 lg:p-8">
                <TeacherDashboardOverview
                    teacherName={`${user.first_name} ${user.last_name}`}
                    daycareName={daycare ? daycare.name : 'Unassigned'}
                    students={studentsList}
                    onNewAssessment={onNewAssessment}
                    onViewStudents={onViewStudents}
                    onViewMessages={onViewMessages}
                    onViewAssessments={onViewAssessments}
                    onStudentClick={onStudentClick}

                    totalStudents={dashboardStats.totalStudents}
                    assessmentsDue={dashboardStats.assessmentsDue}
                    completedAssessments={dashboardStats.completedAssessments}
                    classAverage={dashboardStats.classAverage}
                />
            </div>

            {/* --- New Assessment Modal --- */}
            <NewAssessmentDialog
                open={isAddAssessmentOpen}
                onOpenChange={setIsAddAssessmentOpen}
                students={dropdownStudents}
                onSave={handleCreateAssessment}
                isSubmitting={isSubmitting}
            />
        </AppLayout>
    );
}
