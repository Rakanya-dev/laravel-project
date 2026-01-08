import { Users, Building2, GraduationCap, ClipboardList, TrendingUp, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


interface Stat {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    iconColor: string;
}

interface AdminOverviewStatsProps {
    totalUsers: number;
    activeUsers: number;
    activeDaycares: number;
    totalDaycares: number;
    totalStudents: number;
    activeStudents: number;
    totalAssessments: number;
    completedAssessments: number;
}

export default function AdminOverviewStats({
    totalUsers,
    activeUsers,
    activeDaycares,
    totalDaycares,
    totalStudents,
    activeStudents,
    totalAssessments,
    completedAssessments
}: AdminOverviewStatsProps) {
    const stats: Stat[] = [
        {
            title: 'Total Users',
            value: totalUsers.toString(),
            change: `${activeUsers} Active`,
            icon: Users,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Active Daycares',
            value: activeDaycares.toString(),
            change: `${totalDaycares} Total`,
            icon: Building2,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            title: 'Total Students',
            value: totalStudents.toString(),
            change: `${activeStudents} Active`,
            icon: GraduationCap,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Assessments',
            value: totalAssessments.toString(),
            change: `${completedAssessments} Completed`,
            icon: ClipboardList,
            color: 'bg-orange-500',
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600'
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
                                    <div className="flex items-center gap-1 text-[11px] text-green-600">
                                        <TrendingUp className="size-3" strokeWidth={2.5} />
                                        <span>{stat.change}</span>
                                    </div>
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
