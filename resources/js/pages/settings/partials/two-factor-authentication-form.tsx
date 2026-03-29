import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { OTP_MAX_LENGTH, useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { useForm, usePage } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState, FormEventHandler } from 'react';

export default function TwoFactorAuthenticationForm() {
    const { auth } = usePage().props as any;
    const [confirming, setConfirming] = useState(false);

    const {
        qrCodeSvg,
        manualSetupKey,
        recoveryCodesList,
        hasSetupData,
        fetchSetupData,
        fetchRecoveryCodes,
        clearSetupData,
    } = useTwoFactorAuth();

    // 👇 Form for Enabling/Disabling
    const toggleForm = useForm({});

    // 👇 Form for Confirming the 6-digit code
    const confirmForm = useForm({
        code: '',
    });

    const enableTwoFactorAuthentication = () => {
        toggleForm.post(route('two-factor.enable'), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirming(true);
                fetchSetupData();
            },
        });
    };

    const confirmTwoFactorAuthentication: FormEventHandler = (e) => {
        e.preventDefault();
        confirmForm.post(route('two-factor.confirm'), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirming(false);
                clearSetupData();
            },
        });
    };

    const disableTwoFactorAuthentication = () => {
        toggleForm.delete(route('two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => setConfirming(false),
        });
    };
    const [showingRecoveryCodes, setShowingRecoveryCodes] = useState(false);

    return (
        <section className="space-y-6">
            <header>
                <h2 className="text-lg font-medium text-foreground">Two-Factor Authentication</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add additional security to your account using two-factor authentication.
                </p>
            </header>

            {/* 1. Status Message */}
            <h3 className="text-sm font-medium">
                {auth.user.two_factor_confirmed_at
                    ? 'You have enabled two-factor authentication.'
                    : 'You have not enabled two-factor authentication.'}
            </h3>

            {/* 2. Setup Phase (QR Code & OTP Input) */}
            {confirming && hasSetupData && (
                <div className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        To finish enabling two-factor authentication, scan the following QR code using your phone's authenticator application and provide the generated OTP code.
                    </p>

                    <div className="mt-4 inline-block bg-white p-2" dangerouslySetInnerHTML={{ __html: qrCodeSvg || '' }} />

                    <div className="mt-4">
                        <Label>Setup Key: <span className="font-mono font-bold">{manualSetupKey}</span></Label>
                    </div>

                    <form onSubmit={confirmTwoFactorAuthentication} className="mt-4 space-y-4">
                        <Label htmlFor="code">Authentication Code</Label>
                        <InputOTP
                            maxLength={OTP_MAX_LENGTH}
                            value={confirmForm.data.code}
                            onChange={(v) => confirmForm.setData('code', v)}
                            pattern={REGEXP_ONLY_DIGITS}
                        >
                            <InputOTPGroup>
                                {Array.from({ length: OTP_MAX_LENGTH }).map((_, i) => (
                                    <InputOTPSlot key={i} index={i} />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                        <InputError message={confirmForm.errors.code} />

                        <Button disabled={confirmForm.processing}>Confirm Setup</Button>
                    </form>
                </div>
            )}
            {/* 3. Recovery Codes Section */}
            {auth.user.two_factor_confirmed_at && showingRecoveryCodes && recoveryCodesList.length > 0 && (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground italic">
                        Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two-factor authentication device is lost.
                    </p>
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-4 font-mono text-sm border">
                        {recoveryCodesList.map((code) => (
                            <div key={code} className="select-all cursor-pointer hover:text-primary">
                                {code}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. Action Buttons */}
            <div className="flex items-center gap-4">
                {!auth.user.two_factor_confirmed_at && !confirming ? (
                    <Button onClick={enableTwoFactorAuthentication} disabled={toggleForm.processing}>
                        Enable
                    </Button>
                ) : (
                    <>
                        {auth.user.two_factor_confirmed_at && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (!showingRecoveryCodes) {
                                        fetchRecoveryCodes(); // Fetch them if they aren't loaded
                                    }
                                    setShowingRecoveryCodes(!showingRecoveryCodes); // Toggle the view
                                }}
                            >
                                {showingRecoveryCodes ? 'Hide Recovery Codes' : 'Show Recovery Codes'}
                            </Button>
                        )}
                        <Button variant="destructive" onClick={disableTwoFactorAuthentication} disabled={toggleForm.processing}>
                            Disable
                        </Button>
                    </>
                )}
            </div>
        </section>
    );
}
