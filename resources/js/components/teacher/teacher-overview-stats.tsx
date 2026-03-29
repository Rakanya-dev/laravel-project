import { Users, Clock, CheckCircle2, Award, LucideIcon } from 'lucide-react';
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
      title: 'Total Roster',
      value: totalStudents.toString(),
      icon: Users,
      bgColor: 'bg-blue-50/80',
      iconColor: 'text-blue-600',
      change: daycareName
    },
    {
      title: 'Action Needed',
      value: assessmentsDue.toString(),
      change: 'Pending assessments',
      icon: Clock,
      bgColor: 'bg-amber-50/80',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Completed',
      value: completedAssessments.toString(),
      change: 'Fully assessed',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50/80',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Class Average',
      value: isNaN(classAverage) ? 'N/A' : classAverage.toString(),
      icon: Award,
      bgColor: 'bg-indigo-50/80',
      iconColor: 'text-indigo-600',
      change: 'Overall performance'
    }
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="relative overflow-hidden rounded-2xl border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-white"
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {stat.title}
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-[11px] font-medium text-slate-500 line-clamp-1">
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl border border-white/50 shadow-sm`}>
                  <Icon className={`size-5 sm:size-6 ${stat.iconColor}`} strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
