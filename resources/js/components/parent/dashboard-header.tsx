import { Link } from '@inertiajs/react';

interface Props {
    userName: string;
    studentCount: number;
    unreadMessages: number;
}

export default function DashboardHeader({ userName, studentCount, unreadMessages }: Props) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Welcome back, {userName}
                </h1>
                <p className="text-sm text-gray-500">
                    Here is the latest update on your {studentCount > 1 ? 'students' : 'student'}.
                </p>
            </div>

            <Link
                href={route('parent.messages')}
                className="group relative inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                <EnvelopeIcon />
                <span className="sr-only">messages</span>
                {unreadMessages > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadMessages}
                    </span>
                )}
            </Link>
        </div>
    );
}

const EnvelopeIcon = () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
