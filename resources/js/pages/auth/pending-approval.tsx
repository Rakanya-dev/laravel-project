import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PendingApproval() {

    useEffect(() => {
        // 1. Define the check function
        const checkStatus = async () => {
            try {
                const response = await fetch('/auth/check-status?t=' + new Date().getTime());
                const data = await response.json();

                console.log("Server Status:", data.status);

                if (data.status === 'active') {
                    window.location.href = route('dashboard');
                }
            } catch (error) {
                console.error("Status check failed", error);
            }
        };

        // 2. Run this check every 3 seconds
        const interval = setInterval(checkStatus, 3000);

        // Cleanup
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <Head title="Pending Approval" />

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-10 shadow-md sm:max-w-md sm:rounded-lg text-center">

                {/* Animation */}
                <div className="mb-6 flex justify-center">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                        <div className="absolute h-full w-full animate-ping rounded-full bg-blue-100 opacity-75"></div>
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Waiting for Approval
                </h2>

                <p className="text-gray-600 mb-4">
                    Thanks for signing up! Your account is currently <strong>Pending</strong>.
                </p>

                <p className="text-xs text-gray-400">
                    We are checking your status automatically...<br />
                    (Check your F12 Console if nothing happens)
                </p>

                <div className="mt-8 border-t pt-4">
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="text-sm text-gray-500 underline hover:text-gray-800"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
