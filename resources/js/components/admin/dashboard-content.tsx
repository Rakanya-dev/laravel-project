import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { FileText, FolderOpen, MessageCircle, PlusCircle, School, User, Users } from 'lucide-react';

interface DashboardContentProps {
    teacherCount: number;
    parentCount: number;
    daycareCount: number;
    reportCount: number;
}

export default function DashboardContent({
    teacherCount,
    parentCount,
    daycareCount,
    reportCount
}: DashboardContentProps) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            {/*  Welcome */}
            <div>
                <h1 className="text-foreground text-3xl font-bold">Welcome back, Admin!</h1>
                <p className="text-muted-foreground">Here’s what’s happening today.</p>
            </div>

            {/* Data Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                    {
                        label: 'Teachers',
                        value: teacherCount,
                        icon: <Users className="text-primary h-8 w-8" />,
                    },
                    {
                        label: 'Daycares',
                        value: daycareCount,
                        icon: <School className="text-primary h-8 w-8" />,
                    },
                    {
                        label: 'Parents',
                        value: parentCount,
                        icon: <User className="text-primary h-8 w-8" />,
                    },
                    {
                        label: 'Reports',
                        value: reportCount,
                        icon: <FileText className="text-primary h-8 w-8" />,
                    },
                ].map(({ label, value, icon }, i) => (
                    <div
                        key={i}
                        className="bg-background flex items-center justify-between rounded-2xl border p-6 shadow-sm transition hover:shadow-md"
                    >
                        {/* Left: Icon + Label */}
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 rounded-lg p-3">{icon}</div>
                            <h2 className="text-foreground text-lg font-semibold">{label}</h2>
                        </div>
                        {/* Right: Count */}
                        <p className="text-primary text-5xl font-extrabold">{value}</p>
                    </div>
                ))}
            </div>

            {/* ⚡ Quick Actions */}
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-foreground text-xl font-semibold">Quick Actions</h2>
                    <p className="text-muted-foreground text-sm">Take action or navigate quickly from here.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        // --- FIX: Using relative URLs to avoid Ziggy errors ---
                        { href: '/admin/users-management', icon: <PlusCircle className="text-primary h-6 w-6" />, label: 'Add New User' },
                        { href: '/admin/daycare-management', icon: <School className="text-primary h-6 w-6" />, label: 'Manage Daycares' },
                        { href: '/admin/reports', icon: <FolderOpen className="text-primary h-6 w-6" />, label: 'View Reports' },
                        { href: '/admin/messages', icon: <MessageCircle className="text-primary h-6 w-6" />, label: 'Messages' },

                    ].map(({ href, icon, label }, i) => (
                        <Link
                            key={i}
                            href={href}
                            className="bg-background flex items-center gap-3 rounded-2xl border p-6 transition hover:shadow-md"
                        >
                            {icon}
                            <span className="text-foreground text-base font-semibold">{label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity & Top Daycares */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="bg-background col-span-1 rounded-xl border p-6 shadow-sm">
                    <h2 className="text-foreground mb-4 text-xl font-bold">Recent Activity</h2>
                    {/* ... (recent activity JSX) ... */}
                </div>
                <div className="bg-background col-span-2 rounded-xl border p-6 shadow-sm">
                    <h2 className="text-foreground mb-4 text-xl font-bold">Top Performing Daycares</h2>
                    {/* ... (top daycares JSX) ... */}
                </div>
            </div>
        </div>
    );
}
