import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Child, Daycare } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function ShowDaycare() {
    const { daycare } = usePage<{ daycare: Daycare }>().props;

    const formatName = (child: Child) => [child.first_name, child.middle_name, child.last_name].filter(Boolean).join(' ');

    const calculateAge = (birthdate: string) => {
        const birth = new Date(birthdate);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // 👇 Dynamic breadcrumbs based on daycare name
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Daycare Management', href: '/admin/daycare-management' },
        { title: daycare.name, href: `/admin/daycare-management/${daycare.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={daycare.name} />
            <div className="space-y-6 p-4">
                <Link href="/admin/daycare-management" className="text-blue-500 hover:underline">
                    ← Back to Daycare List
                </Link>

                <div className="mt-2 sm:mt-4 md:mt-6" />

                <div className="rounded-xl bg-white p-4 shadow dark:bg-neutral-900">
                    <h2 className="text-xl font-bold">{daycare.name}</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">{daycare.address}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Contact Person: {daycare.contact_person}
                        <br />
                        Contact Number: {daycare.contact_number}
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-neutral-600 uppercase dark:text-neutral-300">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-neutral-600 uppercase dark:text-neutral-300">
                                    Age
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-neutral-600 uppercase dark:text-neutral-300">
                                    Birthdate
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-700 dark:bg-neutral-900">
                            {daycare.children.map((child: Child) => (
                                <tr key={child.id}>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-neutral-800 dark:text-neutral-100">
                                        {formatName(child)}
                                    </td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                                        {calculateAge(child.birthdate)} years old
                                    </td>
                                    <td className="px-6 py-4 text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                                        {new Date(child.birthdate).toLocaleDateString()}
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
