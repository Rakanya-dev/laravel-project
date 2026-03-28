import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react'; // 👈 1. Import usePage
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

    // 🚀 2. Extract the auth object from Inertia props
    const { auth } = usePage().props as any;

    // 🚀 3. Safely build the teacher's name (Fallback if missing)
    const activeTeacherName = auth?.user
        ? `${auth.user.first_name} ${auth.user.last_name}`
        : 'Child Development Worker';

    // Trigger our new Phantom Print utility
    const handlePrint = () => {
        // 🚀 4. Pass the teacherName into the PDF generator
        generateConsolidatedReportPDF({
            rows,
            currentType,
            daycareName,
            teacherName: activeTeacherName // Add this line!
        });
    };

    const handleTypeChange = (val: string) => {
        router.get(route('teacher.reports.consolidated'), { type: val }, { preserveState: true });
    };

    // --- CONDITIONAL FORMATTING LOGIC ---
    const getScoreColor = (score: number | string) => {
        if (typeof score !== 'number') return 'text-slate-400 bg-slate-50/50';

        if (score <= 3) return 'bg-red-50 text-red-700 font-bold border-red-100'; // Delay
        if (score >= 13) return 'bg-emerald-50 text-emerald-700 font-bold border-emerald-100'; // Advanced
        return 'text-slate-700 bg-white'; // Average
    };

    const getStandardScoreColor = (score: number | string) => {
        if (typeof score !== 'number') return 'text-slate-400 bg-slate-50/50';

        if (score <= 79) return 'bg-red-100 text-red-800 font-black border-red-200'; // Delay
        if (score >= 110) return 'bg-emerald-100 text-emerald-800 font-black border-emerald-200'; // Advanced
        return 'bg-indigo-50 text-indigo-800 font-black border-indigo-100'; // Average
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports', href: '#' }, { title: 'Master Sheet', href: '#' }]}>
            <Head title={`Consolidated Record - ${currentType}`} />

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
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner">
                            <TableIcon className="size-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Class Consolidated Record</h2>
                            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                                <Users className="size-4" />
                                {daycareName} • <strong className="text-slate-700">{rows.length} Records</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <Select value={currentType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-indigo-500 sm:w-[220px]">
                                <SelectValue placeholder="Select Assessment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1st Assessment">1st Evaluation</SelectItem>
                                <SelectItem value="2nd Assessment">2nd Evaluation</SelectItem>
                                <SelectItem value="3rd Assessment">3rd Evaluation</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handlePrint}
                            className="h-11 bg-indigo-600 text-white font-bold shadow-sm hover:bg-indigo-700"
                        >
                            <Printer className="w-4 h-4 mr-2" /> Print Master Sheet
                        </Button>
                    </div>
                </div>

                {/* --- THE MASTER TABLE --- */}
                <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] min-h-[500px]">
                        <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
                            <thead className="sticky top-0 z-20 bg-slate-100 shadow-sm outline outline-1 outline-slate-200">
                                <tr className="h-16">
                                    <th className="px-4 sticky left-0 z-30 bg-slate-100 outline outline-1 outline-slate-200 w-[220px] text-xs font-bold tracking-widest text-slate-600 uppercase whitespace-nowrap">
                                        Learner Name
                                    </th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">Sex</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">Age<br />(Mo)</th>

                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap">Gross<br />Motor</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap">Fine<br />Motor</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap">Self<br />Help</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap">Receptive<br />Lang.</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap">Expressive<br />Lang.</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap">Cognitive</th>
                                    <th className="px-2 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase w-[90px] whitespace-nowrap">Socio<br />Emotional</th>

                                    <th className="px-4 text-center text-[10px] font-extrabold tracking-widest text-indigo-700 bg-indigo-50/50 uppercase w-[110px] whitespace-nowrap">Standard<br />Score</th>
                                    <th className="px-4 w-[200px] text-[10px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">Overall Interpretation</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <TableIcon className="mb-4 size-10 opacity-30" />
                                                <p className="text-base font-medium text-slate-600">No records found.</p>
                                                <p className="text-sm">Complete evaluations in the matrix to populate this sheet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.id} className="h-14 hover:bg-slate-50/80 transition-colors group">

                                            <td className="px-4 font-bold text-slate-900 sticky left-0 z-10 bg-white outline outline-1 outline-slate-100 group-hover:bg-slate-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap">
                                                <div className="truncate w-[180px]" title={row.name}>{row.name}</div>
                                            </td>

                                            <td className="px-2 text-center font-medium text-slate-500 border-r border-slate-100 whitespace-nowrap">{row.gender ? row.gender[0].toUpperCase() : '-'}</td>
                                            <td className="px-2 text-center font-medium text-slate-500 border-r border-slate-100 whitespace-nowrap">{row.age_years !== null ? `${row.age_years}y ${row.age_months}m` : '-'}</td>

                                            <td className={`px-2 text-center border-x border-slate-100 whitespace-nowrap ${getScoreColor(row.gross_motor)}`}>{row.gross_motor}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 whitespace-nowrap ${getScoreColor(row.fine_motor)}`}>{row.fine_motor}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 whitespace-nowrap ${getScoreColor(row.self_help)}`}>{row.self_help}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 whitespace-nowrap ${getScoreColor(row.receptive)}`}>{row.receptive}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 whitespace-nowrap ${getScoreColor(row.expressive)}`}>{row.expressive}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 whitespace-nowrap ${getScoreColor(row.cognitive)}`}>{row.cognitive}</td>
                                            <td className={`px-2 text-center border-r border-slate-100 whitespace-nowrap ${getScoreColor(row.socio_emotional)}`}>{row.socio_emotional}</td>

                                            <td className={`px-4 text-center border-x-2 border-indigo-100 text-lg whitespace-nowrap ${getStandardScoreColor(row.standard_score)}`}>
                                                {row.standard_score}
                                            </td>
                                            <td className="px-4 text-xs font-medium text-slate-600 italic bg-slate-50/30 whitespace-nowrap">
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
