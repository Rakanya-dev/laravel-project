import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'My Child\'s Assessment',
    href: '/parent/assessment',
  },
];

// Example assessment data
const assessments = [
  {
    id: 1,
    type: 'Cognitive Skills',
    score: '85%',
    remarks: 'Above average cognitive development for age group.',
    date: 'June 10, 2025',
  },
  {
    id: 2,
    type: 'Physical Development',
    score: '78%',
    remarks: 'Normal motor coordination, slight improvement needed in fine motor tasks.',
    date: 'June 14, 2025',
  },
  {
    id: 3,
    type: 'Socio-Emotional',
    score: '92%',
    remarks: 'Excellent interaction with peers and adults.',
    date: 'June 18, 2025',
  },
];

export default function ChildAssessment() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Child's Assessment" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
        <h1 className="text-xl font-semibold text-neutral-800 dark:text-white">Assessment Summary</h1>

        <div className="grid gap-4 md:grid-cols-3">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="rounded-xl border p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">{assessment.type}</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Score: <strong>{assessment.score}</strong></p>
              <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-300">{assessment.remarks}</p>
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Assessed on: {assessment.date}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border border-dashed rounded-xl p-4 dark:border-neutral-700">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            For detailed reports, please visit the <span className="font-semibold text-blue-600 dark:text-blue-400">Reports</span> section.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
