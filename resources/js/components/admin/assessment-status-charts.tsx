import { Card, CardContent } from '@/components/ui/card';

interface StatsData {
    total: number;
    completed: number;
    draft: number;
    inProgress: number;
    rate: number;
}

export function AssessmentStatusCharts({ stats }: { stats: StatsData }) {
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="mb-6 font-medium text-black">System-Wide Assessment Status</h3>
                <div className="grid gap-6 md:grid-cols-4">
                    {/* Completion Rate */}
                    <div className="space-y-2">
                        <p className="font-bold text-[#ab50ff]">{stats.rate}%</p>
                        <p className="text-sm text-[#4d4d4d]">Completion Rate</p>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e7eb]">
                            <div className="h-full rounded-full bg-[#ab50ff] transition-all duration-300" style={{ width: `${stats.rate}%` }} />
                        </div>
                    </div>

                    {/* Draft */}
                    <div className="space-y-2">
                        <p className="font-bold text-black">{stats.draft}</p>
                        <p className="text-sm text-[#4d4d4d]">Draft</p>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e7eb]">
                            <div
                                className="h-full rounded-full bg-gray-400 transition-all duration-300"
                                style={{ width: stats.total > 0 ? `${(stats.draft / stats.total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="space-y-2">
                        <p className="font-bold text-[#2c84ff]">{stats.inProgress}</p>
                        <p className="text-sm text-[#4d4d4d]">In Progress</p>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e7eb]">
                            <div
                                className="h-full rounded-full bg-[#2c84ff] transition-all duration-300"
                                style={{ width: stats.total > 0 ? `${(stats.inProgress / stats.total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="space-y-2">
                        <p className="font-bold text-[#00c75a]">{stats.completed}</p>
                        <p className="text-sm text-[#4d4d4d]">Completed</p>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e7eb]">
                            <div
                                className="h-full rounded-full bg-[#00c75a] transition-all duration-300"
                                style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
