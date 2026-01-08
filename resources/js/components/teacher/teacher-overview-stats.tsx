import { Users, Clock, CheckCircle, Award, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface Stat {
  title: string;
  value: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  change?: string;
}

interface TeacherOverviewStatsProps {
  totalStudents: number;
  assessmentsDue: number;
  completedAssessments: number;
  classAverage: number;
  daycareName: string;
}

export function TeacherOverviewStats({
  totalStudents,
  assessmentsDue,
  completedAssessments,
  classAverage,
  daycareName
}: TeacherOverviewStatsProps) {
  const stats: Stat[] = [
    {
      title: 'My Students',
      value: totalStudents.toString(),
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: daycareName
    },
    {
      title: 'Assessments Due',
      value: assessmentsDue.toString(),
      change: 'This week',
      icon: Clock,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Completed',
      value: completedAssessments.toString(),
      change: 'This month',
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Class Average',
      value: isNaN(classAverage) ? 'N/A' : classAverage.toString(),
      icon: Award,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: 'Overall performance'
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-[32px] text-black -mt-1">{stat.value}</p>
                  {stat.change && (
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`size-5 ${stat.iconColor}`} strokeWidth={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
