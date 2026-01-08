import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User as InertiaUser } from '@/types';
import type { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';

import { NewTeacher } from '@/components/admin/add-teacher-dialog';
import AdminUserManagement, { User as ComponentUser } from '@/components/admin/admin-users-management';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Users Management', href: '/admin/users-management' },
];

interface PendingRequest {
    link_id: number;
    parent_id: number;
    parent_first: string;
    parent_last: string;
    parent_email: string;
    child_first: string;
    child_last: string;
    created_at: string;
}

export default function UsersManagement() {
    type ExtendedUser = InertiaUser & {
        students?: { first_name: string; last_name: string }[];
    };

    type UsersManagementPageProps = PageProps & {
        teachers: { data: ExtendedUser[]; meta: any };
        parents: { data: ExtendedUser[]; meta: any };
        daycares: { id: number; name: string }[];
        pendingRequests: PendingRequest[];
    };

    const { teachers, parents, daycares, pendingRequests } = usePage<UsersManagementPageProps>().props;

    // 2. Transform data
    const daycareList = daycares.map((d) => d.name);

    const mapUser = (user: ExtendedUser): ComponentUser => {
        const childName =
            user.students && user.students.length > 0 ? `${user.students[0].first_name} ${user.students[0].last_name}` : 'No Child Linked';

        return {
            id: user.id,
            firstName: user.first_name,
            middleName: user.middle_name || '',
            lastName: user.last_name,
            email: user.email,
            phone: user.phone || '',
            daycare: user.daycare?.name || '-',
            status: user.status || 'active',
            role: user.role,
            childName: childName,
        };
    };

    const mappedTeachers = teachers.data.map(mapUser);
    const mappedParents = parents.data.map(mapUser);

    // 4. Implement action handlers
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
                first_name: user.firstName,
                middle_name: user.middleName,
                last_name: user.lastName,
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
    const onApproveRequest = (linkId: number) => {
        router.post(
            route('admin.users.approve', linkId),
            {},
            {
                onSuccess: () => toast.success('Parent approved.'),
                onError: () => toast.error('Failed to approve.'),
                preserveScroll: true,
            },
        );
    };

    const onRejectRequest = (linkId: number) => {
        router.post(
            route('admin.users.reject', linkId),
            {},
            {
                onSuccess: () => toast.success('Request rejected.'),
                onError: () => toast.error('Failed to reject.'),
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

            <div className="p-4 sm:p-6 lg:p-8">
                <AdminUserManagement
                    teachers={mappedTeachers}
                    parents={mappedParents}
                    pendingRequests={pendingRequests}
                    daycareList={daycareList}
                    onAddTeacher={onAddTeacher}
                    onEditParent={onEditUser}
                    onEditTeacher={onEditUser}
                    onApproveRequest={onApproveRequest}
                    onRejectRequest={onRejectRequest}
                    onDeleteUser={onDeleteUser}
                    onExportData={onExportData}
                />
            </div>
        </AppLayout>
    );
}
