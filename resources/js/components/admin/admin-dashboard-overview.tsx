import AdminOverviewStats from './admin-overview-stats';
import AdminQuickActions from './admin-quick-actions';
import AdminSystemAlerts from './admin-system-alerts';
import AdminRecentUsers from './admin-recent-users';

// --- Reused Types ---
interface User {
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
// --------------------

interface AdminDashboardOverviewProps {
    adminName: string;
    totalUsers: number;
    activeUsers: number;
    activeDaycares: number;
    totalDaycares: number;
    totalStudents: number;
    activeStudents: number;
    totalAssessments: number;
    completedAssessments: number;
    recentUsers: User[];
    systemAlerts?: SystemAlert[];
    onAddTeacher: () => void;
    onManageParents: () => void;
    onAddDaycare: () => void;
    onViewReports: () => void;
    onUserClick?: (user: User) => void;
}

export default function AdminDashboardOverview({
    adminName,
    totalUsers,
    activeUsers,
    activeDaycares,
    totalDaycares,
    totalStudents,
    activeStudents,
    totalAssessments,
    completedAssessments,
    recentUsers,
    systemAlerts = [],
    onAddTeacher,
    onManageParents,
    onAddDaycare,
    onViewReports,
    onUserClick = () => {}
}: AdminDashboardOverviewProps) {
    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h2 className="text-black text-2xl font-semibold">Dashboard Overview</h2>
                <p className="text-neutral-600">Welcome back, {adminName}</p>
            </div>

            {/* Stats Grid */}
            <AdminOverviewStats
                totalUsers={totalUsers}
                activeUsers={activeUsers}
                activeDaycares={activeDaycares}
                totalDaycares={totalDaycares}
                totalStudents={totalStudents}
                activeStudents={activeStudents}
                totalAssessments={totalAssessments}
                completedAssessments={completedAssessments}
            />

            {/* Quick Actions */}
            <AdminQuickActions
                onAddTeacher={onAddTeacher}
                onManageParents={onManageParents}
                onAddDaycare={onAddDaycare}
                onViewReports={onViewReports}
            />

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Users */}
                <AdminRecentUsers
                    users={recentUsers}
                    maxUsers={5}
                    onUserClick={onUserClick}
                />

                {/* System Alerts */}
                <AdminSystemAlerts alerts={systemAlerts} maxAlerts={5} />
            </div>
        </div>
    );
}
