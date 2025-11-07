import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type Daycare = {
    id: string | number;
    daycare_name: string;
};

type Props = {
    daycares: Daycare[];
};

type RegisterForm = {
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    password: string;
    password_confirmation: string;

    child_first_name: string;
    child_middle_name: string;
    child_last_name: string;
    child_birth_date: string;
    child_daycare_id: string;
};

export default function Register({ daycares }: Props) {
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        password: '',
        password_confirmation: '',

        child_first_name: '',
        child_middle_name: '',
        child_last_name: '',
        child_birth_date: '',
        child_daycare_id: '',
    });

    const isStepOneValid = () => {
        return (
            data.first_name.trim() !== '' &&
            data.last_name.trim() !== '' &&
            data.email.trim() !== '' &&
            data.contact_number.trim() !== '' &&
            data.password !== '' &&
            data.password_confirmation !== '' &&
            data.password === data.password_confirmation
        );
    };

    const nextStep = () => {
        if (isStepOneValid()) {
            setStep(2);
        }
    };

    const prevStep = () => setStep(1);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onSuccess: () => {
                window.location.href = route('login');
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description={`Step ${step}: ${step === 1 ? 'Parent Information' : 'Child Information'}`}>
            <Head title="Register" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                {step === 1 && (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" placeholder="Juan" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required />
                            <InputError message={errors.first_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <Input id="middle_name" placeholder="Santos" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                            <InputError message={errors.middle_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" placeholder="Dela Cruz" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required />
                            <InputError message={errors.last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="juan@example.com" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <Input
                                id="contact_number"
                                type="tel"
                                placeholder="09123456789"
                                pattern="63[0-9]{9}"
                                maxLength={11}
                                inputMode="numeric"
                                value={data.contact_number}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 11) setData('contact_number', value);
                                }}
                                required
                            />
                            <InputError message={errors.contact_number} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
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
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button type="button" onClick={nextStep} className="w-full" disabled={!isStepOneValid()}>
                            Next
                        </Button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="child_first_name">Child First Name</Label>
                            <Input
                                id="child_first_name"
                                placeholder="Pedro"
                                value={data.child_first_name}
                                onChange={(e) => setData('child_first_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.child_first_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="child_middle_name">Child Middle Name</Label>
                            <Input
                                id="child_middle_name"
                                placeholder="Reyes"
                                value={data.child_middle_name}
                                onChange={(e) => setData('child_middle_name', e.target.value)}
                            />
                            <InputError message={errors.child_middle_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="child_last_name">Child Last Name</Label>
                            <Input
                                id="child_last_name"
                                placeholder="Santos"
                                value={data.child_last_name}
                                onChange={(e) => setData('child_last_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.child_last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="child_birth_date">Date of Birth</Label>
                            <Input
                                id="child_birth_date"
                                type="date"
                                value={data.child_birth_date}
                                onChange={(e) => setData('child_birth_date', e.target.value)}
                                required
                            />
                            <InputError message={errors.child_birth_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="child_daycare_id">Select Daycare</Label>
                            <select
                                id="child_daycare_id"
                                value={data.child_daycare_id}
                                onChange={(e) => setData('child_daycare_id', e.target.value)}
                                required
                                className="rounded border px-3 py-2 dark:bg-zinc-900 dark:text-white"
                            >
                                <option value="" disabled hidden>
                                    Select a daycare
                                </option>
                                {daycares.map((daycare) => (
                                    <option key={daycare.id} value={daycare.id}>
                                        {daycare.daycare_name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.child_daycare_id} />
                        </div>

                        <div className="mt-4 flex justify-between">
                            <Button type="button" onClick={prevStep}>
                                Back
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </div>
                    </>
                )}
            </form>

            <div className="text-muted-foreground mt-4 text-center text-sm">
                Already have an account? <TextLink href={route('login')}>Log in</TextLink>
            </div>
        </AuthLayout>
    );
}
