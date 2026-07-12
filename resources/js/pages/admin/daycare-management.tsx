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
import { AlertTriangle, Trash2, X } from 'lucide-react';

import AddDaycareDialog from '@/components/admin/add-daycare-dialog';
import DaycareOverview from '@/components/admin/admin-daycare-overview';
import DaycareDetailsView from '@/components/admin/daycare-details-view';
import DaycareEditForm from '@/components/admin/daycare-edit-form';

import { formatForInput } from '@/utils/date';

export interface Daycare extends InertiaDaycare {
    teacher: string;
    location: string;
    current: number;
    percentage: number;
    current_enrollment?: number;
    teachers?: string[]; // 🚀 Added to main interface
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
    teachers?: string[]; // 🚀 Ensure array is here
}

const calculatePercentage = (current: number, capacity: number) => Math.round((current / capacity) * 100) || 0;

const transformDaycare = (d: any): Daycare => {
    const currentEnrollment = d.current_enrollment || 0;

    // 🚀 Gracefully handle the transition from single 'principal_name' string to 'teachers' array
    const teachersList = Array.isArray(d.teachers) ? d.teachers : (d.principal_name ? [d.principal_name] : []);

    return {
        ...d,
        teachers: teachersList,
        teacher: teachersList.length > 0 ? teachersList.join(', ') : 'Unassigned', // Keep for backward compatibility
        location: `${d.city}, ${d.province}`,
        current: currentEnrollment,
        percentage: calculatePercentage(currentEnrollment, d.capacity),
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
        teachers: [], // 🚀 Initialized as empty array
    });

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                // 🚀 NEW: If we are editing a daycare, attach its ID to the URL
                // so the backend knows to include its currently assigned teachers in the list!
                const url = editingDaycare
                    ? route('admin.teachers.list', { daycare_id: editingDaycare.id })
                    : route('admin.teachers.list');

                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch teacher list.');

                const data = await response.json();
                setAvailableTeachers(data.teachers);
            } catch (error) {
                console.error('Error fetching teachers:', error);
                toast.error('Could not load teacher list for dropdowns.');
            }
        };

        // NEW: Add editingDaycare to the dependency array so it re-fetches
        // the correct list every time you click "Edit" on a different center.
        fetchTeachers();
    }, [editingDaycare]);

    useEffect(() => {
        if (viewingDaycare) {
            const freshDaycareData = daycares.find((d) => d.id === viewingDaycare.id);
            if (freshDaycareData) {
                setViewingDaycare(freshDaycareData);
            }
        }
    }, [daycares]);

    // 🚀 Original: Sends user back to the main Overview grid
    const handleBackToList = () => {
        setViewingDaycare(null);
        setEditingDaycare(null);
    };

    // 🚀 NEW: Sends user back to the Details view after cancelling an edit
    const handleCancelEdit = () => {
        if (editingDaycare) {
            setViewingDaycare(editingDaycare);
        }
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
            teachers: [], // 🚀 Reset to empty array
        });

    const handleAddDaycare = async (formData: DaycareFormData) => {
        const mappedData = {
            ...formData,
            capacity: parseInt(formData.capacity),
            postal_code: formData.postal_code || null,
            description: formData.description || null,
            established_date: formData.established_date || null,
            principal_name: formData.principal_name || null,
            teachers: formData.teachers || [], // 🚀 Pass teachers array to the backend
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
            teachers: editedData.teachers || [], // 🚀 Pass updated teachers array to backend
        };

        router.patch(route('admin.daycare.update', editedData.id), mappedData, {
            preserveState: true, // 🚀 CRITICAL: Prevents the page from resetting viewingDaycare to null!
            preserveScroll: true,
            onSuccess: () => {
                setEditingDaycare(null);
                setViewingDaycare(transformDaycare(editedData)); // 🚀 Restore the details view with new data
                toast.success('Daycare updated successfully.');
            },
            onError: (errors) => {
                console.error('Validation Errors:', errors);
                toast.error('Update failed.');
            },
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
        setViewingDaycare(null); // Temporarily hide details while editing
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
                onCancel={handleCancelEdit} // 🚀 Now safely returns to Details View
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

            {/* 🚀 PREMIUM PAGE WRAPPER */}
            <div className="flex-1 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
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
                        availableTeachers={availableTeachers} // 🚀 Passed list down to Dialog
                    />
                </Dialog>

                {/* 🚀 PREMIUM ALERT DIALOG DESIGN */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col">

                        {/* --- PREMIUM HEADER --- */}
                        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors shrink-0">
                            <AlertDialogHeader className="text-left">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                                        <AlertTriangle className="size-6" strokeWidth={2.5} />
                                    </div>
                                    <AlertDialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Delete Daycare Center
                                    </AlertDialogTitle>
                                </div>
                                <AlertDialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                                    Are you sure? This action cannot be undone. All data, student links, and settings tied to this branch will be permanently removed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                        </div>

                        {/* --- PREMIUM FOOTER --- */}
                        <AlertDialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                            <AlertDialogCancel
                                className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold bg-transparent border-0 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors m-0 shadow-none"
                                onClick={() => setSelectedDaycareId(null)}
                            >
                                <X className="mr-2 size-5" /> Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="h-12 w-full sm:w-auto px-8 rounded-xl text-base font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-sm transition-colors m-0"
                                onClick={handleConfirmDelete}
                            >
                                <Trash2 className="mr-2 size-5" /> Yes, Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>

                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
