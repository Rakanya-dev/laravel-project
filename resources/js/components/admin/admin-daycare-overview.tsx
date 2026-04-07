import { Plus, School } from 'lucide-react';
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
    <div className="space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daycare Management
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage all daycare centers across the system
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
          onClick={onAddDaycare}
        >
          <Plus className="mr-2 size-4" />
          Add Daycare
        </Button>
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
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white flex items-center">
          All Daycare Centers
          <span className="text-slate-400 dark:text-slate-500 text-sm font-medium ml-2">
            ({daycares.length})
          </span>
        </h3>

        {daycares.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 text-center transition-colors">
            <div className="bg-slate-100 dark:bg-zinc-800/50 p-4 rounded-full mb-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <School className="size-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Daycare Centers</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
              You haven't added any daycare centers to the system yet. Add your first center to start managing CDWs and student enrollments.
            </p>
            <Button
              onClick={onAddDaycare}
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors h-11 px-6"
            >
              <Plus className="size-4 mr-2" />
              Add First Daycare
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
