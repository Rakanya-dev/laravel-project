import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Reports',
    href: '/teacher/reports',
  },
];

export default function TeacherReports() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Reports" />
      <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-800 dark:text-white">Assessment Reports</h1>
          <Input
            type="text"
            placeholder="Search child name..."
            className="max-w-sm"
          />
        </div>

        <div className="overflow-x-auto rounded-xl border dark:border-neutral-700">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-300">Child Name</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-300">Daycare</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-300">Last Assessment</th>
                <th className="px-4 py-3 font-medium text-neutral-600 dark:text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-neutral-700">
              {[
                {
                  name: 'Yahna Chaelin D. Arpon',
                  daycare: 'GMA CDC',
                  lastAssessment: 'June 2025',
                },
                {
                  name: 'Elijah R. Cruz',
                  daycare: 'GMA CDC',
                  lastAssessment: 'May 2025',
                },
              ].map((child, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-neutral-800 dark:text-white">{child.name}</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{child.daycare}</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">{child.lastAssessment}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 size-4" />
                      View
                    </Button>
                    <Button size="sm">
                      <Download className="mr-2 size-4" />
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
