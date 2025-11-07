import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Assessment Management',
    href: '/teacher/assessment-management',
  },
];

export default function AssessmentManagement() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Assessment Management" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Page Header with Action Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Assessments
          </h1>
          <Button>Add New Assessment</Button>
        </div>

        {/* Overview Cards */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              Total Assessments
            </h2>
            <p className="mt-2 text-3xl font-bold text-neutral-800 dark:text-white">
              21
            </p>
          </div>
          <div className="rounded-xl border p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
              Pending
            </h2>
            <p className="mt-2 text-3xl font-bold text-neutral-800 dark:text-white">
              4
            </p>
          </div>
          <div className="rounded-xl border p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
              Completed
            </h2>
            <p className="mt-2 text-3xl font-bold text-neutral-800 dark:text-white">
              17
            </p>
          </div>
        </div>

        {/* Assessment Table */}
        <div className="rounded-xl border p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-white">
            Recent Assessments
          </h2>
          <table className="min-w-full text-sm text-left text-neutral-600 dark:text-neutral-300">
            <thead>
              <tr className="border-b dark:border-neutral-700">
                <th className="py-2">Child Name</th>
                <th className="py-2">Category</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-neutral-700">
                <td className="py-2">Yahna C. Arpon</td>
                <td className="py-2">Cognitive</td>
                <td className="py-2 text-yellow-600 dark:text-yellow-400">Pending</td>
                <td className="py-2">June 20, 2025</td>
              </tr>
              <tr className="border-b dark:border-neutral-700">
                <td className="py-2">Miguel S. Cruz</td>
                <td className="py-2">Physical</td>
                <td className="py-2 text-green-600 dark:text-green-400">Completed</td>
                <td className="py-2">June 18, 2025</td>
              </tr>
              <tr>
                <td className="py-2">Althea R. Santos</td>
                <td className="py-2">Language</td>
                <td className="py-2 text-green-600 dark:text-green-400">Completed</td>
                <td className="py-2">June 17, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
