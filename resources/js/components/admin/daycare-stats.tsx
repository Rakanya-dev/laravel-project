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

    // 🚀 Removed hardcoded colors to keep the data array perfectly clean
    const stats: Stat[] = [
        {
            title: 'Total Centers',
            value: totalDaycares.toString(),
            icon: Building2,
            change: 'Active daycare facilities'
        },
        {
            title: 'System Capacity',
            value: totalCapacity.toString(),
            icon: Users,
            change: `${availableSpots} total available spots`
        },
        {
            title: 'Total Enrolled',
            value: totalStudents.toString(),
            icon: TrendingUp,
            change: 'Active student records'
        },
        {
            title: 'Avg Occupancy',
            value: `${averageOccupancy}%`,
            icon: BarChart3,
            change: 'Across all active centers'
        }
    ];

    return (
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 print:gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={index}
                        // 🚀 Added hover:border-indigo-300 to match your other cards
                        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 group print:shadow-none print:border-slate-300 print:hover:translate-y-0 print:break-inside-avoid"
                    >
                        <CardContent className="p-6 sm:p-8">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1 mt-1">
                                    {/* 🚀 Bumped title from text-[11px] to text-sm */}
                                    <p className="text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase transition-colors">
                                        {stat.title}
                                    </p>

                                    {/* 🚀 Unified at text-5xl for maximum readability */}
                                    <p className="text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight transition-colors">
                                        {stat.value}
                                    </p>

                                    {/* 🚀 Bumped subtitle from text-sm to text-base */}
                                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                                        {stat.change}
                                    </p>
                                </div>

                                {/* 🚀 Icon Base: Neutral Slate, lights up to Indigo on hover */}
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 print:bg-slate-100 print:text-slate-600">
                                    {/* 🚀 Kept size-7 but smoothed out the transition */}
                                    <Icon className="size-7 transition-colors duration-300" strokeWidth={2.5} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
