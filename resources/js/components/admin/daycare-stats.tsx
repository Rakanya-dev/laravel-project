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
            title: 'Total Daycares',
            value: totalDaycares.toString(),
            icon: Building2,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            change: 'Active centers'
        },
        {
            title: 'Total Capacity',
            value: totalCapacity.toString(),
            icon: Users,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
            change: `${availableSpots} available spots`
        },
        {
            title: 'Current Students',
            value: totalStudents.toString(),
            icon: TrendingUp,
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            change: 'Enrolled'
        },
        {
            title: 'Avg Occupancy',
            value: `${averageOccupancy}%`,
            icon: BarChart3,
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600',
            change: 'Across all centers'
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-[11px] text-neutral-500 uppercase tracking-wider">
                                        {stat.title}
                                    </p>
                                    <p className="text-[32px] text-black -mt-1">{stat.value}</p>
                                    <p className="text-[11px] text-neutral-500">{stat.change}</p>
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
