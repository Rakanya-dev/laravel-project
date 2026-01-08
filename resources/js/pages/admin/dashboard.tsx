import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User as InertiaUser } from '@/types'; // Import Inertia's User type
import { Head, usePage, router } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';

import AdminDashboardOverview from '@/components/admin/admin-dashboard-overview';

interface ComponentUser {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  daycare: string;
  status: string;
  role: string;
}

interface SystemAlert {
  id: number;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  time: string;
}

interface DashboardPageProps extends PageProps {
    adminName: string;
    totalUsers: number;
    activeUsers: number;
    activeDaycares: number;
    totalDaycares: number;
    totalStudents: number;
    activeStudents: number;
    totalAssessments: number;
    completedAssessments: number;
    recentUsers: InertiaUser[];
    systemAlerts?: SystemAlert[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }];

export default function AdminDashboard() {

    const {
        adminName,
        totalUsers,
        activeUsers,
        activeDaycares,
        totalDaycares,
        totalStudents,
        activeStudents,
        totalAssessments,
        completedAssessments,
        recentUsers: rawRecentUsers,
        systemAlerts,
    } = usePage<DashboardPageProps>().props;

    const mapUser = (user: InertiaUser): ComponentUser => ({
        id: user.id,
        firstName: user.first_name,
        middleName: user.middle_name || '',
        lastName: user.last_name,
        email: user.email,
        phone: user.phone || '',
        daycare: user.daycare?.name || '-',
        status: user.status || 'active',
        role: user.role,
    });

    const recentUsers = rawRecentUsers.map(mapUser);


    const onAddTeacher = () => {
        router.visit(route('admin.users.management'));
    };
    const onManageParents = () => {
        router.visit(route('admin.users.management', { tab: 'parents' }));
    };
    const onAddDaycare = () => {
        router.visit(route('admin.daycare.index'));
    };
    const onViewReports = () => {
        router.visit(route('admin.reports'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="p-4 sm:p-6 lg:p-8">
                <AdminDashboardOverview
                    adminName={adminName}
                    totalUsers={totalUsers}
                    activeUsers={activeUsers}
                    activeDaycares={activeDaycares}
                    totalDaycares={totalDaycares}
                    totalStudents={totalStudents}
                    activeStudents={activeStudents}
                    totalAssessments={totalAssessments}
                    completedAssessments={completedAssessments}
                    recentUsers={recentUsers}
                    systemAlerts={systemAlerts}
                    onAddTeacher={onAddTeacher}
                    onManageParents={onManageParents}
                    onAddDaycare={onAddDaycare}
                    onViewReports={onViewReports}
                />
            </div>

        </AppLayout>
    );
}
