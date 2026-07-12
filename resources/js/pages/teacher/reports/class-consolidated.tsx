import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer, Table as TableIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateConsolidatedReportPDF } from '@/utils/print-consolidated-report';
import { cn } from '@/lib/utils';

export interface Domain {
    id: number;
    name: string;
}

export interface StudentRow {
    id: number;
    name: string;
    age_years: number | null;
    age_months: number | null;
    gender: string;
    has_assessment: boolean;
    standard_score: number | string;
    interpretation: string;
    scores: Record<number, number | string>; // Map of domain_id -> scaled_score
}

interface ConsolidatedProps {
    rows: StudentRow[];
    domains: Domain[];
    currentType: string;
    daycareName: string;
}

export default function ClassConsolidatedReport({ rows, domains = [], currentType, daycareName }: ConsolidatedProps) {
    const { auth } = usePage().props as any;

    const activeTeacherName = auth?.user
        ? `${auth.user.first_name} ${auth.user.last_name}`
        : 'Child Development Worker';

    const handlePrint = () => {
        generateConsolidatedReportPDF({
            rows,
            domains,
            currentType,
            daycareName,
            teacherName: activeTeacherName
        } as any);
    };

    const handleTypeChange = (val: string) => {
        router.get(route('teacher.reports.consolidated'), { type: val }, { preserveState: true });
    };

    const getScoreColor = (score: number | string | undefined) => {
        if (score === undefined || score === null || score === '-') return 'text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-zinc-900/50';
        if (typeof score !== 'number') return 'text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-zinc-900/50';

        if (score <= 6) return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-black border-red-100 dark:border-red-900/30';
        if (score >= 13) return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black border-emerald-100 dark:border-emerald-900/30';
        return 'text-slate-700 dark:text-slate-200 bg-white dark:bg-zinc-900 font-black';
    };

    const getStandardScoreColor = (score: number | string) => {
        if (score === undefined || score === null || score === '-') return 'text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-zinc-900/50';
        if (typeof score !== 'number') return 'text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-zinc-900/50';

        if (score <= 79) return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 font-black border-red-200 dark:border-red-800';
        if (score >= 110) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 font-black border-emerald-200 dark:border-emerald-800';
        return 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-400 font-black border-indigo-100 dark:border-indigo-800';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '#' }, { title: 'Master Sheet', href: '#' }]}>
            <Head title={`Consolidated Record - ${currentType}`} />

            {/* 🚀 PREMIUM PAGE WRAPPER */}
            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors overflow-hidden">

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

                <div className="flex flex-col lg:flex-row justify-between gap-6 rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 lg:items-center transition-colors">
                    <div className="flex items-center gap-5 sm:gap-6">
                        <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20 transition-colors">
                            <TableIcon className="size-7 sm:size-8" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors truncate">
                                Class Consolidated Record
                            </h2>
                            <p className="mt-1.5 flex items-center gap-2 text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 transition-colors truncate">
                                <Users className="size-4 sm:size-5 shrink-0" />
                                <span className="truncate font-bold">{daycareName}</span>
                                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                                <strong className="hidden sm:inline text-slate-700 dark:text-slate-300 font-bold">{rows.length} Records</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto shrink-0">
                        <Select value={currentType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="h-12 w-full sm:w-[240px] rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 text-base font-bold text-slate-700 dark:text-slate-300 shadow-sm focus:ring-indigo-500 transition-colors">
                                <SelectValue placeholder="Select Assessment" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800 transition-colors">
                                <SelectItem value="1st Assessment" className="font-bold text-base rounded-lg py-2.5">1st Evaluation</SelectItem>
                                <SelectItem value="2nd Assessment" className="font-bold text-base rounded-lg py-2.5">2nd Evaluation</SelectItem>
                                <SelectItem value="3rd Assessment" className="font-bold text-base rounded-lg py-2.5">3rd Evaluation</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handlePrint}
                            className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white text-base font-bold shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors"
                        >
                            <Printer className="size-5 mr-2" /> Print Sheet
                        </Button>
                    </div>
                </div>

                <div className="relative w-full flex flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                    <div className="overflow-x-auto custom-scrollbar max-h-[65vh] sm:max-h-[calc(100vh-320px)] min-h-[400px] sm:min-h-[500px] relative w-full">
                        <table className="w-full text-sm text-left border-collapse min-w-max">
                            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-zinc-900/95 backdrop-blur-md shadow-sm outline outline-1 outline-slate-200 dark:outline-slate-800 transition-colors">
                                <tr className="h-16">
                                    <th className="px-5 sm:px-6 sticky left-0 z-30 bg-slate-100 dark:bg-zinc-900 outline outline-1 outline-slate-200 dark:outline-slate-800 w-[160px] sm:w-[240px] text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap transition-colors">
                                        Learner Name
                                    </th>
                                    <th className="px-3 w-[60px] sm:w-[70px] text-center text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap border-l border-slate-200 dark:border-slate-800 transition-colors">
                                        Sex
                                    </th>
                                    <th className="px-3 w-[80px] sm:w-[90px] text-center text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap border-r border-slate-200 dark:border-slate-800 transition-colors">
                                        Age<br />(Mo)
                                    </th>

                                    {domains.map((domain, index) => (
                                        <th
                                            key={domain.id}
                                            className={cn(
                                                "px-4 text-center text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase w-[100px] sm:w-[110px] whitespace-normal leading-tight transition-colors",
                                                index !== domains.length - 1 ? "border-r border-slate-200 dark:border-slate-800" : ""
                                            )}
                                        >
                                            {domain.name}
                                        </th>
                                    ))}

                                    <th className="px-4 text-center text-[11px] font-extrabold tracking-widest text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 uppercase w-[120px] sm:w-[140px] whitespace-nowrap border-l border-indigo-200 dark:border-indigo-900/50 transition-colors">
                                        Standard<br />Score
                                    </th>

                                    <th className="px-5 sm:px-8 w-[180px] sm:w-[240px] text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase whitespace-normal border-l border-slate-200 dark:border-slate-800 transition-colors leading-snug">
                                        Overall Interpretation
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={domains.length + 5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                                <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                                    <TableIcon className="size-10 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No records found.</p>
                                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors max-w-md">Complete evaluations in the matrix to populate this sheet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.id} className="h-[72px] hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors group border-slate-100 dark:border-slate-800">

                                            <td className="px-5 sm:px-6 font-extrabold text-slate-900 dark:text-white sticky left-0 z-10 bg-white dark:bg-zinc-900 outline outline-1 outline-slate-100 dark:outline-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-zinc-800 transition-colors shadow-[2px_0_10px_-4px_rgba(0,0,0,0.15)] whitespace-nowrap">
                                                <div className="truncate w-[130px] sm:w-[200px] text-sm sm:text-base" title={row.name}>{row.name}</div>
                                            </td>

                                            <td className="px-3 w-[60px] sm:w-[70px] text-center font-bold text-slate-500 dark:text-slate-400 border-l border-r border-slate-100 dark:border-slate-800 whitespace-nowrap transition-colors text-sm sm:text-base">
                                                {row.gender ? row.gender[0].toUpperCase() : '-'}
                                            </td>
                                            <td className="px-3 w-[80px] sm:w-[90px] text-center font-bold text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap transition-colors text-sm sm:text-base">
                                                {row.age_years !== null ? `${row.age_years}y ${row.age_months}m` : '-'}
                                            </td>

                                            {domains.map((domain, index) => {
                                                const score = row.scores?.[domain.id] ?? '-';
                                                return (
                                                    <td
                                                        key={domain.id}
                                                        className={cn(
                                                            "px-4 text-center text-sm sm:text-base border-slate-100 dark:border-slate-800 whitespace-nowrap transition-colors",
                                                            index !== domains.length - 1 ? "border-r" : "",
                                                            getScoreColor(score)
                                                        )}
                                                    >
                                                        {score}
                                                    </td>
                                                );
                                            })}

                                            <td className={cn(
                                                "px-4 text-center border-l-2 border-r-2 border-indigo-100 dark:border-indigo-900/50 text-xl whitespace-nowrap transition-colors",
                                                getStandardScoreColor(row.standard_score)
                                            )}>
                                                {row.standard_score}
                                            </td>

                                            <td className="px-5 sm:px-8 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-zinc-950/50 whitespace-normal leading-snug transition-colors">
                                                {row.interpretation}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
