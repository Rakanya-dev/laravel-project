import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/teacher/dashboard',
  },
];

export default function Dashboard() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Overview Cards */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">Total Children</h2>
            <p className="mt-2 text-3xl font-bold text-neutral-800 dark:text-white">32</p>
          </div>
          <div className="rounded-xl border p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Pending Assessments</h2>
            <p className="mt-2 text-3xl font-bold text-neutral-800 dark:text-white">5</p>
          </div>
          <div className="rounded-xl border p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">Completed Reports</h2>
            <p className="mt-2 text-3xl font-bold text-neutral-800 dark:text-white">27</p>
          </div>
        </div>

        {/* Chart Area */}
        <div className="rounded-xl border p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-2 text-neutral-800 dark:text-white">Assessment Overview</h2>
          <div className="flex h-64 items-center justify-center text-sm text-neutral-500 dark:text-neutral-400 border border-dashed rounded-lg">
            [ Chart goes here — Coming Soon ]
          </div>
        </div>

        {/* Recent Assessments Table */}
        <div className="rounded-xl border p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-white">Recent Assessments</h2>
          <table className="min-w-full text-sm text-left text-neutral-600 dark:text-neutral-300">
            <thead>
              <tr className="border-b dark:border-neutral-700">
                <th className="py-2">Child</th>
                <th className="py-2">Category</th>
                <th className="py-2">Score</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-neutral-700">
                <td className="py-2">Yahna Chaelin D. Arpon</td>
                <td className="py-2">Cognitive</td>
                <td className="py-2">88%</td>
                <td className="py-2">June 15, 2025</td>
              </tr>
              <tr className="border-b dark:border-neutral-700">
                <td className="py-2">Miguel S. Cruz</td>
                <td className="py-2">Physical</td>
                <td className="py-2">91%</td>
                <td className="py-2">June 14, 2025</td>
              </tr>
              <tr>
                <td className="py-2">Althea R. Santos</td>
                <td className="py-2">Socio-Emotional</td>
                <td className="py-2">85%</td>
                <td className="py-2">June 10, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
