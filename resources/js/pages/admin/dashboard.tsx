import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User as InertiaUser } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import { useState, useEffect } from 'react'; // 🚀 FIXED: Imported useEffect
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Icons
import {
    ClipboardList, ShieldCheck, TrendingUp,
    Building2, UserCheck, BarChart3, FileOutput,
    Clock, Activity, UserPlus, MessageSquarePlus, Printer
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
    if (date.getTime() === 0) return 'Never';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';

    const diffInMinutes = Math.floor((diffInSeconds / 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export default function AdminDashboard() {
    const {
        auth, // 🚀 FIXED: Grabbed auth from props
        adminName,
        totalLearners = 0,
        activeLearners = 0,
        pendingEnrollments = 0,
        totalAssessments = 0,
        flaggedResults = 0,
        totalCenters = 0,
        activeStaff = 0,
        recentUsers: rawRecentUsers = [],
    } = usePage<DashboardPageProps>().props as any; // 🚀 FIXED: Added "as any" to prevent TS errors on auth

    // State for Interactive Elements
    // 🚀 1. Put the numbers you want to be INSTANT into local React State
    const [localPending, setLocalPending] = useState(pendingEnrollments);
    const [localFlags, setLocalFlags] = useState(flaggedResults);

    // 🚀 2. Keep local state perfectly synced with Laravel if a manual refresh happens
    useEffect(() => {
        setLocalPending(pendingEnrollments);
        setLocalFlags(flaggedResults);
    }, [pendingEnrollments, flaggedResults]);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        if (!auth?.user?.id || typeof window === 'undefined' || !(window as any).Echo) return;

        const echo = (window as any).Echo;
        const channelName = `App.Models.User.${auth.user.id}`;

        echo.private(channelName)
            .notification((notification: any) => {
                const type = notification.type || notification.data?.type;
                if (type === 'enrollment') {
                    setLocalPending((prev: number) => prev + 1);
                } else if (type === 'assessment') {
                    setLocalFlags((prev: number) => prev + 1);
                }

                router.reload({
                    only: [
                        'totalLearners', 'activeLearners', 'pendingEnrollments',
                        'totalAssessments', 'reportsGenerated', 'flaggedResults',
                        'totalCenters', 'activeStaff', 'recentUsers'
                    ]
                });
            });

        return () => {
            echo.leave(channelName);
        };
    }, [auth?.user?.id]);

    const recentUsers = rawRecentUsers
        .map((user: any): ComponentUser => {
            let userDaycare = 'Unassigned';

            if (user.daycare?.name) {
                userDaycare = user.daycare.name;
            } else if (user.students && user.students.length > 0 && user.students[0].daycare?.name) {
                userDaycare = user.students[0].daycare.name;
            }

            const rawDateString = (user as any).last_login_at;
            const dateObj = rawDateString ? new Date(rawDateString) : new Date(0);

            return {
                id: user.id,
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email,
                daycare: userDaycare,
                role: user.role,
                lastActive: formatRelativeTime(dateObj),
                _rawDate: dateObj,
            };
        })
        .sort((a: ComponentUser, b: ComponentUser) => b._rawDate.getTime() - a._rawDate.getTime());

    // Navigation Actions
    const onReviewEnrollments = () => router.visit(route('admin.student.index', { tab: 'pending' }));
    const onManageDaycares = () => router.visit(route('admin.daycare.index'));
    const onViewAssessmentAnalytics = () => router.visit(route('admin.reports.index'));

    // Interactive Action
    const confirmGenerateReport = () => {
        setIsReportModalOpen(false);
        toast.success('Report Generation Started', {
            description: 'The official consolidated LGU report is opening in a new tab.'
        });
        window.open(route('admin.reports.consolidated-report'), '_blank');
    };

    const getRoleBadge = (role: string) => {
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'teacher') return <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20 uppercase tracking-widest text-[11px] font-bold shadow-none transition-colors py-0.5 px-2.5">CDW / Teacher</Badge>;
        if (lowerRole === 'parent') return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 uppercase tracking-widest text-[11px] font-bold shadow-none transition-colors py-0.5 px-2.5">Parent</Badge>;
        return <Badge variant="outline" className="uppercase tracking-widest text-[11px] font-bold shadow-none dark:border-slate-700 dark:text-slate-300 py-0.5 px-2.5">{role}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 transition-colors duration-200 print:p-0 print:space-y-4">

                {/* 1. Header Area */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-4 print:hidden">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">Admin Dashboard</h2>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Welcome back, Supervisor {adminName}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {flaggedResults > 0 && (
                            <button onClick={onViewAssessmentAnalytics} className="flex items-center gap-4 border border-rose-200 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 px-5 py-3 shadow-sm rounded-2xl transition-colors text-left text-rose-900 dark:text-rose-300 group">
                                <div className="p-2.5 bg-rose-100 dark:bg-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 transition-colors group-hover:scale-110">
                                    <ClipboardList className="size-6" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-widest text-rose-600 uppercase">Developmental Flags</p>
                                    <p className="text-base font-bold">{flaggedResults} Learners Need Review</p>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Overview Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 print:gap-4">
                    <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors group print:shadow-none print:border-slate-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 px-6 sm:px-8 transition-colors">
                            <CardTitle className="text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Digital Tracking</CardTitle>
                            <ShieldCheck className="size-6 text-indigo-600 dark:text-indigo-400" />
                        </CardHeader>
                        <CardContent className="pt-6 pb-8 px-6 sm:px-8">
                            <div className="flex items-baseline justify-between">
                                <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{totalLearners}</div>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-none font-bold text-xs h-fit py-1 px-3">
                                    {activeLearners} Active
                                </Badge>
                            </div>
                            <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">Total Digital Profiles</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors group print:shadow-none print:border-slate-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 px-6 sm:px-8 transition-colors">
                            <CardTitle className="text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Data Metrics</CardTitle>
                            <BarChart3 className="size-6 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent className="pt-6 pb-8 px-6 sm:px-8">
                            <div className="flex items-baseline justify-between">
                                <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{totalAssessments}</div>
                            </div>
                            <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">Completed Assessments</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors group print:shadow-none print:border-slate-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 px-6 sm:px-8 transition-colors">
                            <CardTitle className="text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Enrollments</CardTitle>
                            <UserPlus className="size-6 text-amber-600 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent className="pt-6 pb-8 px-6 sm:px-8">
                            <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{pendingEnrollments}</div>
                            <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">Pending Approvals</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors group print:shadow-none print:border-slate-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 px-6 sm:px-8 transition-colors">
                            <CardTitle className="text-sm font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">System Control</CardTitle>
                            <Building2 className="size-6 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent className="pt-6 pb-8 px-6 sm:px-8">
                            <div className="flex items-baseline justify-between">
                                <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{totalCenters}</div>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{activeStaff} Assigned CDWs</span>
                            </div>
                            <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">Managed Centers</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Quick Actions */}
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 rounded-2xl transition-colors print:hidden">
                    <CardHeader className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900">
                        <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Quick Actions</CardTitle>
                        <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Common LGU and childcare management workflows.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8">
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                            <Button variant="outline" className="flex h-auto flex-col gap-4 py-8 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-zinc-900 transition-all rounded-2xl shadow-sm group" onClick={onReviewEnrollments}>
                                <div className="rounded-2xl bg-blue-100 dark:bg-blue-500/20 p-4 group-hover:scale-105 transition-transform"><UserCheck className="size-7 text-blue-600 dark:text-blue-400" /></div>
                                <div className="text-center">
                                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">Review Enrollments</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">Verify application uploads</p>
                                </div>
                            </Button>
                            <Button variant="outline" className="flex h-auto flex-col gap-4 py-8 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-white dark:hover:bg-zinc-900 transition-all rounded-2xl shadow-sm group" onClick={onManageDaycares}>
                                <div className="rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 p-4 group-hover:scale-105 transition-transform"><Building2 className="size-7 text-emerald-600 dark:text-emerald-400" /></div>
                                <div className="text-center">
                                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">Manage Centers</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">CDCs mapping & details</p>
                                </div>
                            </Button>
                            <Button variant="outline" className="flex h-auto flex-col gap-4 py-8 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-white dark:hover:bg-zinc-900 transition-all rounded-2xl shadow-sm group" onClick={onViewAssessmentAnalytics}>
                                <div className="rounded-2xl bg-purple-100 dark:bg-purple-500/20 p-4 group-hover:scale-105 transition-transform"><BarChart3 className="size-7 text-purple-600 dark:text-purple-400" /></div>
                                <div className="text-center">
                                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">System Reports</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">ECCD Checklist metrics</p>
                                </div>
                            </Button>
                            <Button variant="outline" className="flex h-auto flex-col gap-4 py-8 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-white dark:hover:bg-zinc-900 transition-all rounded-2xl shadow-sm group" onClick={() => setIsReportModalOpen(true)}>
                                <div className="rounded-2xl bg-orange-100 dark:bg-orange-500/20 p-4 group-hover:scale-105 transition-transform"><FileOutput className="size-7 text-orange-600 dark:text-orange-400" /></div>
                                <div className="text-center">
                                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">Generate Report</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">Official LGU breakdown</p>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Activity Feed */}
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 rounded-2xl transition-colors print:hidden">
                    <CardHeader className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Activity Feed</CardTitle>
                            <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Real-time authentication actions and core logs</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8">
                        {recentUsers.length === 0 ? (
                            <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                                <p className="font-bold text-xl">No recent user activity found</p>
                                <p className="text-base font-medium text-slate-400 mt-2">Logs will fill automatically upon external dashboard login events.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {recentUsers.slice(0, 6).map((user: ComponentUser) => {
                                    const initFirst = user.firstName?.charAt(0) || '';
                                    const initLast = user.lastName?.charAt(0) || '';
                                    const fallbackInitials = (initFirst + initLast).toUpperCase() || '?';

                                    return (
                                        <div key={user.id} className="group flex flex-col justify-between bg-slate-50 dark:bg-zinc-950/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-md transition-all duration-200">
                                            <div className="flex items-start justify-between mb-5 overflow-hidden">
                                                <div className="flex items-center gap-5 overflow-hidden w-full">
                                                    <Avatar className="size-14 shadow-sm border border-indigo-100 dark:border-indigo-500/20 transition-colors rounded-xl shrink-0">
                                                        <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-black rounded-xl text-lg">
                                                            {fallbackInitials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="overflow-hidden min-w-0 flex-1">
                                                        <p className="font-extrabold text-lg text-slate-900 dark:text-slate-100 truncate leading-snug transition-colors">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate mt-1 transition-colors">
                                                            {user.daycare}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
                                                {getRoleBadge(user.role)}

                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    <Clock className="size-4" />
                                                    <span>{user.lastActive}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* --- INTERACTIVE: Dialog Modal --- */}
            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogContent hideClose className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <FileOutput className="size-6" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Generate Consolidated Report</h2>
                        </div>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                            This action compiles all ECCD checklists into a single official PDF document, detailing system-wide developmental domain averages formally broken down by daycare branch.                        </p>
                    </div>
                    <div className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsReportModalOpen(false)} className="rounded-xl font-bold h-11 px-6">
                            Cancel
                        </Button>
                        <Button onClick={confirmGenerateReport} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold h-11 px-6 shadow-sm">
                            Generate Document
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
