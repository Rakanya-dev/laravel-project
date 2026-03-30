import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

// 👈 Import your new formatting function from wherever you saved it
import { formatPhoneNumber } from '@/utils/phone';

type RegisterForm = {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your personal details to get started. You will enroll your child on the next screen.">
            <Head title="Register" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="space-y-5">

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                placeholder="Juan"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                required
                                autoComplete="given-name"
                            />
                            <InputError message={errors.first_name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                placeholder="Dela Cruz"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                required
                                autoComplete="family-name"
                            />
                            <InputError message={errors.last_name} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="middle_name">Middle Name (Optional)</Label>
                        <Input
                            id="middle_name"
                            placeholder="Santos"
                            value={data.middle_name}
                            onChange={(e) => setData('middle_name', e.target.value)}
                            autoComplete="additional-name"
                        />
                    </div>

                    {/* Contact Info */}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="juan@example.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Contact Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            className="tabular-nums"
                            placeholder="+63 912 345 6789"
                            maxLength={16} // limits exactly to "+63 912 345 6789" length
                            value={formatPhoneNumber(data.phone)} // 👈 Using your new function here
                            onChange={(e) => {
                                // 1. Strip everything except numbers
                                let raw = e.target.value.replace(/\D/g, '');

                                // 2. Since your formatter adds +63, we need to strip it out
                                // before saving to state, so we don't double up!
                                if (raw.startsWith('63')) {
                                    raw = raw.substring(2);
                                } else if (raw.startsWith('0')) {
                                    raw = raw.substring(1);
                                }

                                // 3. Ensure they can't type more than 10 digits after the 63
                                if (raw.length > 10) raw = raw.substring(0, 10);

                                // 4. Save to state exactly how Laravel expects it
                                setData('phone', '63' + raw);
                            }}
                            required
                            autoComplete="tel"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    {/* Passwords */}
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            placeholder="********"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" disabled={processing} className="mt-4 w-full py-6 text-base font-semibold bg-indigo-600 hover:bg-indigo-700">
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </div>
            </form>

            <div className="text-muted-foreground mt-8 text-center text-sm">
                Already have an account?{' '}
                <Link href={route('login')} className="font-medium text-indigo-600 hover:text-indigo-500 underline underline-offset-4">
                    Log in
                </Link>
            </div>
        </AuthLayout>
    );
}
