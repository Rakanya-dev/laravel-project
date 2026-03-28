import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User as InertiaUser } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Icons
import {
    AlertCircle, ClipboardList, ShieldCheck, TrendingUp,
    Building2, UserCheck, BarChart3, FileOutput,
    Clock, Activity, UserPlus
} from 'lucide-react';

// --- Interfaces ---
interface ComponentUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    daycare: string;
    role: string;
    lastActive: string;
    _rawDate: Date;
}

interface DashboardPageProps extends PageProps {
    adminName: string;

    // Obj A: Digital Tracking
    totalLearners: number;
    activeLearners: number;

    // 🚀 FIXED: The Main Approval Metric
    pendingEnrollments: number;

    // Obj B: Analytics
    totalAssessments: number;
    reportsGenerated: number;
    flaggedResults: number;

    // Obj D: System Mgmt
    totalCenters: number;
    activeStaff: number;

    recentUsers: InertiaUser[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }];

// --- Helper: Convert timestamps to "minutes ago" ---
const formatRelativeTime = (date: Date) => {
    // Check if the date is the "zero date" we set for "Never"
    if (date.getTime() === 0) return 'Never';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export default function AdminDashboard() {
    const {
        adminName,
        totalLearners = 0,
        activeLearners = 0,
        pendingEnrollments = 0,
        totalAssessments = 0,
        reportsGenerated = 0,
        flaggedResults = 0,
        totalCenters = 0,
        activeStaff = 0,
        recentUsers: rawRecentUsers = [],
    } = usePage<DashboardPageProps>().props;

    // --- Data Mapping & SORTING ---
    const recentUsers = rawRecentUsers
        .map((user): ComponentUser => {
            let userDaycare = 'Unassigned';

            if (user.daycare?.name) {
                userDaycare = user.daycare.name;
            } else if (user.students && user.students.length > 0 && user.students[0].daycare?.name) {
                userDaycare = user.students[0].daycare.name;
            }

            // 🚀 FIXED: Now it strictly looks at logins. If blank, sets to 0 (Never).
            const rawDateString = (user as any).last_login_at;
            const dateObj = rawDateString ? new Date(rawDateString) : new Date(0);

            return {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                daycare: userDaycare,
                role: user.role,
                lastActive: formatRelativeTime(dateObj),
                _rawDate: dateObj, // Keep the raw date for sorting
            };
        })
        // Sort the array descending (newest first) based on the raw date
        .sort((a, b) => b._rawDate.getTime() - a._rawDate.getTime());

    // --- Navigation Handlers ---
    const onReviewEnrollments = () => router.visit(route('admin.student.index', { tab: 'pending' }));
    const onManageDaycares = () => router.visit(route('admin.daycare.index'));
    const onViewAssessmentAnalytics = () => router.visit(route('admin.reports.index'));
    const onGenerateAnnualReport = () => window.open(route('admin.reports.consolidated-report'), '_blank');

    // --- Helper Functions for UI ---
    const getRoleBadge = (role: string) => {
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'teacher') return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 shadow-none">CDW / Teacher</Badge>;
        if (lowerRole === 'parent') return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">Parent</Badge>;
        return <Badge variant="outline" className="shadow-none">{role}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ECCD Admin Dashboard" />

            <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen space-y-8">

                {/* 1. Header & Pulse Cards */}
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">ECCD Admin Dashboard</h2>
                        <p className="font-medium text-slate-500 mt-1">Welcome back, Supervisor {adminName}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {pendingEnrollments > 0 && (
                            <Card className="flex items-center gap-3 border-amber-200 bg-amber-50 px-4 py-2.5 shadow-sm rounded-2xl">
                                <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                    <AlertCircle className="size-4" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">Action Needed</p>
                                    <p className="text-sm font-bold text-amber-900">{pendingEnrollments} Pending Enrollments</p>
                                </div>
                            </Card>
                        )}
                        {flaggedResults > 0 && (
                            <Card className="flex items-center gap-3 border-rose-200 bg-rose-50 px-4 py-2.5 shadow-sm rounded-2xl">
                                <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                                    <ClipboardList className="size-4" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold tracking-wider text-rose-800 uppercase">Developmental Flags</p>
                                    <p className="text-sm font-bold text-rose-900">{flaggedResults} Learners Need Review</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>

                {/* 2. Redesigned Overview Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Obj A: Digital Profiles */}
                    <Card className="relative overflow-hidden shadow-md border-transparent bg-white transition-all hover:-translate-y-1 hover:shadow-lg group">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                    <ShieldCheck className="size-6" strokeWidth={2} />
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-600 border border-emerald-100">
                                    <TrendingUp className="size-3" strokeWidth={2.5} />
                                    <span>{activeLearners} Active</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Digital Tracking</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tight">{totalLearners}</p>
                                <p className="text-sm font-medium text-slate-500 mt-1">Total Digital Profiles</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Obj B: Analytics */}
                    <Card className="relative overflow-hidden shadow-md border-transparent bg-white transition-all hover:-translate-y-1 hover:shadow-lg group">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <BarChart3 className="size-6" strokeWidth={2} />
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-600 border border-emerald-100">
                                    <Activity className="size-3" strokeWidth={2.5} />
                                    <span>{reportsGenerated} Reports</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data-Driven</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tight">{totalAssessments}</p>
                                <p className="text-sm font-medium text-slate-500 mt-1">Completed Assessments</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 🚀 FIXED: Pending Enrollments */}
                    <Card className="relative overflow-hidden shadow-md border-transparent bg-white transition-all hover:-translate-y-1 hover:shadow-lg group">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                                    <UserPlus className="size-6" strokeWidth={2} />
                                </div>
                                <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-600 border border-amber-100">
                                    <AlertCircle className="size-3" strokeWidth={2.5} />
                                    <span>Needs Review</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Enrollment Approvals</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tight">{pendingEnrollments}</p>
                                <p className="text-sm font-medium text-slate-500 mt-1">Pending Learners</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Obj D: System Control */}
                    <Card className="relative overflow-hidden shadow-md border-transparent bg-white transition-all hover:-translate-y-1 hover:shadow-lg group">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-violet-100 p-3 rounded-2xl text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                                    <Building2 className="size-6" strokeWidth={2} />
                                </div>
                                <div className="flex items-center gap-1.5 bg-violet-50 px-2.5 py-1 rounded-full text-[11px] font-bold text-violet-600 border border-violet-100">
                                    <UserCheck className="size-3" strokeWidth={2.5} />
                                    <span>{activeStaff} CDWs</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Control</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tight">{totalCenters}</p>
                                <p className="text-sm font-medium text-slate-500 mt-1">Managed Centers</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Quick Actions */}
                <Card className="shadow-sm border-slate-200 rounded-2xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                        <CardDescription>Common ECCD management tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="flex h-auto flex-col gap-3 py-6 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all rounded-xl shadow-sm" onClick={onReviewEnrollments}>
                                <div className="rounded-2xl bg-blue-100 p-3"><UserCheck className="size-6 text-blue-600" /></div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800">Review Enrollments</p>
                                    <p className="text-xs text-slate-500 mt-1">Approve pending learners</p>
                                </div>
                            </Button>
                            <Button variant="outline" className="flex h-auto flex-col gap-3 py-6 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all rounded-xl shadow-sm" onClick={onManageDaycares}>
                                <div className="rounded-2xl bg-emerald-100 p-3"><Building2 className="size-6 text-emerald-600" /></div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800">Manage Centers</p>
                                    <p className="text-xs text-slate-500 mt-1">CDCs and staff mapping</p>
                                </div>
                            </Button>
                            <Button variant="outline" className="flex h-auto flex-col gap-3 py-6 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all rounded-xl shadow-sm" onClick={onViewAssessmentAnalytics}>
                                <div className="rounded-2xl bg-purple-100 p-3"><BarChart3 className="size-6 text-purple-600" /></div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800">System Reports</p>
                                    <p className="text-xs text-slate-500 mt-1">ECCD Checklist results</p>
                                </div>
                            </Button>
                            <Button variant="outline" className="flex h-auto flex-col gap-3 py-6 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all rounded-xl shadow-sm" onClick={onGenerateAnnualReport}>
                                <div className="rounded-2xl bg-orange-100 p-3"><FileOutput className="size-6 text-orange-600" /></div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800">Generate Report</p>
                                    <p className="text-xs text-slate-500 mt-1">Official LGU consolidation</p>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Redesigned Recent Users (Activity Feed Style) */}
                <Card className="shadow-sm border-slate-200 rounded-2xl">
                    <CardHeader className="pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold">Activity Feed</CardTitle>
                            <CardDescription>Latest logins and registrations</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentUsers.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <p>No recent user activity</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {recentUsers.slice(0, 6).map((user) => (
                                    <div key={user.id} className="group flex flex-col justify-between bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-12 rounded-xl shadow-sm">
                                                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 font-bold rounded-xl text-lg">
                                                        {user.firstName[0]}{user.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-900 truncate max-w-[140px] leading-tight">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-500 truncate max-w-[140px] mt-0.5">
                                                        {user.daycare}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            {getRoleBadge(user.role)}

                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-indigo-500 transition-colors">
                                                <Clock className="size-3.5" />
                                                <span>{user.lastActive}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
