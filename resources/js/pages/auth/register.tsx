import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState, useMemo } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type Daycare = {
    id: string | number;
    name: string;
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
    access_code: string;
    child_first_name: string;
    child_middle_name: string;
    child_last_name: string;
    child_birth_date: string;
    child_gender: string;
    child_daycare_id: string;
};

export default function Register({ daycares }: Props) {
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        contact_number: '63',
        password: '',
        password_confirmation: '',
        access_code: '',
        child_first_name: '',
        child_middle_name: '',
        child_last_name: '',
        child_birth_date: '',
        child_gender: '',
        child_daycare_id: '',
    });

    const daycareOptions = useMemo(() => {
        return daycares.map((daycare) => (
            <option key={daycare.id} value={daycare.id}>
                {daycare.name}
            </option>
        ));
    }, [daycares]);

    const getFormattedPhone = (val: string) => {
        const raw = val.startsWith('63') ? val.substring(2) : val;
        if (raw.length === 0) return '';
        if (raw.length <= 3) return raw;
        if (raw.length <= 6) return `${raw.slice(0, 3)} ${raw.slice(3)}`;
        return `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6, 10)}`;
    };

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
        if (isStepOneValid()) setStep(2);
    };

    const prevStep = () => setStep(1);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const hasAccessCode = !!(data.access_code && data.access_code.trim() !== '');
    const isManualDisabled = hasAccessCode;

    const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <AuthLayout title="Create an account" description={step === 1 ? 'Enter your details below' : 'Tell us about your child'}>
            <Head title="Register" />

            <form className="flex flex-col gap-6" onSubmit={submit}>

                {/* --- STEP 1: PARENT INFO --- */}
                {step === 1 && (
                    <div className="space-y-5">
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

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
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
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="flex h-4 items-center justify-center border-r border-gray-300 pr-2 text-sm text-gray-500">+63</span>
                                </div>
                                <Input
                                    id="contact_number"
                                    type="tel"
                                    className="pl-14 tabular-nums"
                                    placeholder="912 345 6789"
                                    maxLength={12}
                                    value={getFormattedPhone(data.contact_number)}
                                    onChange={(e) => {
                                        let raw = e.target.value.replace(/\D/g, '');
                                        if (raw.startsWith('0')) raw = raw.substring(1);
                                        if (raw.length > 10) raw = raw.substring(0, 10);
                                        setData('contact_number', '63' + raw);
                                    }}
                                    required
                                    autoComplete="tel"
                                />
                            </div>
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
                                autoComplete="new-password"
                            />
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
                        </div>

                        <Button type="button" onClick={nextStep} className="mt-4 w-full py-6 text-base" disabled={!isStepOneValid()}>
                            Next Step <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* --- STEP 2: CHILD INFO --- */}
                {step === 2 && (
                    <div className="space-y-6">

                        {/* Access Code */}
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
                            <h3 className="mb-2 text-sm font-bold text-blue-900">Have a Student Code?</h3>
                            <p className="mb-3 text-xs text-blue-700">Enter your code (e.g., JD-8821) to skip manual entry.</p>
                            <div className="grid gap-2">
                                <Label htmlFor="access_code" className="text-blue-900">Access Code (Optional)</Label>
                                <Input
                                    id="access_code"
                                    placeholder="JD-1234"
                                    value={data.access_code}
                                    onChange={(e) => setData('access_code', e.target.value.toUpperCase())}
                                    className="bg-white font-mono uppercase tracking-wider"
                                    autoComplete="off"
                                />
                                <InputError message={errors.access_code} />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className={`mx-4 flex-shrink-0 text-xs font-medium uppercase tracking-widest ${isManualDisabled ? 'text-gray-300' : 'text-gray-400'}`}>
                                Or enter manually
                            </span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* Manual Entry Section */}
                        <div className={`space-y-5 ${isManualDisabled ? 'opacity-40' : ''}`}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="child_first_name">Child First Name</Label>
                                    <Input
                                        id="child_first_name"
                                        placeholder="Pedro"
                                        value={data.child_first_name}
                                        onChange={(e) => setData('child_first_name', e.target.value)}
                                        required={!isManualDisabled}
                                        disabled={isManualDisabled}
                                    />
                                    <InputError message={errors.child_first_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="child_last_name">Child Last Name</Label>
                                    <Input
                                        id="child_last_name"
                                        placeholder="Santos"
                                        value={data.child_last_name}
                                        onChange={(e) => setData('child_last_name', e.target.value)}
                                        required={!isManualDisabled}
                                        disabled={isManualDisabled}
                                    />
                                    <InputError message={errors.child_last_name} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="child_middle_name">Middle Name (Optional)</Label>
                                <Input
                                    id="child_middle_name"
                                    placeholder="Reyes"
                                    value={data.child_middle_name}
                                    onChange={(e) => setData('child_middle_name', e.target.value)}
                                    disabled={isManualDisabled}
                                />
                            </div>

                            {/* ROW: Date of Birth + Gender */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="child_birth_date">Date of Birth</Label>
                                    <Input
                                        id="child_birth_date"
                                        type="date"
                                        className="block w-full"
                                        value={data.child_birth_date}
                                        onChange={(e) => setData('child_birth_date', e.target.value)}
                                        required={!isManualDisabled}
                                        disabled={isManualDisabled}
                                    />
                                    <InputError message={errors.child_birth_date} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="child_gender">Gender</Label>
                                    <select
                                        id="child_gender"
                                        value={data.child_gender}
                                        onChange={(e) => setData('child_gender', e.target.value)}
                                        disabled={isManualDisabled}
                                        required={!isManualDisabled}
                                        className={selectClass}
                                    >
                                        <option value="" disabled hidden>Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <InputError message={errors.child_gender} />
                                </div>
                            </div>

                            {/* ROW: Daycare Selection */}
                            <div className="grid gap-2">
                                <Label htmlFor="child_daycare_id">Select Daycare Center</Label>
                                <select
                                    id="child_daycare_id"
                                    value={data.child_daycare_id}
                                    onChange={(e) => setData('child_daycare_id', e.target.value)}
                                    disabled={isManualDisabled}
                                    required={!isManualDisabled}
                                    className={selectClass}
                                >
                                    <option value="" disabled hidden>Choose a daycare...</option>
                                    {daycareOptions}
                                </select>
                                <InputError message={errors.child_daycare_id} />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={prevStep} className="w-1/3 py-6">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>

                            <Button type="submit" disabled={processing} className="w-2/3 py-6 text-base font-semibold">
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {hasAccessCode ? 'Link Account' : 'Create New Account'}
                            </Button>
                        </div>
                    </div>
                )}
            </form>

            <div className="text-muted-foreground mt-8 text-center text-sm">
                Already have an account?{' '}
                <Link href={route('login')} className="hover:text-primary underline underline-offset-4">
                    Log in
                </Link>
            </div>
        </AuthLayout>
    );
}
