import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    // 👇 1. Add a state to track the cooldown seconds
    const [cooldown, setCooldown] = useState(0);

    // 👇 2. Create a timer effect that counts down every second
    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'), {
            // 👇 3. Only start the cooldown if the email actually sent successfully
            onSuccess: () => setCooldown(60),
        });
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                {/* 👇 4. Disable the button if processing OR if cooldown is active */}
                <Button
                    disabled={processing || cooldown > 0}
                    variant="secondary"
                    type="submit"
                >
                    {processing && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}

                    {/* 👇 5. Change the text dynamically based on the cooldown */}
                    {cooldown > 0
                        ? `Resend available in ${cooldown}s`
                        : 'Resend verification email'}
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}
