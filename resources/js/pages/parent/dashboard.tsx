import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/parent/dashboard',
    },
];

// Sample dashboard cards
const dashboardCards = [
    {
        title: 'Upcoming Assessment',
        value: 'June 30, 2025',
        icon: '📅',
    },
    {
        title: 'Last Report Received',
        value: 'Cognitive – Satisfactory',
        icon: '🧠',
    },
    {
        title: 'Child Attendance',
        value: '92% This Month',
        icon: '📈',
    },
];

// Sample report history
const reports = [
    {
        type: 'Motor Skills',
        status: 'Completed',
        date: '2025-06-18',
    },
    {
        type: 'Emotional Development',
        status: 'Pending',
        date: '2025-06-20',
    },
    {
        type: 'Language Skills',
        status: 'Completed',
        date: '2025-06-10',
    },
];

export default function ParentDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Dashboard Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {dashboardCards.map((card, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-4 shadow-sm"
                        >
                            <div className="text-3xl">{card.icon}</div>
                            <h3 className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{card.title}</h3>
                            <p className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Report History Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    <h2 className="px-6 py-4 text-lg font-semibold text-neutral-800 dark:text-neutral-100">Report History</h2>
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900">
                            {reports.map((report, index) => (
                                <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-100">
                                        {report.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                report.status === 'Completed'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}
                                        >
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                                        {report.date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
