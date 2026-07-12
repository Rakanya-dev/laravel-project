import { Users, Clock, CheckCircle2, Award, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface Stat {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  bgClass: string;
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
      title: 'Total Students',
      value: totalStudents.toString(),
      icon: Users,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-500/20',
      change: daycareName
    },
    {
      title: 'Action Needed',
      value: assessmentsDue.toString(),
      icon: Clock,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-500/20',
      change: 'Pending assessments'
    },
    {
      title: 'Completed',
      value: completedAssessments.toString(),
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-500/20',
      change: 'Fully assessed'
    },
    {
      title: 'Class Average',
      value: isNaN(classAverage) ? 'N/A' : classAverage.toString(),
      icon: Award,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-50 dark:bg-indigo-500/20',
      change: 'Overall performance'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 transition-colors">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700"
          >
            <CardContent className="p-6 sm:p-7 flex flex-col justify-between h-full transition-colors">
              <div className="flex items-start justify-between mb-5">
                <div className={`p-4 rounded-2xl ${stat.bgClass} shrink-0 transition-colors`}>
                  <Icon className={`size-7 ${stat.iconColor} transition-colors`} strokeWidth={2.5} />
                </div>
              </div>

              <div className="flex flex-col mt-auto">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 transition-colors">
                  {stat.title}
                </p>

                <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                  {stat.value}
                </div>

                {stat.change && (
                  <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 truncate transition-colors">
                    {stat.change}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
