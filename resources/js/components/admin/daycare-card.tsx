import { Users, Building2, TrendingUp, MoreVertical, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

import type { Daycare } from '@/pages/admin/daycare-management';



interface DaycareCardProps {
  daycare: Daycare;
  onView: (daycare: Daycare) => void;
  onEdit: (daycare: Daycare) => void;
  onDelete: (id: number) => void;
}

export default function DaycareCard({ daycare, onView, onEdit, onDelete }: DaycareCardProps) {  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const getCapacityBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-red-50 text-red-700 border-red-200">Near Capacity</Badge>;
    if (percentage >= 75) return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Filling Up</Badge>;
    return <Badge className="bg-green-50 text-green-700 border-green-200">Available</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="size-5 text-blue-600" />
              <CardTitle className="text-lg">{daycare.name}</CardTitle>
            </div>
            <CardDescription className="flex items-center gap-1">
              <span>{daycare.location}</span>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(daycare)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(daycare)}>
                Edit Daycare
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(daycare.id)} className="text-red-600">
                Delete Daycare
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Teacher */}
        <div>
          <p className="text-sm text-neutral-500 mb-1">Assigned Teacher</p>
          <p className="text-black">{daycare.teacher}</p>
        </div>

        {/* Capacity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-neutral-400" />
              <span className="text-sm">Capacity</span>
            </div>
            {getCapacityBadge(daycare.percentage)}
          </div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className={getCapacityColor(daycare.percentage)}>
              {daycare.current} / {daycare.capacity} students
            </span>
            <span className="text-neutral-500">{daycare.percentage}%</span>
          </div>
          <Progress value={daycare.percentage} className="h-2" />
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onView(daycare)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
