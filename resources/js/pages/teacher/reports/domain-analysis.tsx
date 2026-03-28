import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BrainCircuit, Lightbulb, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface AnalysisProps {
    chartData: { domain: string; average: number }[];
    insight: string;
    currentType: string;
    studentCount: number;
}

export default function DomainAnalysisReport({ chartData, insight, currentType, studentCount }: AnalysisProps) {

    const handleTypeChange = (val: string) => {
        router.get(route('teacher.reports.analysis'), { type: val }, { preserveState: true });
    };

    // Safely find highest and lowest for the Quick Stats cards
    const sortedData = [...chartData].sort((a, b) => b.average - a.average);
    const highestDomain = sortedData[0];
    const lowestDomain = sortedData[sortedData.length - 1];

    // Calculate overall class average
    const overallAverage = chartData.length > 0
        ? (chartData.reduce((acc, curr) => acc + curr.average, 0) / chartData.length).toFixed(1)
        : 0;

    // Color logic: Top is Emerald, Bottom is Rose, Rest are Indigo
    const getBarColor = (domainName: string) => {
        if (domainName === highestDomain?.domain) return '#10b981'; // Emerald 500
        if (domainName === lowestDomain?.domain) return '#f43f5e'; // Rose 500
        return '#818cf8'; // Indigo 400
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '#' }, { title: 'Class Analysis', href: '#' }]}>
            <Head title={`Class Analysis - ${currentType}`} />

            <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">

                {/* --- TOP NAVIGATION --- */}
                <div className="flex items-center justify-between pb-2">
                    <Link
                        href={route('teacher.my-students.index')}
                        className="group -ml-4 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        Back to My Students
                    </Link>
                </div>

                {/* --- HERO HEADER --- */}
                <div className="flex flex-col justify-between gap-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shadow-inner">
                            <BrainCircuit className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Class Performance Analysis</h2>
                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                                <Users className="size-4" />
                                Aggregated data from <strong className="text-slate-700">{studentCount} evaluations</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full sm:w-auto">
                        <Select value={currentType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-violet-500 sm:w-[220px]">
                                <SelectValue placeholder="Select Assessment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1st Assessment">1st Evaluation</SelectItem>
                                <SelectItem value="2nd Assessment">2nd Evaluation</SelectItem>
                                <SelectItem value="3rd Assessment">3rd Evaluation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-24 text-slate-500">
                        <BrainCircuit className="mb-4 size-12 opacity-20" />
                        <p className="text-lg font-medium text-slate-700">No data available for this period.</p>
                        <p className="text-sm mt-1">Complete more student evaluations to generate class insights.</p>
                    </div>
                ) : (
                    <>
                        {/* --- QUICK STATS ROW --- */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {/* Strongest Area */}
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">Strongest Domain</p>
                                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-200/50 text-emerald-700">
                                        <TrendingUp className="size-4" />
                                    </div>
                                </div>
                                <h3 className="mt-4 text-2xl font-black text-emerald-950 truncate" title={highestDomain?.domain}>
                                    {highestDomain?.domain || '-'}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-emerald-700">
                                    Class Average: <strong className="text-emerald-900">{highestDomain?.average || 0}</strong> / 19
                                </p>
                            </div>

                            {/* Priority Area */}
                            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold uppercase tracking-wider text-rose-600">Priority Area</p>
                                    <div className="flex size-8 items-center justify-center rounded-full bg-rose-200/50 text-rose-700">
                                        <TrendingDown className="size-4" />
                                    </div>
                                </div>
                                <h3 className="mt-4 text-2xl font-black text-rose-950 truncate" title={lowestDomain?.domain}>
                                    {lowestDomain?.domain || '-'}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-rose-700">
                                    Class Average: <strong className="text-rose-900">{lowestDomain?.average || 0}</strong> / 19
                                </p>
                            </div>

                            {/* Overall Average */}
                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">Overall Standard</p>
                                    <div className="flex size-8 items-center justify-center rounded-full bg-indigo-200/50 text-indigo-700">
                                        <Users className="size-4" />
                                    </div>
                                </div>
                                <h3 className="mt-4 text-4xl font-black text-indigo-950">
                                    {overallAverage}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-indigo-700">
                                    Average across all domains
                                </p>
                            </div>
                        </div>

                        {/* --- MAIN CONTENT GRID --- */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                            {/* CHART COLUMN */}
                            <div className="lg:col-span-8">
                                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden h-full">
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                        <CardTitle className="text-lg font-bold text-slate-800">Class Average by Domain</CardTitle>
                                        <p className="text-xs font-medium text-slate-500 mt-1">Measured using Scaled Scores (Scale of 1 - 19)</p>
                                    </CardHeader>
                                    <CardContent className="pt-6 h-[420px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 30, top: 10, bottom: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                <XAxis type="number" domain={[0, 19]} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                                <YAxis dataKey="domain" type="category" width={140} tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />

                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc' }}
                                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px', fontWeight: 600, color: '#0f172a' }}
                                                    formatter={(value: number) => [`${value} / 19`, 'Class Average']}
                                                />

                                                {/* Average Reference Line */}
                                                <ReferenceLine x={10} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Average Mark (10)', fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />

                                                <Bar dataKey="average" radius={[0, 6, 6, 0]} barSize={28} animationDuration={1000}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getBarColor(entry.domain)} className="transition-all hover:opacity-80" />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* INSIGHT COLUMN */}
                            <div className="lg:col-span-4">
                                <Card className="border-amber-200 shadow-sm rounded-2xl bg-gradient-to-b from-amber-50 to-white h-full">
                                    <CardHeader className="pb-2">
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-2 shadow-inner">
                                            <Lightbulb className="size-6" />
                                        </div>
                                        <CardTitle className="text-xl font-extrabold text-amber-950">Teaching Insight</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className="prose prose-sm prose-amber max-w-none text-amber-900 leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{ __html: insight || '<p>Analyze the chart to determine which domains require more focused activities in your upcoming lesson plans.</p>' }}
                                        />

                                        <div className="mt-8 rounded-xl bg-white p-4 border border-amber-100 shadow-sm">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Recommended Action</h4>
                                            <p className="text-sm text-slate-600">
                                                Focus your next week's activities on <strong className="text-slate-900">{lowestDomain?.domain || 'the lowest performing domain'}</strong> to help bring the class average up to standard.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
