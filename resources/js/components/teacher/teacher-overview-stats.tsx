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
      bgColor: 'bg-blue-50/80 dark:bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
      change: daycareName
    },
    {
      title: 'Action Needed',
      value: assessmentsDue.toString(),
      change: 'Pending assessments',
      icon: Clock,
      bgColor: 'bg-amber-50/80 dark:bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    {
      title: 'Completed',
      value: completedAssessments.toString(),
      change: 'Fully assessed',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50/80 dark:bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Class Average',
      value: isNaN(classAverage) ? 'N/A' : classAverage.toString(),
      icon: Award,
      bgColor: 'bg-indigo-50/80 dark:bg-indigo-500/10',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      change: 'Overall performance'
    }
  ];

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 transition-colors">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="group relative overflow-hidden rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-white dark:bg-zinc-900"
          >
            <CardContent className="p-5 sm:p-6 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">
                    {stat.title}
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight transition-colors">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 transition-colors">
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl border border-white/50 dark:border-white/5 shadow-sm transition-colors group-hover:scale-105 duration-300`}>
                  <Icon className={`size-5 sm:size-6 ${stat.iconColor} transition-colors`} strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
