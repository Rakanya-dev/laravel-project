import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User as InertiaUser } from '@/types'; // Make sure this file is updated!
import type { PageProps } from '@inertiajs/inertia';
import { Head, usePage, router } from '@inertiajs/react'; // Use router
import { toast } from 'sonner';

// Import your components
import AdminUserManagement, {
    User as ComponentUser,
} from '@/components/admin-users-management';
import { NewTeacher } from '@/components/ui/add-teacher-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users Management', href: '/admin/users-management' },
];

export default function UsersManagement() {
    // 1. Get Inertia props
    type UsersManagementPageProps = PageProps & {
        teachers: { data: InertiaUser[]; meta: any };
        parents: { data: InertiaUser[]; meta: any };
        daycares: { id: number; name: string }[]; // The new schema sends 'name'
    };
    const { teachers, parents, daycares } =
        usePage<UsersManagementPageProps>().props;

    // 2. Transform data
    // --- FIX: Use 'name' from your new Daycare model ---
    const daycareList = daycares.map((d) => d.name); // Changed

    const mapUser = (user: InertiaUser): ComponentUser => ({
        id: user.id,
        firstName: user.first_name,
        middleName: user.middle_name || '',
        lastName: user.last_name,
        email: user.email,
        // --- FIX: Use 'phone' and 'role' from new User model ---
        phone: user.phone || '', // Changed
        daycare: user.daycare?.name || '-', // Changed
        status: user.status || 'active',
        role: user.role, // Changed
    });

    const mappedTeachers = teachers.data.map(mapUser);
    const mappedParents = parents.data.map(mapUser);

    // 4. Implement action handlers

    const onAddTeacher = (teacher: NewTeacher) => {
        const daycare = daycares.find((d) => d.name === teacher.daycare);

        // --- FIX: Send 'phone' instead of 'contact_number' ---
        router.post( // Use router
            route('admin.teachers.store'),
            {
                first_name: teacher.firstName,
                middle_name: teacher.middleName,
                last_name: teacher.lastName,
                email: teacher.email,
                phone: teacher.phone, // Changed
                password: teacher.password,
                password_confirmation: teacher.password_confirmation,
                daycare_id: daycare?.id,
            },
            {
                onSuccess: () => toast.success('Teacher added successfully.'),
                onError: (e) => {
                    console.error(e);
                    toast.error('Failed to add teacher. Check console for details.');
                },
                preserveScroll: true,
            },
        );
    };

    const onEditUser = (user: ComponentUser) => {
        const daycare = daycares.find((d) => d.name === user.daycare);

        // --- FIX: Send 'phone' instead of 'contact_number' ---
        router.patch( // Use router
            route('admin.users.update', user.id),
            {
                first_name: user.firstName,
                middle_name: user.middleName,
                last_name: user.lastName,
                email: user.email,
                phone: user.phone, // Changed
                daycare_id: daycare?.id,
            },
            {
                onSuccess: () => toast.success('User updated successfully.'),
                onError: (e) => {
                    console.error(e);
                    toast.error('Failed to update user. Check console for details.');
                },
                preserveScroll: true,
            },
        );
    };

    const onApproveParent = (parentId: number) => {
        router.post( // Use router
            route('admin.users.approve', parentId),
            {},
            {
                onSuccess: () => toast.success('Parent approved.'),
                onError: () => toast.error('Failed to approve parent.'),
                preserveScroll: true,
            },
        );
    };

    const onRejectParent = (parentId: number) => {
        router.post( // Use router
            route('admin.users.reject', parentId),
            {},
            {
                onSuccess: () => toast.success('Parent rejected.'),
                onError: () => toast.error('Failed to reject parent.'),
                preserveScroll: true,
            },
        );
    };

    const onDeleteUser = (userId: number, userType: 'teachers' | 'parents') => {
        router.delete(route('admin.users.destroy', userId), { // Use router.delete
            onSuccess: () =>
                toast.success(
                    `${userType === 'teachers' ? 'Teacher' : 'Parent'} deleted.`,
                ),
            onError: () => toast.error('Failed to delete user.'),
            preserveScroll: true,
        });
    };

    const onExportData = (userType: 'teachers' | 'parents') => {
        window.location.href = route('admin.users.export', { type: userType });
        toast.info(`Exporting ${userType} data...`);
    };

    // 5. Render the page
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />

            <div className="p-4 sm:p-6 lg:p-8">
                <AdminUserManagement
                    teachers={mappedTeachers}
                    parents={mappedParents}
                    daycareList={daycareList}
                    onAddTeacher={onAddTeacher}
                    onEditParent={onEditUser}
                    onEditTeacher={onEditUser}
                    onApproveParent={onApproveParent}
                    onRejectParent={onRejectParent}
                    onDeleteUser={onDeleteUser}
                    onExportData={onExportData}
                />
            </div>
        </AppLayout>
    );
}
