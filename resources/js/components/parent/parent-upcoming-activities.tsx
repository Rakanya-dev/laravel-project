import { Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: number;
  title: string;
  time: string;
  type: 'class' | 'event' | 'assessment';
  color: string;
}

interface ParentUpcomingActivitiesProps {
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  { id: 1, title: 'Music Class', time: '10:00 AM', type: 'class', color: 'bg-blue-500' },
  { id: 2, title: 'Outdoor Play', time: '2:00 PM', type: 'event', color: 'bg-green-500' },
  { id: 3, title: 'Story Time', time: '3:30 PM', type: 'class', color: 'bg-purple-500' }
];

export function ParentUpcomingActivities({
  activities = defaultActivities
}: ParentUpcomingActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5 text-blue-600" />
          Upcoming Activities
        </CardTitle>
        <CardDescription>Today's schedule for your child</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-1 h-12 ${activity.color} rounded-full`} />
              <div>
                <p className="text-black">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {activity.type}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
