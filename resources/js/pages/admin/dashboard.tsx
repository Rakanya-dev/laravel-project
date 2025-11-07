import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { FileText, FolderOpen, MessageCircle, PlusCircle, School, User, Users } from 'lucide-react';

const reportData = [
    { name: 'Mon', reports: 5 },
    { name: 'Tue', reports: 8 },
    { name: 'Wed', reports: 3 },
    { name: 'Thu', reports: 7 },
    { name: 'Fri', reports: 6 },
    { name: 'Sat', reports: 2 },
    { name: 'Sun', reports: 4 },
];

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }];

export default function AdminDashboard() {
    const { teacherCount, parentCount, daycareCount, reportCount } = usePage().props as unknown as {
        teacherCount: number;
        parentCount: number;
        daycareCount: number;
        reportCount: number;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* ✅ Welcome */}
                <div>
                    <h1 className="text-foreground text-3xl font-bold">Welcome back, Admin!</h1>
                    <p className="text-muted-foreground">Here’s what’s happening today.</p>
                </div>

                {/* 📊 Data Cards */}
                {/* 📊 Data Cards */}
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
                            { href: '/admin/users/create', icon: <PlusCircle className="text-primary h-6 w-6" />, label: 'Add New User' },
                            { href: '/admin/daycares', icon: <School className="text-primary h-6 w-6" />, label: 'Manage Daycares' },
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
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* 🔄 Recent Activity (1/3 width) */}
                    <div className="bg-background col-span-1 rounded-xl border p-6 shadow-sm">
                        <h2 className="text-foreground mb-4 text-xl font-bold">Recent Activity</h2>
                        <ul className="text-muted-foreground space-y-3 text-sm">
                            <li>
                                📝 Teacher <strong>Ms. Cruz</strong> was added.
                            </li>
                            <li>
                                📊 Report for <strong>Yahna Arpon</strong> generated.
                            </li>
                            <li>
                                👤 Parent <strong>Juan Dela Cruz</strong> created.
                            </li>
                            <li>
                                🏫 Daycare <strong>Tiny Stars</strong> updated info.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-background col-span-2 rounded-xl border p-6 shadow-sm">
                        <h2 className="text-foreground mb-4 text-xl font-bold">Top Performing Daycares</h2>
                        <div className="space-y-4">
                            {[
                                { name: 'Bright Kids Learning Center', reports: 12 },
                                { name: 'Tiny Stars Daycare', reports: 9 },
                                { name: 'Little Explorers Academy', reports: 7 },
                                { name: 'Kiddie Haven', reports: 5 },
                                { name: 'Sunshine Tots', reports: 3 },
                            ].map((daycare, index) => {
                                const maxReports = 12; // or dynamically get the max
                                const percentage = (daycare.reports / maxReports) * 100;
                                return (
                                    <div key={index}>
                                        <div className="mb-1 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="text-muted-foreground w-6 text-right text-lg font-bold">{index + 1}.</div>
                                                <span className="text-foreground font-medium">{daycare.name}</span>
                                            </div>
                                            <span className="text-primary font-bold">{daycare.reports} Reports</span>
                                        </div>
                                        <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
                                            <div
                                                className="bg-primary h-full rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
