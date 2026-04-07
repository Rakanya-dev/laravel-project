import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { formatPhoneNumber } from '@/utils/phone';
import ProfilePhotoUpload from '@/components/profile-photo-upload';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

interface ProfileForm {
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    phone?: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        first_name: auth.user.first_name || '',
        middle_name: auth.user.middle_name || '',
        last_name: auth.user.last_name || '',
        email: auth.user.email,
        phone: formatPhoneNumber(auth.user.phone),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6 transition-colors duration-200">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <ProfilePhotoUpload
                        user={auth.user}
                        key={auth.user.profile_photo}
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name" className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                                First Name
                            </Label>
                            <Input
                                id="first_name"
                                className="mt-1 block w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500/50 transition-colors"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                required
                                autoComplete="given-name"
                                placeholder="First name"
                            />
                            <InputError className="mt-2" message={errors.first_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="middle_name" className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                                Middle Name
                            </Label>
                            <Input
                                id="middle_name"
                                className="mt-1 block w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500/50 transition-colors"
                                value={data.middle_name}
                                onChange={(e) => setData('middle_name', e.target.value)}
                                autoComplete="additional-name"
                                placeholder="Middle name (optional)"
                            />
                            <InputError className="mt-2" message={errors.middle_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name" className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                                Last Name
                            </Label>
                            <Input
                                id="last_name"
                                className="mt-1 block w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500/50 transition-colors"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                required
                                autoComplete="family-name"
                                placeholder="Last name"
                            />
                            <InputError className="mt-2" message={errors.last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                                Email address
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500/50 transition-colors"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-slate-500 dark:text-slate-400 transition-colors">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 dark:decoration-indigo-500/50 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current!"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-colors">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                className="mt-1 block w-full bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-500/50 transition-colors"
                                value={data.phone}
                                onChange={(e) => setData('phone', formatPhoneNumber(e.target.value))}
                                autoComplete="tel"
                                placeholder="+63 9XX XXX XXXX"
                                maxLength={16}
                            />
                            <InputError className="mt-2" message={errors.phone} />
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm transition-colors"
                            >
                                Save Changes
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out duration-300"
                                enterFrom="opacity-0 -translate-x-2"
                                enterTo="opacity-100 translate-x-0"
                                leave="transition ease-in-out duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors">Saved.</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
