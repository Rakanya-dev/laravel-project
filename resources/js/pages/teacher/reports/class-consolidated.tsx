import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer, Table as TableIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateConsolidatedReportPDF } from '@/utils/print-consolidated-report';

interface StudentRow {
    id: number;
    name: string;
    age_years: number | null;
    age_months: number | null;
    gender: string;
    has_assessment: boolean;
    gross_motor: number | string;
    fine_motor: number | string;
    self_help: number | string;
    receptive: number | string;
    expressive: number | string;
    cognitive: number | string;
    socio_emotional: number | string;
    standard_score: number | string;
    interpretation: string;
}

interface ConsolidatedProps {
    rows: StudentRow[];
    currentType: string;
    daycareName: string;
    teacherName: string;
}

export default function ClassConsolidatedReport({ rows, currentType, daycareName }: ConsolidatedProps) {
    const { auth } = usePage().props as any;

    const activeTeacherName = auth?.user
        ? `${auth.user.first_name} ${auth.user.last_name}`
        : 'Child Development Worker';

    const handlePrint = () => {
        generateConsolidatedReportPDF({
            rows,
            currentType,
            daycareName,
            teacherName: activeTeacherName
        });
    };

    const handleTypeChange = (val: string) => {
        router.get(route('teacher.reports.consolidated'), { type: val }, { preserveState: true });
    };

    // --- CONDITIONAL FORMATTING LOGIC ---
    const getScoreColor = (score: number | string) => {
        if (typeof score !== 'number') return 'text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-zinc-900/50';

        if (score <= 3) return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold border-red-100 dark:border-red-900/30';
        if (score >= 13) return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold border-emerald-100 dark:border-emerald-900/30';
        return 'text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-900';
    };

    const getStandardScoreColor = (score: number | string) => {
        if (typeof score !== 'number') return 'text-slate-400 dark:text-slate-600 bg-slate-50/50 dark:bg-zinc-900/50';

        if (score <= 79) return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 font-black border-red-200 dark:border-red-800';
        if (score >= 110) return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-black border-emerald-200 dark:border-emerald-800';
        return 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-black border-indigo-100 dark:border-indigo-800';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '#' }, { title: 'Master Sheet', href: '#' }]}>
            <Head title={`Consolidated Record - ${currentType}`} />

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
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-inner">
                            <TableIcon className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Class Consolidated Record</h2>
                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <Users className="size-4" />
                                {daycareName} • <strong className="text-slate-700 dark:text-slate-200">{rows.length} Records</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <Select value={currentType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 font-medium text-slate-700 dark:text-slate-300 focus:ring-indigo-500 sm:w-[220px]">
                                <SelectValue placeholder="Select Assessment" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                <SelectItem value="1st Assessment" className="dark:focus:bg-zinc-800">1st Evaluation</SelectItem>
                                <SelectItem value="2nd Assessment" className="dark:focus:bg-zinc-800">2nd Evaluation</SelectItem>
                                <SelectItem value="3rd Assessment" className="dark:focus:bg-zinc-800">3rd Evaluation</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handlePrint}
                            className="h-11 bg-indigo-600 dark:bg-indigo-600 text-white font-bold shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors"
                        >
                            <Printer className="w-4 h-4 mr-2" /> Print Master Sheet
                        </Button>
                    </div>
                </div>

                {/* --- THE MASTER TABLE --- */}
                <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">

                    <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] min-h-[500px] custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
                            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-zinc-800 shadow-sm outline outline-1 outline-slate-200 dark:outline-slate-700 transition-colors">
                                <tr className="h-16">
                                    <th className="px-4 sticky left-0 z-30 bg-slate-100 dark:bg-zinc-800 outline outline-1 outline-slate-200 dark:outline-slate-700 w-[220px] text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase whitespace-nowrap">
                                        Learner Name
                                    </th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap">Sex</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap">Age<br />(Mo)</th>

                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase w-[90px] whitespace-nowrap border-l dark:border-slate-700">Gross<br />Motor</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase w-[90px] whitespace-nowrap">Fine<br />Motor</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase w-[90px] whitespace-nowrap">Self<br />Help</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase w-[90px] whitespace-nowrap">Receptive<br />Lang.</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase w-[90px] whitespace-nowrap">Expressive<br />Lang.</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase w-[90px] whitespace-nowrap">Cognitive</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase w-[90px] whitespace-nowrap border-r dark:border-slate-700">Socio<br />Emotional</th>

                                    <th className="px-4 text-center text-[10px] font-extrabold tracking-widest text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 uppercase w-[110px] whitespace-nowrap">Standard<br />Score</th>
                                    <th className="px-4 w-[200px] text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap">Overall Interpretation</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                                                <TableIcon className="mb-4 size-10 opacity-30" />
                                                <p className="text-base font-medium text-slate-600 dark:text-slate-400">No records found.</p>
                                                <p className="text-sm">Complete evaluations in the matrix to populate this sheet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.id} className="h-14 hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors group">

                                            <td className="px-4 font-bold text-slate-900 dark:text-white sticky left-0 z-10 bg-white dark:bg-zinc-900 outline outline-1 outline-slate-100 dark:outline-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-zinc-800 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap">
                                                <div className="truncate w-[180px]" title={row.name}>{row.name}</div>
                                            </td>

                                            <td className="px-2 text-center font-medium text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{row.gender ? row.gender[0].toUpperCase() : '-'}</td>
                                            <td className="px-2 text-center font-medium text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{row.age_years !== null ? `${row.age_years}y ${row.age_months}m` : '-'}</td>

                                            <td className={`px-2 text-center border-x border-slate-100 dark:border-slate-800 whitespace-nowrap ${getScoreColor(row.gross_motor)}`}>{row.gross_motor}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap ${getScoreColor(row.fine_motor)}`}>{row.fine_motor}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap ${getScoreColor(row.self_help)}`}>{row.self_help}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap ${getScoreColor(row.receptive)}`}>{row.receptive}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap ${getScoreColor(row.expressive)}`}>{row.expressive}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap ${getScoreColor(row.cognitive)}`}>{row.cognitive}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 dark:border-slate-800 whitespace-nowrap ${getScoreColor(row.socio_emotional)}`}>{row.socio_emotional}</td>

                                            <td className={`px-4 text-center border-x-2 border-indigo-100 dark:border-indigo-900 text-lg whitespace-nowrap transition-colors ${getStandardScoreColor(row.standard_score)}`}>
                                                {row.standard_score}
                                            </td>
                                            <td className="px-4 text-xs font-medium text-slate-600 dark:text-slate-400 italic bg-slate-50/30 dark:bg-zinc-950/30 whitespace-nowrap border-l border-slate-100 dark:border-slate-800">
                                                <div className="truncate w-[180px]" title={row.interpretation}>{row.interpretation}</div>
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
