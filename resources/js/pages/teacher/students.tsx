import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'My Students',
    href: '/teacher/students',
  },
];

const students = [
  {
    name: 'Yahna Chaelin D. Arpon',
    age: 4,
    status: 'Active',
    gender: 'Female',
  },
  {
    name: 'Elijah R. Cruz',
    age: 5,
    status: 'Active',
    gender: 'Male',
  },
  {
    name: 'Alyanna G. Torres',
    age: 3,
    status: 'Inactive',
    gender: 'Female',
  },
];

export default function Students() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Students" />
      <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-800 dark:text-white">My Students</h1>
          <Input type="text" placeholder="Search student..." className="max-w-sm" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {students.map((student, index) => (
            <Card key={index} className="shadow-sm transition hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {student.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base font-semibold">{student.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{student.gender} • {student.age} yrs old</p>
                </div>
              </CardHeader>
              <CardContent>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    student.status === 'Active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {student.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
