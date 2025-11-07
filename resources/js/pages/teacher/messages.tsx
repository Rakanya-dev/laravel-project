import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Messages',
    href: '/teacher/messages',
  },
];

export default function Messages() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />
      <div className="flex h-full flex-1 gap-4 rounded-xl p-4">
        {/* Left Sidebar: Message Threads */}
        <div className="w-full max-w-xs flex-shrink-0 rounded-xl border p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="mb-3 text-lg font-semibold text-neutral-800 dark:text-white">
            Inbox
          </h2>
          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
            {['Parent Arpon', 'Parent Cruz', 'Parent Santos'].map((name, i) => (
              <div
                key={i}
                className="cursor-pointer rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <p className="font-medium text-neutral-800 dark:text-white">{name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Last message preview here...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content: Conversation */}
        <div className="flex flex-1 flex-col rounded-xl border p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mb-2 border-b pb-2 dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">
              Conversation with Parent Arpon
            </h2>
          </div>

          {/* Messages Display */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-2">
            <div className="self-start max-w-[75%] rounded-lg bg-neutral-100 p-2 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-white">
              Hi Teacher, may I know how my child is doing?
            </div>
            <div className="self-end max-w-[75%] rounded-lg bg-blue-600 p-2 text-sm text-white">
              Sure! Yahna is doing very well in her social and language skills.
            </div>
          </div>

          {/* Input Field */}
          <div className="mt-3 flex gap-2 border-t pt-3 dark:border-neutral-700">
            <Input placeholder="Type your message..." className="flex-1" />
            <Button type="button">Send</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
