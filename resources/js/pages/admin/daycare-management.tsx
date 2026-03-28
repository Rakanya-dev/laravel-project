import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Daycare as InertiaDaycare } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import AddDaycareDialog from '@/components/admin/add-daycare-dialog';
import DaycareOverview from '@/components/admin/admin-daycare-overview';
import DaycareDetailsView from '@/components/admin/daycare-details-view';
import DaycareEditForm from '@/components/admin/daycare-edit-form';

// 🚀 IMPORT NEW DATE TOOLKIT
import { formatForInput } from '@/utils/date';

export interface Daycare extends InertiaDaycare {
    teacher: string;
    location: string;
    current: number;
    percentage: number;
    current_enrollment?: number;
}

export interface DaycareFormData {
    name: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
    email: string;
    principal_name: string;
    capacity: string;
    description: string;
    established_date: string;
}

const calculatePercentage = (current: number, capacity: number) => Math.round((current / capacity) * 100) || 0;

// 🚀 REFACTORED: Now uses the global helper!
const transformDaycare = (d: any): Daycare => {
    const currentEnrollment = d.current_enrollment || 0;

    return {
        ...d,
        teacher: d.principal_name || 'Unassigned',
        location: `${d.city}, ${d.province}`,
        current: currentEnrollment,
        percentage: calculatePercentage(currentEnrollment, d.capacity),
        // 🚀 USES NEW HELPER TO PREVENT TIMEZONE SHIFTS
        established_date: formatForInput(d.established_date),
    };
};

const breadcrumbs = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Daycare Management', href: '/admin/daycare-management' },
];

export default function DaycareManagement() {
    type DaycarePageProps = { daycares: InertiaDaycare[] };
    const { daycares: rawDaycares } = usePage<DaycarePageProps>().props;

    const daycares: Daycare[] = useMemo(() => {
        return rawDaycares.map(transformDaycare);
    }, [rawDaycares]);

    const [isAddDaycareOpen, setIsAddDaycareOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDaycareId, setSelectedDaycareId] = useState<number | null>(null);
    const [viewingDaycare, setViewingDaycare] = useState<Daycare | null>(null);
    const [editingDaycare, setEditingDaycare] = useState<Daycare | null>(null);
    const [availableTeachers, setAvailableTeachers] = useState<string[]>([]);

    const [newDaycareForm, setNewDaycareForm] = useState<DaycareFormData>({
        name: '',
        address: '',
        city: 'General Mariano Alvarez',
        province: 'Cavite',
        postal_code: '4117',
        phone: '',
        email: '',
        principal_name: '',
        capacity: '',
        description: '',
        established_date: '',
    });

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch(route('admin.teachers.list'));
                if (!response.ok) throw new Error('Failed to fetch teacher list.');
                const data = await response.json();
                setAvailableTeachers(data.teachers);
            } catch (error) {
                console.error('Error fetching teachers:', error);
                toast.error('Could not load teacher list for dropdowns.');
            }
        };
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (viewingDaycare) {
            const freshDaycareData = daycares.find((d) => d.id === viewingDaycare.id);
            if (freshDaycareData) {
                setViewingDaycare(freshDaycareData);
            }
        }
    }, [daycares]);

    const handleBackToList = () => {
        setViewingDaycare(null);
        setEditingDaycare(null);
    };

    const resetNewDaycareForm = () =>
        setNewDaycareForm({
            name: '',
            address: '',
            city: 'General Mariano Alvarez',
            province: 'Cavite',
            postal_code: '4117',
            phone: '',
            email: '',
            principal_name: '',
            capacity: '',
            description: '',
            established_date: '',
        });

    const handleAddDaycare = async (formData: DaycareFormData) => {
        const mappedData = {
            ...formData,
            capacity: parseInt(formData.capacity),
            postal_code: formData.postal_code || null,
            description: formData.description || null,
            established_date: formData.established_date || null,
            principal_name: formData.principal_name || null,
        };

        router.post(route('admin.daycare.store'), mappedData, {
            onSuccess: () => {
                setIsAddDaycareOpen(false);
                resetNewDaycareForm();
                toast.success('Daycare created successfully!');
            },
            onError: (errors) => {
                console.error('Validation Errors:', errors);
                const firstError = Object.values(errors)[0];
                toast.error('Failed to add daycare.', { description: firstError });
            },
            preserveScroll: true,
        });
    };

    const handleSaveEdit = async (editedData: Daycare) => {
        const mappedData = {
            name: editedData.name,
            address: editedData.address,
            city: editedData.city,
            province: editedData.province,
            postal_code: editedData.postal_code,
            email: editedData.email,
            phone: editedData.phone,
            principal_name: editedData.principal_name,
            capacity: editedData.capacity,
            description: editedData.description,
            established_date: editedData.established_date,
        };

        router.patch(route('admin.daycare.update', editedData.id), mappedData, {
            onSuccess: () => {
                setEditingDaycare(null);
                setViewingDaycare(transformDaycare(editedData));
                toast.success('Daycare updated successfully.');
            },
            onError: (errors) => {
                console.error('Validation Errors:', errors);
                toast.error('Update failed.');
            },
            preserveScroll: true,
        });
    };

    const handleConfirmDelete = async () => {
        if (selectedDaycareId === null) return;
        router.delete(route('admin.daycare.destroy', selectedDaycareId), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setViewingDaycare(null);
                toast.success('Daycare deleted successfully.');
            },
            onError: () => toast.error('Failed to delete daycare.'),
            preserveScroll: true,
        });
        setSelectedDaycareId(null);
    };

    const handleEditClick = (daycare: Daycare) => {
        setEditingDaycare({ ...daycare });
        setViewingDaycare(null);
    };
    const handleDeleteClick = (id: number) => {
        setSelectedDaycareId(id);
        setIsDeleteDialogOpen(true);
    };

    const totalStudents = daycares.reduce((sum, d) => sum + d.current, 0);
    const totalCapacity = daycares.reduce((sum, d) => sum + d.capacity, 0);
    const occupancyRate = calculatePercentage(totalStudents, totalCapacity);

    let content;
    if (editingDaycare) {
        content = (
            <DaycareEditForm
                editingDaycare={editingDaycare}
                availableTeachers={availableTeachers}
                onSetEditingDaycare={setEditingDaycare}
                onSave={handleSaveEdit}
                onCancel={handleBackToList}
            />
        );
    } else if (viewingDaycare) {
        content = <DaycareDetailsView daycare={viewingDaycare} onBack={handleBackToList} onEdit={handleEditClick} onDelete={handleDeleteClick} />;
    } else {
        content = (
            <DaycareOverview
                daycares={daycares}
                onAddDaycare={() => setIsAddDaycareOpen(true)}
                onViewDaycare={setViewingDaycare}
                onEditDaycare={handleEditClick}
                onDeleteDaycare={handleDeleteClick}
                totalDaycares={daycares.length}
                totalCapacity={totalCapacity}
                totalStudents={totalStudents}
                averageOccupancy={occupancyRate}
            />
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daycare Management" />
            <div className="p-4 sm:p-6 lg:p-8">
                {content}

                <Dialog
                    open={isAddDaycareOpen}
                    onOpenChange={(open) => {
                        setIsAddDaycareOpen(open);
                        if (!open) resetNewDaycareForm();
                    }}
                >
                    <AddDaycareDialog
                        onOpenChange={setIsAddDaycareOpen}
                        onSave={handleAddDaycare}
                        initialForm={newDaycareForm as any}
                        onSetForm={setNewDaycareForm as any}
                    />
                </Dialog>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Daycare Center</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSelectedDaycareId(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
