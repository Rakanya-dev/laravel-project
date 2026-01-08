import { FileText, Users, TrendingUp, CheckCircle2, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

//  1. UPDATE INTERFACE to match the new backend structure
interface StatItem {
    value: number;
    change: number;
}

interface OverviewProps {
    stats: {
        total: StatItem;
        uniqueChildren: StatItem;
        avgScore: StatItem;
        completionRate: StatItem;
    };
    recentReports: any[];
}

export function ReportsOverviewTab({ stats, recentReports }: OverviewProps) {

    // Safeguard in case stats is completely undefined
    const safeStats = stats || {
        total: { value: 0, change: 0 },
        uniqueChildren: { value: 0, change: 0 },
        avgScore: { value: 0, change: 0 },
        completionRate: { value: 0, change: 0 },
    };

    const statCards = [
        {
            title: 'Total Assessments',
            // Access .value for the main number
            value: safeStats.total?.value ?? 0,
            // Access .change for the percentage
            changePct: safeStats.total?.change ?? 0,
            label: 'from last month',
            icon: FileText,
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200'
        },
        {
            title: 'Children Assessed',
            value: safeStats.uniqueChildren?.value ?? 0,
            changePct: safeStats.uniqueChildren?.change ?? 0,
            label: 'Active students',
            icon: Users,
            color: 'bg-green-50',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200'
        },
        {
            title: 'Average Score',
            value: safeStats.avgScore?.value ?? 0,
            changePct: 0, // Avg score change usually not tracked as %
            label: 'Standard score avg',
            icon: TrendingUp,
            color: 'bg-purple-50',
            iconColor: 'text-purple-600',
            borderColor: 'border-purple-200'
        },
        {
            title: 'Completion Rate',
            value: `${safeStats.completionRate?.value ?? 0}%`,
            changePct: safeStats.completionRate?.change ?? 0,
            label: 'Of started assessments',
            icon: CheckCircle2,
            color: 'bg-amber-50',
            iconColor: 'text-amber-600',
            borderColor: 'border-amber-200'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const isPositive = stat.changePct >= 0;

                    return (
                        <Card key={index} className={`border ${stat.borderColor}`}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.color} p-2 rounded-lg`}>
                                        <Icon className={`size-5 ${stat.iconColor}`} />
                                    </div>
                                    {/* Trend Badge */}
                                    {stat.changePct !== 0 && (
                                        <Badge variant="outline" className={`gap-1 ${isPositive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                            {Math.abs(stat.changePct)}%
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-[13px] text-neutral-500 mb-2">{stat.title}</p>
                                <p className="text-3xl font-semibold text-black mb-2">{stat.value}</p>
                                <p className="text-[10px] text-neutral-500">
                                    {stat.label}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
                            <Calendar className="size-4 text-neutral-500" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentReports.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No reports generated yet.</p>
                        ) : (
                            recentReports.map((report) => (
                                <div key={report.id} className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-black">{report.title}</p>
                                        <p className="text-xs text-neutral-500 mb-2">{report.type}</p>
                                        <p className="text-[10px] text-neutral-400">{report.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 mb-2">
                                            Completed
                                        </Badge>
                                        <p className="text-xs font-medium">Score: {report.avgScore}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Insights Placeholder */}
                <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">Quick Insights</CardTitle></CardHeader>
                    <CardContent>
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-xs border border-yellow-100 mb-3">
                            <strong>Attention:</strong> Review pending assessments for this month.
                        </div>
                        <div className="bg-green-50 text-green-800 p-3 rounded-md text-xs border border-green-100">
                            <strong>Tip:</strong> You are on track with your reporting schedule!
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
