import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, BarChart3, TrendingUp, CheckCircle, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'System Reports', href: '/admin/reports' },
];

export default function SystemReports() {
    const { domainReports, complianceStats } = usePage().props as any;

    // Check dark mode state to dynamically style the charts
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const interval = setInterval(() => {
            router.reload({
                only: ['domainReports', 'complianceStats']
            });
        }, 10000);

        return () => {
            clearInterval(interval);
            observer.disconnect();
        };
    }, []);

    // Theme variables for charts
    const chartGridColor = isDarkMode ? '#334155' : '#e2e8f0'; // slate-700 / slate-200
    const chartTextColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 / slate-500
    const tooltipBgColor = isDarkMode ? '#18181b' : '#ffffff'; // zinc-900 / white
    const tooltipTextColor = isDarkMode ? '#f8fafc' : '#0f172a'; // slate-50 / slate-900
    const tooltipBorderColor = isDarkMode ? '#27272a' : '#f1f5f9'; // zinc-800 / slate-100

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Reports" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">System Reports</h2>
                    <p className="text-slate-500 dark:text-slate-400 transition-colors">
                        Download official documentation and monitor daycare performance.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center text-lg text-slate-900 dark:text-white transition-colors">
                                <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 transition-colors">
                                    <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                Master Graduation Roster
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                                A complete CSV export of all students, their final 3rd assessment scores, and graduation eligibility.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <Button
                                onClick={() => window.location.href = route('admin.reports.master-roster')}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold h-11 rounded-xl shadow-sm transition-colors"
                            >
                                <Download className="mr-2 h-4 w-4" /> Download CSV Roster
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center text-lg text-slate-900 dark:text-white transition-colors">
                                <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 transition-colors">
                                    <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                Compliance Audit
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                                Track which branches are missing 1st, 2nd, or 3rd assessment paperwork.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <Button
                                onClick={() => window.location.href = route('admin.reports.compliance-audit')}
                                className="w-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 font-bold h-11 rounded-xl shadow-sm transition-colors"
                            >
                                <Download className="mr-2 h-4 w-4" /> Download Audit (CSV)
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center text-lg text-slate-900 dark:text-white transition-colors">
                                <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 transition-colors">
                                    <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                Consolidated Domain Report
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                                System-wide domain averages broken down by daycare branch.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.open(route('admin.reports.consolidated-report', { print: true }), '_blank')}
                                className="w-1/2 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-bold h-11 rounded-xl transition-colors"
                            >
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                            <Button
                                onClick={() => window.location.href = route('admin.reports.consolidated-report')}
                                className="w-1/2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 font-bold h-11 rounded-xl shadow-sm transition-colors"
                            >
                                <Download className="mr-2 h-4 w-4" /> PDF
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="flex flex-col lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg text-slate-900 dark:text-white transition-colors">
                                <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 transition-colors">
                                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                System-Wide Domain Averages (3rd Assessment)
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 transition-colors">
                                Average scaled scores across all 7 developmental domains for the final evaluation period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            {domainReports && domainReports.length > 0 ? (
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={domainReports}
                                            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                            <XAxis
                                                dataKey="domain"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: chartTextColor, fontSize: 12, fontWeight: 500 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                                dy={15}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: chartTextColor, fontSize: 12, fontWeight: 500 }}
                                                domain={[0, 'dataMax + 2']}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                cursor={{ fill: isDarkMode ? '#27272a' : '#f8fafc' }}
                                                contentStyle={{
                                                    backgroundColor: tooltipBgColor,
                                                    borderRadius: '12px',
                                                    border: `1px solid ${tooltipBorderColor}`,
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                    color: tooltipTextColor,
                                                    fontWeight: 600
                                                }}
                                                itemStyle={{ color: isDarkMode ? '#818cf8' : '#4f46e5' }}
                                            />
                                            <Bar
                                                dataKey="averageScore"
                                                fill={isDarkMode ? '#6366f1' : '#4f46e5'}
                                                radius={[6, 6, 0, 0]}
                                                name="Average Scaled Score"
                                                barSize={40}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[400px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 transition-colors">
                                    <p className="font-medium text-slate-500 dark:text-slate-400">No completed 3rd Assessments available yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg text-slate-900 dark:text-white transition-colors">
                                <div className="mr-3 flex size-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 transition-colors">
                                    <CheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                3rd Assessment Status
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 transition-colors">
                                Overall completion rate for the final evaluation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={complianceStats}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {complianceStats?.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            itemStyle={{ color: tooltipTextColor, fontWeight: 600 }}
                                            contentStyle={{
                                                backgroundColor: tooltipBgColor,
                                                borderRadius: '12px',
                                                border: `1px solid ${tooltipBorderColor}`,
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            wrapperStyle={{ color: chartTextColor, fontWeight: 500, fontSize: '14px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
