import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Child Profile',
    href: '/parent/child-profile',
  },
];

// Example mock child data
const childData = {
  name: 'Yahna Chaelin D. Arpon',
  age: 4,
  birthday: '2019-11-15',
  gender: 'Female',
  daycare: 'GMA Child Development Center',
  parentName: 'Maria Arpon',
  contact: '09171234567',
  address: 'Barangay San Isidro, GMA, Cavite',
};

export default function ChildProfile() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Child Profile" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="col-span-3 rounded-xl border p-4 shadow-sm dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
              Basic Information
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-500">Full Name</label>
                <p className="text-base text-neutral-800 dark:text-neutral-100">{childData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Age</label>
                <p className="text-base text-neutral-800 dark:text-neutral-100">{childData.age} years old</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Birthday</label>
                <p className="text-base text-neutral-800 dark:text-neutral-100">{childData.birthday}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Gender</label>
                <p className="text-base text-neutral-800 dark:text-neutral-100">{childData.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Daycare Center</label>
                <p className="text-base text-neutral-800 dark:text-neutral-100">{childData.daycare}</p>
              </div>
            </div>
          </div>

          <div className="col-span-3 rounded-xl border p-4 shadow-sm dark:border-neutral-700">
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
              Parent Information
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-500">Parent/Guardian</label>
                <p className="text-base text-neutral-800 dark:text-neutral-100">{childData.parentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-500">Contact</label>
                <p className="text-base text-neutral-800 dark:text-neutral-100">{childData.contact}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-neutral-500">Address</label>
                <p className="text-base text-neutral-800 dark:text-neutral-100">{childData.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
