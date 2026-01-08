import ParentDashboardOverview from '@/components/parent/parent-dashboard-overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';

interface Student {
    id: number;
    name: string;
    age: number;
    daycare: string;
    progress: {
        name: string;
        score: number;
        max: number;
        percentage: number;
    }[];
    attendance: number;
    last_assessment_date: string;
    // Optional: If controller passes full history later
    assessments?: any[];
}

interface ParentDashboardProps extends PageProps {
    auth: { user: any };
    students: Student[];
}

export default function ParentDashboard() {
    const { auth, students } = usePage<ParentDashboardProps>().props;

    const breadcrumbs = [{ title: 'Dashboard', href: '/parent/dashboard' }];

    const handleNavigateToMessages = () => router.visit(route('parent.messages'));
    // Defaulting to child profile for reports view
    const handleNavigateToReports = () => router.visit(route('parent.child-profile'));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Parent Dashboard" />

            <div className="p-4 sm:p-6 lg:p-8">
                {students.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                        <p className="text-slate-500">No students linked to your account yet.</p>
                        <p className="mt-1 text-sm text-slate-400">Please contact your daycare administrator.</p>
                    </div>
                ) : (
                    <Tabs defaultValue={students[0].id.toString()} className="w-full space-y-6">
                        {/* Only show tabs if there is more than one student */}
                        {students.length > 1 && (
                            <div className="flex justify-center">
                                <TabsList className="grid w-full max-w-md grid-cols-2">
                                    {students.map((student) => (
                                        <TabsTrigger key={student.id} value={student.id.toString()}>
                                            {student.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        )}

                        {students.map((student) => {
                            // Adapt the student data to match what the Overview component expects.
                            // If explicit assessments array isn't provided by controller yet,
                            // we construct a partial one from the summary data to populate the UI.
                            const adaptedAssessments = student.assessments || (student.last_assessment_date && student.last_assessment_date !== 'N/A' ? [{
                                id: 999, // Placeholder ID
                                dateCreated: student.last_assessment_date,
                                standardScore: 0 // Score might be inside 'progress', 0 acts as placeholder
                            }] : []);

                            return (
                                <TabsContent key={student.id} value={student.id.toString()}>
                                    <ParentDashboardOverview
                                        child={{
                                            id: student.id,
                                            name: student.name,
                                            age: student.age,
                                            daycare: student.daycare
                                        }}
                                        assessments={adaptedAssessments}
                                        onNavigateToMessages={handleNavigateToMessages}
                                        onNavigateToReports={handleNavigateToReports}
                                    />
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
}
