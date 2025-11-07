import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import type { Daycare } from '@/types';

export default function DaycareManagement() {
    const { daycares } = usePage<{ daycares: Daycare[] }>().props;

    return (
        <AppLayout breadcrumbs={[{ title: 'Daycare Management', href: '/admin/daycare-management' }]}>
            <Head title="Daycare Management" />
            <div className="flex flex-col gap-6 p-4">
                {daycares.map((daycare) => (
                    <Link
                        key={daycare.id}
                        href={`/admin/daycare-management/${daycare.id}`}
                        className="block border rounded-xl p-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                    >
                        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                            {daycare.name}
                        </h2>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">{daycare.address}</p>
                    </Link>
                ))}
            </div>
        </AppLayout>
    );
}
