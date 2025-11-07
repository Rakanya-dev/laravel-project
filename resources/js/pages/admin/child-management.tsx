import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Child Management',
        href: '/admin/child-management',
    },
];

// Stats summary
const childStats = [
    { label: 'Total Children', value: 78 },
    { label: 'Active', value: 64 },
    { label: 'Withdrawn', value: 8 },
];

// Mock children data
const children = [
    { name: 'Yahna Arpon', age: 4, daycare: 'Little Stars Daycare', status: 'Active' },
    { name: 'Kleo Dela Cruz', age: 5, daycare: 'Bright Minds Center', status: 'Inactive' },
    { name: 'Jiro Santos', age: 3, daycare: 'Happy Tots Academy', status: 'Active' },
    { name: 'Tala Mendoza', age: 4, daycare: 'Bright Minds Center', status: 'Withdrawn' },
    { name: 'Rico Tan', age: 3, daycare: 'Little Stars Daycare', status: 'Active' },
];

export default function ChildManagement() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Child Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Top Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {childStats.map((stat, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-4 shadow-sm"
                        >
                            <h3 className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</h3>
                            <p className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Children Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                                    Age
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                                    Daycare
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900">
                            {children.map((child, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-100">
                                        {child.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                                        {child.age}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                                        {child.daycare}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                child.status === 'Active'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : child.status === 'Inactive'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}
                                        >
                                            {child.status}
                                        </span>
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
