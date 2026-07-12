import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User as InertiaUser } from '@/types';
import type { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';

import { NewTeacher } from '@/components/admin/add-teacher-dialog';
import AdminUserManagement, { User as ComponentUser } from '@/components/admin/admin-user-management';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Users Management', href: '/admin/users-management' },
];

export default function UsersManagement() {
    type ExtendedUser = InertiaUser & {
        students?: { first_name: string; last_name: string }[];
    };

    type UsersManagementPageProps = PageProps & {
        teachers: { data: ExtendedUser[]; total: number; from: number; to: number; links: any[] };
        parents: { data: ExtendedUser[]; total: number; from: number; to: number; links: any[] };
        daycares: { id: number; name: string }[];
    };
    const { teachers, parents, daycares } = usePage<UsersManagementPageProps>().props;

    // Transform data
    const daycareList = daycares.map((d) => d.name);

    const mapUser = (user: ExtendedUser): ComponentUser => {
        const firstChild = user.students && user.students.length > 0 ? user.students[0] : null;
        const childName = firstChild ? `${firstChild.first_name} ${firstChild.last_name}` : 'No Child Linked';

        // 🚀 THE FIX: If the user is a parent, grab the daycare from their child!
        let resolvedDaycare = '-';
        if (user.role === 'teacher' && user.daycare) {
            resolvedDaycare = user.daycare.name;
        } else if (user.role === 'parent' && firstChild && firstChild.daycare) {
            // @ts-ignore - Assuming the child object has the daycare attached via the backend
            resolvedDaycare = firstChild.daycare.name || '-';
        }

        return {
            id: user.id,
            first_name: user.first_name,
            middle_name: user.middle_name || '',
            last_name: user.last_name,
            email: user.email,
            phone: user.phone || '',
            daycare: resolvedDaycare, // 🚀 Uses our new logic
            status: user.status || 'Active',
            role: user.role,
            childName: childName,
        };
    };

    const mappedTeachers = teachers.data.map(mapUser);
    const mappedParents = parents.data.map(mapUser);

    // Implement action handlers
    const onAddTeacher = (teacher: NewTeacher) => {
        const daycare = daycares.find((d) => d.name === teacher.daycare);

        router.post(
            route('admin.teachers.store'),
            {
                first_name: teacher.firstName,
                middle_name: teacher.middleName,
                last_name: teacher.lastName,
                email: teacher.email,
                phone: teacher.phone,
                password: teacher.password,
                password_confirmation: teacher.password_confirmation,
                daycare_id: daycare?.id,
                role: 'teacher' // 🚀 Ensure role is passed
            },
            {
                onSuccess: () => toast.success('Teacher added successfully.'),
                onError: (e) => {
                    console.error(e);
                    toast.error('Failed to add teacher.');
                },
                preserveScroll: true,
            },
        );
    };

    const onEditUser = (user: ComponentUser) => {
        const daycare = daycares.find((d) => d.name === user.daycare);

        router.patch(
            route('admin.users.update', user.id),
            {
                first_name: user.first_name || user.firstName,
                middle_name: user.middle_name || user.middleName,
                last_name: user.last_name || user.lastName,
                email: user.email,
                phone: user.phone,
                daycare_id: daycare?.id,
            },
            {
                onSuccess: () => toast.success('User updated successfully.'),
                onError: (e) => {
                    console.error(e);
                    toast.error('Failed to update user.');
                },
                preserveScroll: true,
            },
        );
    };

    const onDeleteUser = (userId: number, userType: 'teachers' | 'parents') => {
        router.delete(route('admin.users.destroy', userId), {
            onSuccess: () => toast.success(`${userType === 'teachers' ? 'Teacher' : 'Parent'} deleted.`),
            onError: () => toast.error('Failed to delete user.'),
            preserveScroll: true,
        });
    };

    const onExportData = (userType: 'teachers' | 'parents') => {
        window.location.href = route('admin.users.export', { type: userType });
        toast.info(`Exporting ${userType} data...`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />

            {/* --- PREMIUM PAGE WRAPPER --- */}
            <div className="flex-1 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
                <AdminUserManagement
                    // 🚀 THE FIX: Pass the whole paginator object, but overwrite the .data array with our mapped users
                    teachers={{ ...teachers, data: mappedTeachers }}
                    parents={{ ...parents, data: mappedParents }}
                    // 🚀 REMOVED the separate pagination props entirely!
                    daycareList={daycareList}
                    onAddTeacher={onAddTeacher}
                    onEditParent={onEditUser}
                    onEditTeacher={onEditUser}
                    onDeleteUser={onDeleteUser}
                    onExportData={onExportData}
                />
            </div>
        </AppLayout>
    );
}
