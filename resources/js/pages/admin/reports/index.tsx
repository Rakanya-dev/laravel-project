import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, BarChart3, TrendingUp, CheckCircle, Printer, Eye, School, Search, Users, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const breadcrumbs = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'System Reports', href: '/admin/reports' },
];

export default function SystemReports() {
    const { domainReports, complianceStats, rawMasterData = [], rawAuditData = [], daycareList = [] } = usePage().props as any;

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isPreviewMasterOpen, setIsPreviewMasterOpen] = useState(false);
    const [isPreviewAuditOpen, setIsPreviewAuditOpen] = useState(false);

    // --- Roster Filters & Selection State ---
    const [rosterSearch, setRosterSearch] = useState('');
    const params = new URLSearchParams(window.location.search);
    const [rosterFilter, setRosterFilter] = useState(params.get('daycare') || 'all');
    const [selectedRosterIds, setSelectedRosterIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const interval = setInterval(() => {
            router.reload({ only: ['domainReports', 'complianceStats', 'rawMasterData', 'rawAuditData'] });
        }, 10000);

        return () => {
            clearInterval(interval);
            observer.disconnect();
        };
    }, []);

    const filteredMasterData = useMemo(() => {
        if (!rawMasterData) return [];
        return rawMasterData.filter((row: any) => {
            const matchesSearch = row.name.toLowerCase().includes(rosterSearch.toLowerCase());
            const matchesCenter = rosterFilter === 'all' || row.daycare === rosterFilter;
            return matchesSearch && matchesCenter;
        });
    }, [rawMasterData, rosterSearch, rosterFilter]);

    // Checkbox Handlers
    const handleToggleAllRoster = () => {
        if (selectedRosterIds.size === filteredMasterData.length) {
            setSelectedRosterIds(new Set()); // Deselect all
        } else {
            setSelectedRosterIds(new Set(filteredMasterData.map((row: any) => row.id))); // Select all
        }
    };

    const handleToggleRosterStudent = (id: number) => {
        setSelectedRosterIds((prev) => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    // Export specific IDs
    const handleExportSelectedRoster = () => {
        if (selectedRosterIds.size > 0) {
            const idsParam = Array.from(selectedRosterIds).join(',');
            window.location.href = route('admin.reports.master-roster', { ids: idsParam });
        } else {
            window.location.href = route('admin.reports.master-roster', {
                daycare: rosterFilter === 'all' ? undefined : rosterFilter
            });
        }
    };

    const handleCenterChange = (center: string) => {
        setRosterFilter(center);

        router.get(
            route('admin.reports.index'),
            { daycare: center },
            {
                only: ['rawMasterData'], // ONLY reload the table data
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const chartGridColor = isDarkMode ? '#334155' : '#e2e8f0';
    const chartTextColor = isDarkMode ? '#94a3b8' : '#64748b';
    const tooltipBgColor = isDarkMode ? '#18181b' : '#ffffff';
    const tooltipTextColor = isDarkMode ? '#f8fafc' : '#0f172a';
    const tooltipBorderColor = isDarkMode ? '#27272a' : '#f1f5f9';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Reports" />

            {/* 🚀 PREMIUM PAGE WRAPPER */}
            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

                {/* MATCHING HEADER STRUCTURE */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3 transition-colors">
                            System Reports
                        </h2>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">
                            Download official documentation and monitor daycare performance.
                        </p>
                    </div>
                </div>

                {/* --- 3 ACTION CARDS GRID --- */}
                <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* CARD 1: Master Graduation Roster */}
                    <Card className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700">
                        <CardHeader className="p-6 sm:p-8 pb-4 sm:pb-5">
                            <CardTitle className="flex items-center text-xl font-black text-slate-900 dark:text-white transition-colors">
                                <div className="mr-4 flex size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors duration-300">
                                    <FileSpreadsheet className="size-6" strokeWidth={2.5} />
                                </div>
                                Master Graduation Roster
                            </CardTitle>
                            <CardDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2.5 transition-colors leading-relaxed">
                                A complete CSV export of all students, their final 3rd assessment scores, and graduation eligibility.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto flex gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
                            <Button
                                variant="outline"
                                onClick={() => setIsPreviewMasterOpen(true)}
                                className="w-1/3 text-base border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold h-12 rounded-xl transition-colors shadow-sm"
                            >
                                <Eye className="size-5 mr-2" /> View
                            </Button>
                            <Button
                                onClick={() => window.location.href = route('admin.reports.master-roster')}
                                className="w-2/3 text-base bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold h-12 rounded-xl shadow-sm transition-colors"
                            >
                                <Download className="mr-2 size-5" /> Export All
                            </Button>
                        </CardContent>
                    </Card>

                    {/* CARD 2: Compliance Audit */}
                    <Card className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700">
                        <CardHeader className="p-6 sm:p-8 pb-4 sm:pb-5">
                            <CardTitle className="flex items-center text-xl font-black text-slate-900 dark:text-white transition-colors">
                                <div className="mr-4 flex size-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors duration-300">
                                    <CheckCircle className="size-6" strokeWidth={2.5} />
                                </div>
                                Compliance Audit
                            </CardTitle>
                            <CardDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2.5 transition-colors leading-relaxed">
                                Track which branches are missing 1st, 2nd, or 3rd assessment paperwork for their active roster.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto flex gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
                            <Button
                                variant="outline"
                                onClick={() => setIsPreviewAuditOpen(true)}
                                className="w-1/3 text-base border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold h-12 rounded-xl transition-colors shadow-sm"
                            >
                                <Eye className="size-5 mr-2" /> View
                            </Button>
                            <Button
                                onClick={() => window.location.href = route('admin.reports.compliance-audit')}
                                className="w-2/3 text-base bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 font-bold h-12 rounded-xl shadow-sm transition-colors"
                            >
                                <Download className="mr-2 size-5" /> Export CSV
                            </Button>
                        </CardContent>
                    </Card>

                    {/* CARD 3: Consolidated Domain Report */}
                    <Card className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700">
                        <CardHeader className="p-6 sm:p-8 pb-4 sm:pb-5">
                            <CardTitle className="flex items-center text-xl font-black text-slate-900 dark:text-white transition-colors">
                                <div className="mr-4 flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors duration-300">
                                    <BarChart3 className="size-6" strokeWidth={2.5} />
                                </div>
                                Consolidated Domain Report
                            </CardTitle>
                            <CardDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2.5 transition-colors leading-relaxed">
                                System-wide developmental domain averages formally broken down by daycare branch.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto flex gap-3 px-6 pb-6 sm:px-8 sm:pb-8">
                            <Button
                                variant="outline"
                                onClick={() => window.open(route('admin.reports.consolidated-report', { print: true }), '_blank')}
                                className="w-1/2 text-base border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-bold h-12 rounded-xl transition-colors shadow-sm"
                            >
                                <Printer className="mr-2 size-5" /> Print
                            </Button>
                            <Button
                                onClick={() => window.location.href = route('admin.reports.consolidated-report')}
                                className="w-1/2 text-base bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 font-bold h-12 rounded-xl shadow-sm transition-colors"
                            >
                                <Download className="mr-2 size-5" /> PDF
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* --- ANALYTICS DATA / VISUAL CHARTS --- */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="flex flex-col lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 shrink-0">
                            <CardTitle className="flex items-center text-xl font-black text-slate-900 dark:text-white transition-colors">
                                <div className="mr-4 flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors duration-300 border border-indigo-100 dark:border-indigo-500/30">
                                    <TrendingUp className="size-6" strokeWidth={2.5} />
                                </div>
                                System-Wide Domain Averages (3rd Assessment)
                            </CardTitle>
                            <CardDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                                Average scaled scores across all 7 developmental domains for the final evaluation period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto p-6 sm:p-8">
                            {domainReports && domainReports.length > 0 ? (
                                <div className="h-[400px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={domainReports} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                            <XAxis dataKey="domain" axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12, fontWeight: 600 }} angle={-45} textAnchor="end" height={60} dy={15} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTextColor, fontSize: 12, fontWeight: 600 }} domain={[0, 'dataMax + 2']} dx={-10} />
                                            <Tooltip cursor={{ fill: isDarkMode ? '#27272a' : '#f8fafc' }} contentStyle={{ backgroundColor: tooltipBgColor, borderRadius: '12px', border: `1px solid ${tooltipBorderColor}`, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: tooltipTextColor, fontWeight: 600 }} itemStyle={{ color: isDarkMode ? '#818cf8' : '#4f46e5' }} />
                                            <Bar dataKey="averageScore" fill={isDarkMode ? '#6366f1' : '#4f46e5'} radius={[6, 6, 0, 0]} name="Average Scaled Score" barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 transition-colors">
                                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                                        <BarChart3 className="size-10 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No Data Available</h3>
                                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">No completed 3rd Assessments available yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col lg:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-slate-800 p-6 sm:p-8 shrink-0">
                            <CardTitle className="flex items-center text-xl font-black text-slate-900 dark:text-white transition-colors">
                                <div className="mr-4 flex size-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors duration-300 border border-amber-200 dark:border-amber-900/50">
                                    <CheckCircle className="size-6" strokeWidth={2.5} />
                                </div>
                                3rd Assessment Status
                            </CardTitle>
                            <CardDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                                Overall completion rate.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto p-6 sm:p-8">
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={complianceStats} cx="50%" cy="45%" innerRadius={80} outerRadius={120} paddingAngle={0} dataKey="value" stroke="none">
                                            {complianceStats?.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip itemStyle={{ color: tooltipTextColor, fontWeight: 600 }} contentStyle={{ backgroundColor: tooltipBgColor, borderRadius: '12px', border: `1px solid ${tooltipBorderColor}`, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: chartTextColor, fontWeight: 600, fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ======================================================== */}
            {/* 🚀 MODAL PREVIEW SLIDE PANEL: MASTER GRADUATION ROSTER   */}
            {/* ======================================================== */}
            <Sheet open={isPreviewMasterOpen} onOpenChange={setIsPreviewMasterOpen}>
                <SheetContent side="right" hideClose className="w-full sm:max-w-[950px] p-0 flex flex-col bg-slate-50 dark:bg-zinc-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">

                    {/* --- HEADER --- */}
                    <div className="bg-white dark:bg-zinc-900 px-6 py-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-5 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
                                <FileSpreadsheet className="size-6" strokeWidth={2.5} />
                            </div>
                            <div>
                                <SheetTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Master Roster Preview</SheetTitle>
                                <SheetDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Live view of records eligible for calculation outputs.</SheetDescription>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            {selectedRosterIds.size > 0 && (
                                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 transition-colors bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                                    {selectedRosterIds.size} Selected
                                </span>
                            )}
                            <Button
                                onClick={handleExportSelectedRoster}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold h-12 rounded-xl px-6 shadow-sm transition-colors flex-1 sm:flex-none"
                            >
                                <Download className="size-5 mr-2" />
                                {selectedRosterIds.size > 0 ? 'Export Selected' : 'Export All'}
                            </Button>
                        </div>
                    </div>

                    {/* --- BODY --- */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">
                        {rawMasterData.length > 0 && (
                            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500 transition-colors" />
                                    <Input
                                        placeholder="Search by student name..."
                                        value={rosterSearch}
                                        onChange={(e) => setRosterSearch(e.target.value)}
                                        className="pl-12 h-12 text-base rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 shadow-sm font-medium transition-colors focus-visible:ring-indigo-500"
                                    />
                                </div>
                                <Select value={rosterFilter} onValueChange={handleCenterChange}>
                                    <SelectTrigger className="h-12 text-base rounded-xl w-full sm:w-[260px] font-bold bg-slate-50 dark:bg-zinc-950 shadow-sm border-slate-200 dark:border-slate-800 transition-colors focus:ring-indigo-500">
                                        <SelectValue placeholder="All Centers" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800 transition-colors">
                                        <SelectItem value="all" className="rounded-lg font-medium py-2.5 transition-colors text-base">All Centers</SelectItem>
                                        {daycareList.map((center: string) => (
                                            <SelectItem key={center} value={center} className="rounded-lg font-medium py-2.5 transition-colors text-base">
                                                {center}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {rawMasterData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm text-center transition-colors">
                                <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                    <Users className="size-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No Active Records</h3>
                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors max-w-md">There are no students ready for the master roster.</p>
                            </div>
                        ) : filteredMasterData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm text-center transition-colors">
                                <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                    <ShieldAlert className="size-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No matches found</h3>
                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden shrink-0 transition-colors">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="pl-6 w-14 py-5">
                                                <Checkbox
                                                    checked={filteredMasterData.length > 0 && selectedRosterIds.size === filteredMasterData.length}
                                                    onCheckedChange={handleToggleAllRoster}
                                                    className="size-5 rounded-md border-slate-300 dark:border-slate-600 data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-600 dark:data-[state=checked]:border-emerald-500"
                                                />
                                            </TableHead>
                                            <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 py-5 transition-colors">Child Name</TableHead>
                                            <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 py-5 transition-colors">Center</TableHead>
                                            <TableHead className="text-[11px] uppercase tracking-widest font-bold text-center text-slate-500 dark:text-slate-400 py-5 transition-colors">Final Score</TableHead>
                                            <TableHead className="pr-6 text-right text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 py-5 transition-colors">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                                        {filteredMasterData.map((row: any, i: number) => (
                                            <TableRow key={row.id || i} className={cn("transition-colors h-[72px]", selectedRosterIds.has(row.id) ? 'bg-emerald-50/50 dark:bg-emerald-500/10' : 'hover:bg-slate-50/50 dark:hover:bg-zinc-800/50')}>
                                                <TableCell className="pl-6">
                                                    <Checkbox
                                                        checked={selectedRosterIds.has(row.id)}
                                                        onCheckedChange={() => handleToggleRosterStudent(row.id)}
                                                        className="size-5 rounded-md border-slate-300 dark:border-slate-600 data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-600 dark:data-[state=checked]:border-emerald-500"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-base font-extrabold text-slate-900 dark:text-white transition-colors">{row.name}</TableCell>
                                                <TableCell className="text-base font-bold text-slate-600 dark:text-slate-300 transition-colors">{row.daycare}</TableCell>
                                                <TableCell className="text-lg text-center font-black text-slate-900 dark:text-white transition-colors">{row.final_score || '--'}</TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <Badge variant="outline" className={row.status === 'Eligible' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50 shadow-none transition-colors px-2.5 py-0.5 uppercase tracking-widest text-[11px] font-bold border' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-slate-700 shadow-none transition-colors px-2.5 py-0.5 uppercase tracking-widest text-[11px] font-bold border'}>
                                                        {row.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    {/* Fixed Footer */}
                    <div className="px-6 py-5 sm:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 flex justify-end shrink-0 transition-colors m-0">
                        <Button variant="ghost" onClick={() => setIsPreviewMasterOpen(false)} className="h-12 px-8 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 w-full sm:w-auto transition-colors">
                            Close Preview
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* ======================================================== */}
            {/* 🚀 MODAL PREVIEW SLIDE PANEL: COMPLIANCE AUDIT           */}
            {/* ======================================================== */}
            <Sheet open={isPreviewAuditOpen} onOpenChange={setIsPreviewAuditOpen}>
                <SheetContent side="right" hideClose className="w-full sm:max-w-[950px] p-0 flex flex-col bg-slate-50 dark:bg-zinc-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">

                    {/* --- HEADER --- */}
                    <div className="bg-white dark:bg-zinc-900 px-6 py-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-5 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 shadow-sm">
                                <CheckCircle className="size-6" strokeWidth={2.5} />
                            </div>
                            <div>
                                <SheetTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">Compliance Log Preview</SheetTitle>
                                <SheetDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">Live checking audit across active LGU parameters.</SheetDescription>
                            </div>
                        </div>
                        <Button
                            onClick={() => window.location.href = route('admin.reports.compliance-audit')}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-base font-bold h-12 rounded-xl px-8 shadow-sm transition-colors w-full sm:w-auto mt-2 sm:mt-0"
                        >
                            <Download className="size-5 mr-2" /> Export Data
                        </Button>
                    </div>

                    {/* --- BODY --- */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">
                        {rawAuditData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm text-center transition-colors">
                                <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                    <FileSpreadsheet className="size-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No Audit Metrics</h3>
                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors max-w-md">No metrics generated to verify tracking cycles.</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden shrink-0 transition-colors">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="pl-6 py-5 text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 transition-colors">Daycare Center Branch</TableHead>
                                            <TableHead className="py-5 text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 transition-colors">Period 1</TableHead>
                                            <TableHead className="py-5 text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 transition-colors">Period 2</TableHead>
                                            <TableHead className="pr-6 py-5 text-right text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 transition-colors">Period 3 Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                                        {rawAuditData.map((row: any, i: number) => (
                                            <TableRow key={i} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors h-[72px]">
                                                <TableCell className="pl-6 text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-3 transition-colors h-[72px]">
                                                    <School className="size-5 text-indigo-400 dark:text-indigo-500 transition-colors" /> {row.center_name}
                                                </TableCell>
                                                <TableCell className="text-base font-bold transition-colors text-slate-600 dark:text-slate-300">{row.p1_status}</TableCell>
                                                <TableCell className="text-base font-bold transition-colors text-slate-600 dark:text-slate-300">{row.p2_status}</TableCell>
                                                <TableCell className="pr-6 text-right">
                                                    <Badge variant="outline" className={row.p3_status === 'Complete' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50 shadow-none transition-colors px-2.5 py-0.5 uppercase tracking-widest text-[11px] font-bold border' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/50 shadow-none transition-colors px-2.5 py-0.5 uppercase tracking-widest text-[11px] font-bold border'}>
                                                        {row.p3_status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    {/* Fixed Footer */}
                    <div className="px-6 py-5 sm:px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 flex justify-end shrink-0 transition-colors m-0">
                        <Button variant="ghost" onClick={() => setIsPreviewAuditOpen(false)} className="h-12 px-8 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 w-full sm:w-auto transition-colors">
                            Close Preview
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
