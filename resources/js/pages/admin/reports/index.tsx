import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// 🚀 ADDED: Printer icon
import { Download, FileSpreadsheet, BarChart3, TrendingUp, CheckCircle, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useEffect } from 'react';

const breadcrumbs = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'System Reports', href: '/admin/reports' },
];

export default function SystemReports() {
    const { domainReports, complianceStats } = usePage().props as any;

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['domainReports', 'complianceStats']
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Reports" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">System Reports</h2>
                    <p className="text-slate-500">
                        Download official documentation and monitor daycare performance.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center text-lg">
                                <FileSpreadsheet className="mr-2 h-5 w-5 text-emerald-600" />
                                Master Graduation Roster
                            </CardTitle>
                            <CardDescription>
                                A complete CSV export of all students, their final 3rd assessment scores, and graduation eligibility.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <Button
                                onClick={() => window.location.href = route('admin.reports.master-roster')}
                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Download className="mr-2 h-4 w-4" /> Download CSV Roster
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center text-lg">
                                <CheckCircle className="mr-2 h-5 w-5 text-amber-600" />
                                Compliance Audit
                            </CardTitle>
                            <CardDescription>
                                Track which branches are missing 1st, 2nd, or 3rd assessment paperwork.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <Button
                                onClick={() => window.location.href = route('admin.reports.compliance-audit')}
                                className="w-full bg-amber-600 text-white hover:bg-amber-700"
                            >
                                <Download className="mr-2 h-4 w-4" /> Download Audit (CSV)
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center text-lg">
                                <BarChart3 className="mr-2 h-5 w-5 text-indigo-600" />
                                Consolidated Domain Report
                            </CardTitle>
                            <CardDescription>
                                System-wide domain averages broken down by daycare branch.
                            </CardDescription>
                        </CardHeader>
                        {/* 🚀 CHANGED: Split into side-by-side buttons for Print and Download */}
                        <CardContent className="mt-auto flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.open(route('admin.reports.consolidated-report', { print: true }), '_blank')}
                                className="w-1/2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                            <Button
                                onClick={() => window.location.href = route('admin.reports.consolidated-report')}
                                className="w-1/2 bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                <Download className="mr-2 h-4 w-4" /> PDF
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="flex flex-col lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
                                System-Wide Domain Averages (3rd Assessment)
                            </CardTitle>
                            <CardDescription>
                                Average scaled scores across all 7 developmental domains for the final evaluation period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            {domainReports && domainReports.length > 0 ? (
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={domainReports}
                                            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="domain"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                domain={[0, 'dataMax + 2']}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar
                                                dataKey="averageScore"
                                                fill="#4f46e5"
                                                radius={[4, 4, 0, 0]}
                                                name="Average Scaled Score"
                                                barSize={40}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                                    <p className="font-medium text-slate-500">No completed 3rd Assessments available yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <CheckCircle className="mr-2 h-5 w-5 text-amber-600" />
                                3rd Assessment Status
                            </CardTitle>
                            <CardDescription>
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
                                            paddingAngle={0}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {complianceStats?.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            itemStyle={{ color: '#1e293b', fontWeight: 500 }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
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
