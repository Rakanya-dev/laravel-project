import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DaycareStats from './daycare-stats';
import DaycareCard from './daycare-card';
import type { Daycare } from '@/pages/admin/daycare-management'; // Import the shared type

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-black text-2xl font-semibold">Daycare Management</h2>
          <p className="text-neutral-600">Manage all daycare centers across the system</p>
        </div>
        <Button className="bg-black hover:bg-black/90 gap-2" onClick={onAddDaycare}>
          <Plus className="size-4" />
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
        <h3 className="text-lg mb-4">All Daycare Centers ({daycares.length})</h3>
        {daycares.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-neutral-500 mb-4">No daycare centers yet</p>
            <Button onClick={onAddDaycare} variant="outline">
              <Plus className="size-4 mr-2" />
              Add First Daycare
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
