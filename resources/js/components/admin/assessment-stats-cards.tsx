import { ClipboardList, BarChart3, Users, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsData {
    total: number;
    completed: number;
    avgScore: number;
    uniqueChildren: number;
}

interface AssessmentStatsCardsProps {
    stats: StatsData;
    evaluatorCount: number;
}

export function AssessmentStatsCards({ stats, evaluatorCount }: AssessmentStatsCardsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Total Assessments</p>
                            <p className="text-[32px] text-black -mt-1">{stats.total}</p>
                            <p className="text-[11px] text-neutral-500">{stats.completed} completed</p>
                        </div>
                        <div className="bg-[#c4dfff] p-3 rounded-lg">
                            <ClipboardList className="size-5 text-[#1C71FA]" strokeWidth={2} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider">System Average</p>
                            <p className="text-[32px] text-black -mt-1">{stats.avgScore}</p>
                            <p className="text-[11px] text-green-600">Overall performance</p>
                        </div>
                        <div className="bg-[#c4dfff] p-3 rounded-lg">
                            <BarChart3 className="size-5 text-[#0075FF]" strokeWidth={2} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Active Evaluators</p>
                            <p className="text-[32px] text-black -mt-1">{evaluatorCount}</p>
                            <p className="text-[11px] text-neutral-500">Teachers conducting assessments</p>
                        </div>
                        <div className="bg-[#c4dfff] p-3 rounded-lg">
                            <Users className="size-5 text-[#1C71FA]" strokeWidth={2} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Children Assessed</p>
                            <p className="text-[32px] text-black -mt-1">{stats.uniqueChildren}</p>
                            <p className="text-[11px] text-neutral-500">Across all daycare centers</p>
                        </div>
                        <div className="bg-[#ffcda2] p-3 rounded-lg">
                            <GraduationCap className="size-5 text-[#FF8821]" strokeWidth={2} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
