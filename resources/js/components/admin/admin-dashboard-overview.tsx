import AdminOverviewStats from './admin-overview-stats';
import AdminQuickActions from './admin-quick-actions';
import AdminRecentUsers from './admin-recent-users';
import { Card } from '@/components/ui/card';
import { AlertCircle, ClipboardList } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  daycare: string;
  role: string;
  lastActive: string;
}

interface SystemAlert {
  id: number;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  time: string;
}

// 🚀 UPDATED: Props now perfectly match the 4 Kidtrak System Objectives
interface AdminDashboardOverviewProps {
    adminName: string;

    // Obj A: Digital Tracking
    totalLearners: number;
    activeLearners: number;
    pendingEnrollments: number;

    // Obj B: Analytics
    totalAssessments: number;
    reportsGenerated: number;
    flaggedResults: number;

    // Obj C: Comms & Alerts
    unreadMessages: number;


    // Obj D: System Mgmt
    totalCenters: number;
    activeStaff: number;

    recentUsers: User[];

    // Actions
    onReviewEnrollments: () => void;
    onManageDaycares: () => void;
    onViewAssessmentAnalytics: () => void;
    onGenerateAnnualReport: () => void;
    onUserClick?: (user: User) => void;
}

export default function AdminDashboardOverview({
    adminName,
    totalLearners,
    activeLearners,
    pendingEnrollments,
    totalAssessments,
    reportsGenerated,
    flaggedResults,
    unreadMessages,
    totalCenters,
    activeStaff,
    recentUsers,
    onReviewEnrollments,
    onManageDaycares,
    onViewAssessmentAnalytics,
    onGenerateAnnualReport,
    onUserClick = () => {}
}: AdminDashboardOverviewProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">ECCD Admin Dashboard</h2>
                    <p className="font-medium text-slate-500">Welcome back, Supervisor {adminName}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {pendingEnrollments > 0 && (
                        <Card className="flex items-center gap-3 border-amber-200 bg-amber-50 px-4 py-2 shadow-none">
                            <AlertCircle className="size-5 text-amber-600" />
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">Action Needed</p>
                                <p className="text-sm font-bold text-amber-900">{pendingEnrollments} Pending Registrations</p>
                            </div>
                        </Card>
                    )}
                    {flaggedResults > 0 && (
                        <Card className="flex items-center gap-3 border-rose-200 bg-rose-50 px-4 py-2 shadow-none">
                            <ClipboardList className="size-5 text-rose-600" />
                            <div>
                                <p className="text-[10px] font-bold tracking-wider text-rose-800 uppercase">Developmental Flags</p>
                                <p className="text-sm font-bold text-rose-900">{flaggedResults} Learners Need Review</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* 🚀 FIX: Now passing the exact Kidtrak metrics down to the stats component */}
            <AdminOverviewStats
                totalLearners={totalLearners}
                activeLearners={activeLearners}
                totalAssessments={totalAssessments}
                reportsGenerated={reportsGenerated}
                unreadMessages={unreadMessages}
                totalCenters={totalCenters}
                activeStaff={activeStaff}
            />

            <AdminQuickActions
                onReviewEnrollments={onReviewEnrollments}
                onManageDaycares={onManageDaycares}
                onViewAssessmentAnalytics={onViewAssessmentAnalytics}
                onGenerateAnnualReport={onGenerateAnnualReport}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <AdminRecentUsers
                        users={recentUsers}
                        maxUsers={6}
                        onUserClick={onUserClick}
                    />
                </div>
            </div>
        </div>
    );
}
