import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

// Import your components
import { ChildAssessmentsList } from '@/components/parent/child-assessments-list';
import { ChildProfileHeader } from '@/components/parent/child-profile-header';
import { ChildReportsList } from '@/components/parent/child-reports-list';

// Shared Modal
import { AssessmentDetailsDialog } from '@/components/shared/assessment-details-dialog';

interface ChildProfileProps {
    child: any;
    user: any;
    childAssessments: any[];
    generatedReports: any[];
}

export default function ChildProfile({ child, user, childAssessments, generatedReports }: ChildProfileProps) {
    // Assessment Details State
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleViewAssessment = (assessment: any) => {
        setSelectedAssessment(assessment);
        setIsDetailModalOpen(true);
    };

    const handleDownload = (id: number) => {
        window.open(route('assessments.download', id), '_blank');
    };
    const handlePrint = (id: number) => {
        window.open(route('assessments.print', id), '_blank');
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/parent/dashboard' },
        { title: 'Child Profile', href: '/parent/child-profile' },
    ];

    if (!child) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Child Profile" />
                <div className="p-8 text-center text-neutral-500">
                    <p>No child profile linked to your account.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Child Profile" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <ChildProfileHeader child={child} parentName={user?.name || 'Parent'} />

                <Tabs defaultValue="assessments" className="w-full">
                    {/* Changed to 2 columns since Notes are gone */}
                    <TabsList className="mb-8 grid w-full grid-cols-2">
                        <TabsTrigger value="assessments">Assessments</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="assessments">
                        <ChildAssessmentsList
                            assessments={childAssessments || []}
                            onViewDetails={handleViewAssessment}
                            onDownload={handleDownload}
                            onPrint={handlePrint}
                        />
                    </TabsContent>

                    <TabsContent value="reports">
                        <ChildReportsList reports={generatedReports || []} />
                    </TabsContent>
                </Tabs>

                {selectedAssessment && (
                    <AssessmentDetailsDialog
                        open={isDetailModalOpen}
                        onOpenChange={setIsDetailModalOpen}
                        assessment={selectedAssessment}
                        readOnly={true}
                    />
                )}
            </div>
        </AppLayout>
    );
}
