import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import TwoFactorAuthenticationForm from './partials/two-factor-authentication-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: '/settings/two-factor',
    },
];

export default function TwoFactor() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Two-Factor Authentication"
                        description="Manage your account's security settings"
                    />

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <TwoFactorAuthenticationForm />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
