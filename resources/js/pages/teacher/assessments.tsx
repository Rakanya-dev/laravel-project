import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AssessmentData, AssessmentDetailsDialog, DomainScore } from '@/components/shared/assessment-details-dialog';

import { AssessmentTeacherList } from '@/components/teacher/assessment-teacher-list';
import { NewAssessmentDialog } from '@/components/teacher/new-assessment-dialog';

import type { BreadcrumbItem, Assessment as InertiaAssessment, Child as InertiaChild, User as InertiaUser } from '@/types';
import { generateAssessmentCSV } from '@/utils/export-assessment-csv';

interface AssessmentWithScores extends InertiaAssessment {
    evaluation_number: string;
    teacher: InertiaUser;
    scores: any[];
    assessment_type?: string;
}

interface AssessmentPageProps extends PageProps {
    auth: { user: InertiaUser };
    assessments: AssessmentWithScores[];
    students: InertiaChild[];
    next_assessment_date?: string;
}

const formatName = (person: { first_name: string; middle_name?: string | null; last_name: string }) => {
    return [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(' ');
};

const calculateAge = (birthdate: string) => {
    if (!birthdate) return 0;
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
};

const mapScoresForDialog = (scores: any[]): DomainScore[] => {
    if (!scores) return [];
    return scores.map((s) => {
        const raw = Number(s.score) || 0;
        const scaled = raw > 0 ? Math.ceil(raw * 0.65) : 0;
        return {
            id: s.id,
            domain: s.domain?.name || 'Unknown',
            rawScore: raw,
            scaledScore: scaled,
            interpretation: 'Pending...',
        };
    });
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Assessments', href: 'teacher/assessments' }];

export default function AssessmentManagementPage() {
    const { auth, assessments: rawAssessments, students: rawStudents } = usePage<AssessmentPageProps>().props;
    const user = auth.user;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssessment, setSelectedAssessment] = useState<AssessmentData | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Transform Data ---
    const studentsList = useMemo(() => {
        if (!rawStudents) return [];

        // Identify students who already have an active assessment
        const busyStudentIds = new Set();
        if (rawAssessments) {
            rawAssessments.forEach((a) => {
                if (['Draft', 'In Progress'].includes(a.status)) {
                    busyStudentIds.add(a.student_id);
                }
            });
        }

        return rawStudents.map((student) => ({
            id: student.id,
            name: formatName(student),
            age: calculateAge(student.date_of_birth),
            isDisabled: busyStudentIds.has(student.id),
        }));
    }, [rawStudents, rawAssessments]);

    const assessments = useMemo(() => {
        return rawAssessments.map((assessment) => {
            const student = rawStudents.find((s) => s.id === assessment.student_id);
            const teacher = assessment.teacher;

            return {
                id: assessment.id,
                childName: student ? formatName(student) : 'Unknown Student',
                evaluation: assessment.evaluation_number || `#${assessment.id}`,

                type: assessment.assessment_type || 'Regular',

                dateCreated: new Date(assessment.assessment_date).toLocaleDateString(),
                evaluator: teacher ? formatName(teacher) : 'Unknown',
                status: assessment.status as any,
                standardScore: Number(assessment.overall_score) || 0,
                sumOfScaled: 0, // Dialog calculates this
                domainScoresRaw: assessment.scores, // Pass raw scores for mapping
                assessmentSummary: (assessment as any).overall_notes || '',
                recommendation: (assessment as any).recommendations || '',
                daycareName: student?.daycare?.name || 'N/A',
                nextAssessmentDue: assessment.next_assessment_date || 'TBD'
            };
        });
    }, [rawAssessments, rawStudents, user]);

    const filteredAssessments = assessments.filter((a) => a.childName.toLowerCase().includes(searchQuery.toLowerCase()));

    // --- HANDLERS ---
    const openDialog = (assessment: any) => {
        const dialogData: AssessmentData = {
            ...assessment,
            domainScores: mapScoresForDialog(assessment.domainScoresRaw),
            assessmentSummary: assessment.assessmentSummary || '',
            recommendation: assessment.recommendation || '',
            nextAssessmentDue: assessment.nextAssessmentDue || '',
        };

        setSelectedAssessment(dialogData);
        setIsDetailsOpen(true);
    };

    const handleViewAssessment = (a: any) => openDialog(a);
    const handleContinueAssessment = (a: any) => openDialog(a);
    const handleStartAssessment = (a: any) => openDialog(a);

    const handleSaveDetails = (updatedData: any) => {
        if (!selectedAssessment) return;

        // 1. Map domain scores
        const scoresPayload = updatedData.domainScores.map((ds: any) => ({
            id: ds.id,
            score: ds.rawScore,
            rating: ds.interpretation,
            notes: '',
        }));

        // 2. Include 'next_assessment_date' in the payload
        const apiData = {
            status: updatedData.status,
            overall_notes: updatedData.assessmentSummary,
            recommendations: updatedData.recommendation,
            next_assessment_date: updatedData.nextAssessmentDue,
            overall_score: updatedData.standardScore,
            scores: scoresPayload,
        };

        router.patch(route('teacher.assessments.update', selectedAssessment.id), apiData, {
            onSuccess: () => {
                setIsDetailsOpen(false);
                toast.success('Assessment saved successfully');
            },
            onError: (errors) => {
                toast.error('Failed to save assessment');
                console.error(errors);
            },
        });
    };

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
                },
                onError: () => toast.error('Failed to create assessment.'),
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleDeleteAssessment = (id: number) => {
        if (!confirm('Are you sure you want to delete this draft?')) return;
        router.delete(route('teacher.assessments.destroy', id), {
            onSuccess: () => toast.success('Draft deleted'),
            onError: () => toast.error('Could not delete assessment'),
        });
    };

    const exportAllAssessments = () => {
        generateAssessmentCSV(filteredAssessments);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Assessments" />
            <div className="p-4 sm:p-6 lg:p-8">
                <AssessmentTeacherList
                    assessments={filteredAssessments}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onExportAll={exportAllAssessments}
                    onViewAssessment={handleViewAssessment}
                    onContinueAssessment={handleContinueAssessment}
                    onStartAssessment={handleStartAssessment}
                    onNewAssessment={() => setIsAddAssessmentOpen(true)}
                    onDeleteAssessment={handleDeleteAssessment}
                />
            </div>

            <AssessmentDetailsDialog
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                assessment={selectedAssessment}
                onSave={handleSaveDetails}
                readOnly={false} // Teacher mode allows editing
            />

            <NewAssessmentDialog
                open={isAddAssessmentOpen}
                onOpenChange={setIsAddAssessmentOpen}
                students={studentsList}
                onSave={handleCreateAssessment}
                isSubmitting={isSubmitting}
            />
        </AppLayout>
    );
}
