import { Building2, Users, TrendingUp, BarChart3, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface DaycareStatsProps {
    totalDaycares: number;
    totalCapacity: number;
    totalStudents: number;
    averageOccupancy: number;
}

interface Stat {
    title: string;
    value: string;
    icon: LucideIcon;
    bgColor: string;
    iconColor: string;
    change: string;
}

export default function DaycareStats({
    totalDaycares,
    totalCapacity,
    totalStudents,
    averageOccupancy
}: DaycareStatsProps) {

    // Calculate available spots for the stat card change field
    const availableSpots = totalCapacity - totalStudents;

    const stats: Stat[] = [
        {
            title: 'Total Centers',
            value: totalDaycares.toString(),
            icon: Building2,
            bgColor: 'bg-indigo-50 dark:bg-indigo-500/20',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            change: 'Active daycare facilities'
        },
        {
            title: 'System Capacity',
            value: totalCapacity.toString(),
            icon: Users,
            bgColor: 'bg-blue-50 dark:bg-blue-500/20',
            iconColor: 'text-blue-600 dark:text-blue-400',
            change: `${availableSpots} total available spots`
        },
        {
            title: 'Total Enrolled',
            value: totalStudents.toString(),
            icon: TrendingUp,
            bgColor: 'bg-emerald-50 dark:bg-emerald-500/20',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            change: 'Active student records'
        },
        {
            title: 'Avg Occupancy',
            value: `${averageOccupancy}%`,
            icon: BarChart3,
            bgColor: 'bg-purple-50 dark:bg-purple-500/20',
            iconColor: 'text-purple-600 dark:text-purple-400',
            change: 'Across all active centers'
        }
    ];

    return (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={index}
                        className="group rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-md"
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase transition-colors">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 transition-colors">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                                        {stat.change}
                                    </p>
                                </div>
                                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${stat.bgColor} group-hover:scale-105`}>
                                    <Icon className={`size-6 ${stat.iconColor} transition-colors`} strokeWidth={2.5} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
