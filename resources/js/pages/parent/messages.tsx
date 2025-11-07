import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Messages',
    href: '/parent/message',
  },
];

// Mock message data
const messages = [
  {
    id: 1,
    sender: 'Teacher Marie',
    subject: 'Weekly Assessment Reminder',
    message: 'Hi, please check Yahna’s updated scores for this week.',
    date: 'June 21, 2025',
    isRead: false,
  },
  {
    id: 2,
    sender: 'Teacher Marie',
    subject: 'Reminder: Parent-Teacher Meeting',
    message: 'Reminder that our Zoom meeting will be held this Friday.',
    date: 'June 18, 2025',
    isRead: true,
  },
];

export default function Messages() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Inbox</h1>

        <div className="grid gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border p-4 shadow-sm transition hover:shadow-md dark:border-neutral-700 ${
                msg.isRead ? 'bg-white dark:bg-neutral-900' : 'bg-blue-50 dark:bg-blue-900/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-neutral-800 dark:text-white">{msg.subject}</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{msg.message}</p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">From: {msg.sender}</p>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{msg.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
