import {
    Building2,
    ClipboardList,
    MessageSquare,
    ShieldCheck,
    TrendingUp,
    LucideIcon,
    BellRing
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Stat {
    title: string;
    value: string;
    change: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    iconColor: string;
    objectiveLabel: string;
}

// 🚀 UPDATED: Props tailored specifically for the Kidtrak System objectives
interface AdminOverviewStatsProps {
    totalLearners: number;       // For Obj A: Digital tracking
    activeLearners: number;
    totalAssessments: number;    // For Obj B: Analytics & milestones
    reportsGenerated: number;
    unreadMessages: number;      // For Obj C: Messaging & alerts
    totalCenters: number;        // For Obj D: System management
    activeStaff: number;
}

export default function AdminOverviewStats({
    totalLearners = 0,
    activeLearners = 0,
    totalAssessments = 0,
    reportsGenerated = 0,
    unreadMessages = 0,
    totalCenters = 0,
    activeStaff = 0
}: AdminOverviewStatsProps) {

    // Mapped strictly to Kidtrak Objectives A, B, C, and D
    const stats: Stat[] = [
        {
            title: 'Digital Profiles',
            value: totalLearners.toString(),
            change: `${activeLearners} Secured Active Records`,
            icon: ShieldCheck,
            color: 'bg-indigo-500',
            bgColor: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            objectiveLabel: 'Digital Tracking' // Objective A
        },
        {
            title: 'Assessment Analytics',
            value: totalAssessments.toString(),
            change: `${reportsGenerated} Progress Reports Generated`,
            icon: ClipboardList,
            color: 'bg-emerald-500',
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            objectiveLabel: 'Data-Driven' // Objective B
        },
        {
            title: 'Managed Centers',
            value: totalCenters.toString(),
            change: `${activeStaff} CDW Accounts Managed`,
            icon: Building2,
            color: 'bg-violet-500',
            bgColor: 'bg-violet-50',
            iconColor: 'text-violet-600',
            objectiveLabel: 'System Control' // Objective D
        }
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="relative overflow-hidden shadow-sm border-slate-200 hover:border-slate-300 transition-colors group">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    {/* Small objective tag above the title */}
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${stat.iconColor} opacity-80 mb-1`}>
                                        {stat.objectiveLabel}
                                    </p>

                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        {stat.title}
                                    </p>
                                    <p className="text-[32px] font-black text-slate-900 leading-tight -mt-1">
                                        {stat.value}
                                    </p>

                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-2">
                                        <TrendingUp className="size-3 text-emerald-500" strokeWidth={2.5} />
                                        <span>{stat.change}</span>
                                    </div>
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-xl transition-transform group-hover:scale-110 duration-300`}>
                                    <Icon className={`size-6 ${stat.iconColor}`} strokeWidth={2} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
