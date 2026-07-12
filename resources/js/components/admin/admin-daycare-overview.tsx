import { Plus, School, Building2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DaycareStats from './daycare-stats';
import DaycareCard from './daycare-card';
import type { Daycare } from '@/pages/admin/daycare-management';

interface DaycareOverviewProps {
  daycares: Daycare[];
  onAddDaycare: () => void;
  onViewDaycare: (daycare: Daycare) => void;
  onEditDaycare: (daycare: Daycare) => void;
  onDeleteDaycare: (id: number) => void;
  totalDaycares: number;
  totalCapacity: number;
  totalStudents: number;
  averageOccupancy: number;
}

export default function DaycareOverview({
  daycares,
  onAddDaycare,
  onViewDaycare,
  onEditDaycare,
  onDeleteDaycare,
  totalDaycares,
  totalCapacity,
  totalStudents,
  averageOccupancy,
}: DaycareOverviewProps) {
  return (
    <div className="space-y-8 transition-colors duration-200 print:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
            Daycare Centers
          </h2>
          <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Manage all daycare centers across the system.
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto lg:justify-end">
            <Button
              className="h-12 w-full sm:w-auto px-6 rounded-xl bg-indigo-600 text-white font-bold shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
              onClick={onAddDaycare}
            >
              <Plus className="mr-2 size-5" />
              Add Daycare
            </Button>
        </div>
      </div>

      {/* Stats */}
      <DaycareStats
        totalDaycares={totalDaycares}
        totalCapacity={totalCapacity}
        totalStudents={totalStudents}
        averageOccupancy={averageOccupancy}
      />

      {/* Daycares Grid */}
      <div>
        <div className="flex items-center mb-6 gap-3">
            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
              All Daycare Centers
            </h3>
            <span className="flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-full px-3 py-1 border border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
              {daycares.length}
            </span>
        </div>

        {daycares.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-zinc-950/50 text-center transition-colors print:hidden">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                <School className="size-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2 transition-colors">No Daycare Centers</h3>
            <p className="text-base font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-md transition-colors">
              You haven't added any daycare centers to the system yet. Add your first center to start managing CDWs and student enrollments.
            </p>
            <Button
              onClick={onAddDaycare}
              variant="outline"
              className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors font-bold text-base h-12 px-8 shadow-sm"
            >
              <Plus className="size-5 mr-3" />
              Add First Daycare
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 print:grid-cols-2">
            {daycares.map((daycare) => (
              <DaycareCard
                key={daycare.id}
                daycare={daycare}
                onView={onViewDaycare}
                onEdit={onEditDaycare}
                onDelete={onDeleteDaycare}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
