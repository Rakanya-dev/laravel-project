// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft } from 'lucide-react'; // 🚀 Added ArrowLeft
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    // 🚀 NEW: Safely cancel the sensitive action and return to the previous page
    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <div className="space-y-6">

                {/* 🚀 NEW: Back Button */}
                <button
                    type="button"
                    onClick={handleGoBack}
                    disabled={processing}
                    className="flex items-center text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground disabled:opacity-50"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </button>

                <form onSubmit={submit}>
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                value={data.password}
                                autoFocus
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button className="w-full" disabled={processing}>
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Confirming...
                                    </>
                                ) : (
                                    'Confirm password'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
