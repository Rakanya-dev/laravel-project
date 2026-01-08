import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

// Import your components
import { ChildAssessmentsList } from '@/components/parent/child-assessments-list';
import { ChildProfileHeader } from '@/components/parent/child-profile-header';
import { ChildReportsList } from '@/components/parent/child-reports-list';
import { QuickNotesCard } from '@/components/parent/quick-notes-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Shared Modal
import { AssessmentDetailsDialog } from '@/components/shared/assessment-details-dialog';

interface ChildProfileProps {
    child: any;
    user: any;
    childAssessments: any[];
    savedNotes: any[];
    generatedReports: any[];
}

export default function ChildProfile({ child, user, childAssessments, savedNotes = [], generatedReports }: ChildProfileProps) {
    // 👇 FIX 1: Add <any> or your Assessment interface so TS knows it's not just null
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // -- State for Delete Dialog --
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

    // -- Handlers --
    const handleAddNote = (text: string) => {
        router.post(
            route('parent.notes.store'),
            { text },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Note added successfully'),
                onError: () => toast.error('Failed to add note'),
            },
        );
    };

    const handleEditNote = (id: number, text: string) => {
        router.patch(
            route('parent.notes.update', id),
            { text },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Note updated'),
            },
        );
    };

    const confirmDeleteNote = (id: number) => {
        setNoteToDelete(id);
        setIsDeleteOpen(true);
    };

    const executeDeleteNote = () => {
        if (noteToDelete === null) return;
        router.delete(route('parent.notes.delete', noteToDelete), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Note deleted');
                setIsDeleteOpen(false);
                setNoteToDelete(null);
            },
            onError: () => toast.error('Failed to delete note'),
        });
    };

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
                    <TabsList className="mb-8 grid w-full grid-cols-3">
                        <TabsTrigger value="assessments">Assessments</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
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

                    <TabsContent value="notes">
                        <div className="h-[600px]">
                            <QuickNotesCard notes={savedNotes} onAdd={handleAddNote} onEdit={handleEditNote} onDelete={confirmDeleteNote} />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* 👇 FIX 2: Changed 'isOpen' to 'open' and 'onClose' to 'onOpenChange'
                    (Standard Shadcn/Radix naming) */}
                {selectedAssessment && (
                    <AssessmentDetailsDialog
                        open={isDetailModalOpen}
                        onOpenChange={setIsDetailModalOpen}
                        assessment={selectedAssessment}
                        // Note: If your component strictly uses 'onClose' instead of 'onOpenChange',
                        // change the line above back to: onClose={() => setIsDetailModalOpen(false)}
                        readOnly={true}
                    />
                )}

                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Note</DialogTitle>
                            <DialogDescription>Are you sure?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={executeDeleteNote}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
