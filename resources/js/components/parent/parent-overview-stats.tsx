import { Star, Calendar as CalendarIcon, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  iconColor: string;
  borderColor: string;
  trend?: string;
}

interface ParentOverviewStatsProps {
  lastAssessmentDate?: string;
  overallScore?: string;
  activitiesCount?: number;
  milestonesMet?: number;
}

export default function ParentOverviewStats({
  lastAssessmentDate = 'N/A',
  overallScore = 'N/A',
  activitiesCount = 0,
  milestonesMet = 8
}: ParentOverviewStatsProps) {
  const stats: Stat[] = [
    {
      label: 'Overall Score',
      value: overallScore,
      icon: Star,
      color: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100',
      trend: '+2% from last month'
    },
    {
      label: 'Last Assessment',
      value: lastAssessmentDate,
      icon: CalendarIcon,
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      label: 'Recent Activities',
      value: activitiesCount.toString(),
      icon: CheckCircle2,
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-100'
    },
    {
      label: 'Milestones Met',
      value: milestonesMet.toString(),
      icon: TrendingUp,
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      trend: 'On track'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`border ${stat.borderColor} shadow-sm hover:shadow-md transition-all duration-200`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} p-3 rounded-xl shadow-sm`}>
                  <Icon className={`size-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
                    {stat.trend && (
                        <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                            {stat.trend}
                        </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
