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
        if (domainName === highestDomain?.domain) return '#10b981';
        if (domainName === lowestDomain?.domain) return '#f43f5e';
        return isDarkMode ? '#6366f1' : '#818cf8';
    };

    const gridStroke = isDarkMode ? '#334155' : '#e2e8f0';
    const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
    const yAxisColor = isDarkMode ? '#cbd5e1' : '#334155';
    const tooltipBg = isDarkMode ? '#18181b' : '#ffffff';
    const tooltipBorder = isDarkMode ? '#27272a' : '#e2e8f0';

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '#' }, { title: 'Class Developmental Summary', href: '#' }]}>
            <Head title={`Class Developmental Summary - ${currentType}`} />

            {/* 🚀 PREMIUM PAGE WRAPPER */}
            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

                {/* --- 🚀 UNIFIED BACK LINK --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                    <Link
                        href={route('teacher.my-students.index')}
                        className="group flex items-center gap-2 text-base font-bold text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
                        <span className="hidden sm:inline">Back to My Students</span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                </div>

                <div className="flex flex-col justify-between gap-6 rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 sm:flex-row sm:items-center transition-colors">
                    <div className="flex items-center gap-5 sm:gap-6">
                        <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-sm border border-violet-100 dark:border-violet-500/20 transition-colors">
                            <BrainCircuit className="size-7 sm:size-8" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                                Class Developmental Summary
                            </h2>
                            <p className="mt-1.5 flex items-center gap-2 text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                <Users className="size-5 shrink-0" />
                                Aggregated data from <span className="text-slate-300 dark:text-slate-700">•</span> <strong className="text-slate-700 dark:text-slate-200 font-bold">{studentCount} evaluations</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full sm:w-auto shrink-0">
                        <Select value={currentType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 text-base font-bold text-slate-700 dark:text-slate-300 shadow-sm focus:ring-violet-500 sm:w-[260px] transition-colors">
                                <SelectValue placeholder="Select Assessment" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800 transition-colors">
                                <SelectItem value="1st Assessment" className="text-base font-bold rounded-lg py-2.5 transition-colors">1st Evaluation</SelectItem>
                                <SelectItem value="2nd Assessment" className="text-base font-bold rounded-lg py-2.5 transition-colors">2nd Evaluation</SelectItem>
                                <SelectItem value="3rd Assessment" className="text-base font-bold rounded-lg py-2.5 transition-colors">3rd Evaluation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm text-center transition-colors">
                        <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                            <BrainCircuit className="size-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No data available for this period</h3>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors max-w-md">Complete more student evaluations to generate class insights.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-3 transition-colors">
                            <div className="rounded-3xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-6 sm:p-8 shadow-sm transition-colors hover:shadow-md hover:-translate-y-1 duration-300">
                                <div className="flex items-center justify-between mb-5">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Strongest Domain</p>
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-200/50 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-400 transition-colors">
                                        <TrendingUp className="size-6" strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-emerald-950 dark:text-emerald-100 truncate transition-colors" title={highestDomain?.domain}>
                                    {highestDomain?.domain || '-'}
                                </h3>
                                <p className="mt-2 text-base font-medium text-emerald-700/80 dark:text-emerald-400/80 transition-colors">
                                    Class Average: <strong className="font-black text-emerald-900 dark:text-emerald-300">{highestDomain?.average || 0}</strong> / 19
                                </p>
                            </div>

                            <div className="rounded-3xl border border-rose-100 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-6 sm:p-8 shadow-sm transition-colors hover:shadow-md hover:-translate-y-1 duration-300">
                                <div className="flex items-center justify-between mb-5">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">Priority Area</p>
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-rose-200/50 dark:bg-rose-400/20 text-rose-700 dark:text-rose-400 transition-colors">
                                        <TrendingDown className="size-6" strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-rose-950 dark:text-rose-100 truncate transition-colors" title={lowestDomain?.domain}>
                                    {lowestDomain?.domain || '-'}
                                </h3>
                                <p className="mt-2 text-base font-medium text-rose-700/80 dark:text-rose-400/80 transition-colors">
                                    Class Average: <strong className="font-black text-rose-900 dark:text-rose-300">{lowestDomain?.average || 0}</strong> / 19
                                </p>
                            </div>

                            <div className="rounded-3xl border border-violet-100 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 p-6 sm:p-8 shadow-sm transition-colors hover:shadow-md hover:-translate-y-1 duration-300">
                                <div className="flex items-center justify-between mb-5">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Overall Standard</p>
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-violet-200/50 dark:bg-violet-400/20 text-violet-700 dark:text-violet-400 transition-colors">
                                        <Users className="size-6" strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h3 className="text-5xl font-black text-violet-950 dark:text-violet-100 transition-colors tracking-tighter">
                                    {overallAverage}
                                </h3>
                                <p className="mt-2 text-base font-medium text-violet-700/80 dark:text-violet-400/80 transition-colors">
                                    Average across all domains
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
                            <div className="lg:col-span-8">
                                <Card className="border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden h-full bg-white dark:bg-zinc-900 transition-colors flex flex-col">
                                    <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 transition-colors shrink-0">
                                        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Class Average by Domain</CardTitle>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-2 transition-colors">Measured using Scaled Scores (Scale of 1 - 19)</p>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 flex-1 min-h-[500px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                                                <XAxis type="number" domain={[0, 19]} tick={{ fill: axisColor, fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                                <YAxis dataKey="domain" type="category" width={180} tick={{ fill: yAxisColor, fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false} />

                                                <Tooltip
                                                    cursor={{ fill: isDarkMode ? '#27272a' : '#f8fafc' }}
                                                    contentStyle={{
                                                        borderRadius: '16px',
                                                        backgroundColor: tooltipBg,
                                                        border: `1px solid ${tooltipBorder}`,
                                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                                        padding: '16px',
                                                        fontWeight: 700,
                                                        color: isDarkMode ? '#f8fafc' : '#0f172a'
                                                    }}
                                                    itemStyle={{ color: isDarkMode ? '#8b5cf6' : '#7c3aed' }}
                                                    formatter={(value: number) => [`${value} / 19`, 'Class Average']}
                                                />

                                                <ReferenceLine x={10} stroke={isDarkMode ? '#64748b' : '#94a3b8'} strokeDasharray="3 3" label={{ position: 'top', value: 'Average Mark (10)', fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 800, textAnchor: 'middle' }} />

                                                <Bar dataKey="average" radius={[0, 8, 8, 0]} barSize={40} animationDuration={1000}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={getBarColor(entry.domain)} className="transition-all duration-300 hover:opacity-80" />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="lg:col-span-4">
                                <Card className="border-amber-200 dark:border-amber-900/50 shadow-sm rounded-3xl bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-500/10 dark:to-zinc-900 h-full transition-colors flex flex-col">
                                    <CardHeader className="p-6 sm:p-8 pb-4 shrink-0">
                                        <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 mb-5 shadow-sm border border-amber-200/50 dark:border-amber-500/20 transition-colors">
                                            <Lightbulb className="size-8" strokeWidth={2.5} />
                                        </div>
                                        <CardTitle className="text-2xl font-black text-amber-950 dark:text-amber-100 tracking-tight transition-colors">Teaching Insight</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 pt-0 flex-1 flex flex-col">
                                        <div
                                            className="prose prose-base prose-amber max-w-none text-amber-900/90 dark:text-amber-200/80 leading-relaxed font-medium transition-colors flex-1"
                                            dangerouslySetInnerHTML={{ __html: insight || '<p>Analyze the chart to determine which domains require more focused activities in your upcoming lesson plans.</p>' }}
                                        />

                                        <div className="mt-8 rounded-2xl bg-white dark:bg-zinc-950 p-6 border border-amber-200 dark:border-amber-900/50 shadow-sm transition-colors shrink-0">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-3 transition-colors">Recommended Action</h4>
                                            <p className="text-base font-medium text-slate-700 dark:text-slate-300 transition-colors leading-relaxed">
                                                Focus your next week's activities on <strong className="font-black text-slate-900 dark:text-white">{lowestDomain?.domain || 'the lowest performing domain'}</strong> to help bring the class average up to standard.
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
