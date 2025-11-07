import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Messages', href: '/admin/messages' },
];

// Summary
const messageStats = [
    { label: 'Unread Messages', value: 5 },
    { label: 'Archived', value: 12 },
    { label: 'Total Messages', value: 28 },
];

// Sample messages
const messages = [
    {
        sender: 'Parent - Anna Santos',
        subject: 'Request for Assessment Copy',
        date: '2025-06-20',
        status: 'Unread',
    },
    {
        sender: 'Teacher - Mary Cruz',
        subject: 'Late Attendance Notification',
        date: '2025-06-19',
        status: 'Read',
    },
    {
        sender: 'Parent - Leo Dela Peña',
        subject: 'Schedule a Meeting',
        date: '2025-06-18',
        status: 'Unread',
    },
    {
        sender: 'Teacher - Brian Flores',
        subject: 'Report Feedback',
        date: '2025-06-17',
        status: 'Archived',
    },
];

export default function Messages() {
    const [isOpen, setIsOpen] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const onSendMessage = () => {
        console.log('Sending Message:', { recipient, subject, body });
        // TODO: Connect to Laravel endpoint with Inertia form or axios
        setIsOpen(false);
        setRecipient('');
        setSubject('');
        setBody('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Messages</h2>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                    >
                        + Send Message
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {messageStats.map((stat, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900 p-4 shadow-sm"
                        >
                            <h3 className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</h3>
                            <p className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Message Table */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                        <thead className="bg-neutral-100 dark:bg-neutral-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Sender</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900">
                            {messages.map((msg, index) => (
                                <tr key={index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-100">{msg.sender}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">{msg.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">{msg.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                            msg.status === 'Unread'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                : msg.status === 'Archived'
                                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                            {msg.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Send Message Modal */}
                <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white dark:bg-neutral-900 p-6 shadow-xl">
                            <Dialog.Title className="text-lg font-semibold mb-4">Send Message</Dialog.Title>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-white">To (Name or Role)</label>
                                    <input
                                        type="text"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-sm"
                                        placeholder="e.g., Teacher Mary Cruz or Parent Anna Santos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-white">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-sm"
                                        placeholder="e.g., Schedule Update"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-white">Message</label>
                                    <textarea
                                        rows={4}
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-sm"
                                        placeholder="Write your message here..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-md border border-gray-300 bg-white dark:bg-neutral-800 px-4 py-2 text-sm text-gray-700 dark:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onSendMessage}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                                >
                                    Send
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </div>
        </AppLayout>
    );
}
