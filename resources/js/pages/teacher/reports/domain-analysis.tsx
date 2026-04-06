import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BrainCircuit, Lightbulb, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useEffect, useState } from 'react';

interface AnalysisProps {
    chartData: { domain: string; average: number }[];
    insight: string;
    currentType: string;
    studentCount: number;
}

export default function DomainAnalysisReport({ chartData, insight, currentType, studentCount }: AnalysisProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const handleTypeChange = (val: string) => {
        router.get(route('teacher.reports.analysis'), { type: val }, { preserveState: true });
    };

    const sortedData = [...chartData].sort((a, b) => b.average - a.average);
    const highestDomain = sortedData[0];
    const lowestDomain = sortedData[sortedData.length - 1];

    const overallAverage = chartData.length > 0
        ? (chartData.reduce((acc, curr) => acc + curr.average, 0) / chartData.length).toFixed(1)
        : 0;

    const getBarColor = (domainName: string) => {
        if (domainName === highestDomain?.domain) return '#10b981'; // Emerald 500
        if (domainName === lowestDomain?.domain) return '#f43f5e'; // Rose 500
        return isDarkMode ? '#6366f1' : '#818cf8'; // Indigo 500 (Dark) or 400 (Light)
    };

    // Chart Theme Logic
    const gridStroke = isDarkMode ? '#334155' : '#e2e8f0';
    const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
    const yAxisColor = isDarkMode ? '#cbd5e1' : '#334155';
    const tooltipBg = isDarkMode ? '#18181b' : '#ffffff';
    const tooltipBorder = isDarkMode ? '#27272a' : '#e2e8f0';

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '#' }, { title: 'Class Developmental Summary', href: '#' }]}>
            <Head title={`Class Developmental Summary- ${currentType}`} />

            <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 transition-colors duration-200">

                {/* --- TOP NAVIGATION --- */}
                <div className="flex items-center justify-between pb-2">
                    <Link
                        href={route('teacher.my-students.index')}
                        className="group -ml-4 flex items-center gap-2 text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        Back to My Students
                    </Link>
                </div>

                {/* --- HERO HEADER --- */}
                <div className="flex flex-col justify-between gap-6 rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-slate-200 dark:border-slate-800 sm:flex-row sm:items-center transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-inner transition-colors">
                            <BrainCircuit className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">Class Developmental Summary</h2>
                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <Users className="size-4" />
                                Aggregated data from <strong className="text-slate-700 dark:text-slate-200">{studentCount} evaluations</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full sm:w-auto">
                        <Select value={currentType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 font-medium text-slate-700 dark:text-slate-300 focus:ring-violet-500 sm:w-[220px] transition-colors">
                                <SelectValue placeholder="Select Assessment" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                <SelectItem value="1st Assessment" className="dark:focus:bg-zinc-800">1st Evaluation</SelectItem>
                                <SelectItem value="2nd Assessment" className="dark:focus:bg-zinc-800">2nd Evaluation</SelectItem>
                                <SelectItem value="3rd Assessment" className="dark:focus:bg-zinc-800">3rd Evaluation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950/50 py-24 text-slate-500 dark:text-slate-500 transition-colors">
                        <BrainCircuit className="mb-4 size-12 opacity-20" />
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No data available for this period.</p>
                        <p className="text-sm mt-1">Complete more student evaluations to generate class insights.</p>
                    </div>
                ) : (
                    <>
                        {/* --- QUICK STATS ROW --- */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {/* Strongest Area */}
                            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 p-6 shadow-sm transition-colors">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Strongest Domain</p>
                                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-200/50 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-400">
                                        <TrendingUp className="size-4" />
                                    </div>
                                </div>
                                <h3 className="mt-4 text-2xl font-black text-emerald-950 dark:text-emerald-50 truncate" title={highestDomain?.domain}>
                                    {highestDomain?.domain || '-'}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400/80">
                                    Class Average: <strong className="text-emerald-900 dark:text-emerald-200">{highestDomain?.average || 0}</strong> / 19
                                </p>
                            </div>

                            {/* Priority Area */}
                            <div className="rounded-2xl border border-rose-100 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 p-6 shadow-sm transition-colors">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Priority Area</p>
                                    <div className="flex size-8 items-center justify-center rounded-full bg-rose-200/50 dark:bg-rose-400/20 text-rose-700 dark:text-rose-400">
                                        <TrendingDown className="size-4" />
                                    </div>
                                </div>
                                <h3 className="mt-4 text-2xl font-black text-rose-950 dark:text-rose-50 truncate" title={lowestDomain?.domain}>
                                    {lowestDomain?.domain || '-'}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-rose-700 dark:text-rose-400/80">
                                    Class Average: <strong className="text-rose-900 dark:text-rose-200">{lowestDomain?.average || 0}</strong> / 19
                                </p>
                            </div>

                            {/* Overall Average */}
                            <div className="rounded-2xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/5 p-6 shadow-sm transition-colors">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Overall Standard</p>
                                    <div className="flex size-8 items-center justify-center rounded-full bg-indigo-200/50 dark:bg-indigo-400/20 text-indigo-700 dark:text-indigo-400">
                                        <Users className="size-4" />
                                    </div>
                                </div>
                                <h3 className="mt-4 text-4xl font-black text-indigo-950 dark:text-indigo-50 transition-colors">
                                    {overallAverage}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-indigo-700 dark:text-indigo-400/80">
                                    Average across all domains
                                </p>
                            </div>
                        </div>

                        {/* --- MAIN CONTENT GRID --- */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

                            {/* CHART COLUMN */}
                            <div className="lg:col-span-8">
                                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden h-full bg-white dark:bg-zinc-900 transition-colors">
                                    <CardHeader className="bg-slate-50/50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Class Average by Domain</CardTitle>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Measured using Scaled Scores (Scale of 1 - 19)</p>
                                    </CardHeader>
                                    <CardContent className="pt-6 h-[420px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ left: 30, right: 30, top: 10, bottom: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                                                <XAxis type="number" domain={[0, 19]} tick={{ fill: axisColor, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                                <YAxis dataKey="domain" type="category" width={140} tick={{ fill: yAxisColor, fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />

                                                <Tooltip
                                                    cursor={{ fill: isDarkMode ? '#27272a' : '#f8fafc' }}
                                                    contentStyle={{
                                                        borderRadius: '12px',
                                                        backgroundColor: tooltipBg,
                                                        border: `1px solid ${tooltipBorder}`,
                                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                        padding: '12px',
                                                        fontWeight: 600,
                                                        color: isDarkMode ? '#f8fafc' : '#0f172a'
                                                    }}
                                                    itemStyle={{ color: isDarkMode ? '#818cf8' : '#4f46e5' }}
                                                    formatter={(value: number) => [`${value} / 19`, 'Class Average']}
                                                />

                                                <ReferenceLine x={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} strokeDasharray="3 3" label={{ position: 'top', value: 'Average Mark (10)', fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 'bold' }} />

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
                                <Card className="border-amber-200 dark:border-amber-900/50 shadow-sm rounded-2xl bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-zinc-900 h-full transition-colors">
                                    <CardHeader className="pb-2">
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 mb-2 shadow-inner transition-colors">
                                            <Lightbulb className="size-6" />
                                        </div>
                                        <CardTitle className="text-xl font-extrabold text-amber-950 dark:text-amber-100 transition-colors">Teaching Insight</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className="prose prose-sm prose-amber max-w-none text-amber-900 dark:text-amber-200/80 leading-relaxed font-medium transition-colors"
                                            dangerouslySetInnerHTML={{ __html: insight || '<p>Analyze the chart to determine which domains require more focused activities in your upcoming lesson plans.</p>' }}
                                        />

                                        <div className="mt-8 rounded-xl bg-white dark:bg-zinc-950 p-4 border border-amber-100 dark:border-amber-900/50 shadow-sm transition-colors">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-2 transition-colors">Recommended Action</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
                                                Focus your next week's activities on <strong className="text-slate-900 dark:text-slate-200">{lowestDomain?.domain || 'the lowest performing domain'}</strong> to help bring the class average up to standard.
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
