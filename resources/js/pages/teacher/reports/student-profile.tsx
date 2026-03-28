import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Award, Calendar, FileText, Printer, School } from 'lucide-react';
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';

// 🚀 IMPORT THE NEW UTILITY HERE
import { generateStudentReportPDF } from '@/utils/print-student-report';

// --- TYPES ---
interface DomainScore {
    name?: string;
    domain_name?: string;
    domain?: { name: string };
    scaled_score: number | string;
    score?: number;
    raw_score?: number;
}

interface AssessmentRecord {
    id: number;
    type: string;
    date: string;
    age_months: number;
    standard_score: number;
    interpretation: string;
    domains: DomainScore[];
}

interface ReportProps {
    student: any;
    history: AssessmentRecord[];
    daycare: any;
    teacherName: string;
}

const formatScore = (val: string | number | null | undefined) => {
    if (val === null || val === undefined || val === '') return '-';
    return Math.round(Number(val));
};

export default function StudentProfileReport({ student, history, daycare, teacherName }: ReportProps) {

    // 🚀 1. CALL USEPAGE AT THE TOP LEVEL OF THE COMPONENT
    const { auth } = usePage().props as any;

    // 🚀 2. GRAB THE LOGGED IN USER'S NAME (Fallback to props, then auth user, then default)
    const activeTeacherName = teacherName
        || (auth?.user ? `${auth.user.first_name} ${auth.user.last_name}` : null)
        || auth?.user?.name
        || 'Child Development Worker';

    const chartData = (history[0]?.domains || []).map((domain, index) => {
        const dName = domain.name || domain.domain_name || domain.domain?.name || `Domain ${index + 1}`;
        const dataPoint: any = { subject: dName };

        history.forEach((record) => {
            const matchingDomain = record.domains.find(
                (d) => (d.name || d.domain_name || d.domain?.name) === dName
            );
            const score = Number(matchingDomain?.scaled_score) || 0;

            if (record.type.includes('1st')) dataPoint["1st Assessment"] = score;
            if (record.type.includes('2nd')) dataPoint["2nd Assessment"] = score;
            if (record.type.includes('3rd')) dataPoint["3rd Assessment"] = score;
        });

        return dataPoint;
    });

    const handlePrint = () => {
        // 🚀 3. PASS THE EXTRACTED NAME TO THE PDF
        generateStudentReportPDF({
            student,
            history,
            daycare,
            teacherName: activeTeacherName // Use the variable we created above
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'My Students', href: route('teacher.my-students.index') },
                { title: 'Reports', href: '#' },
                { title: student.first_name, href: '#' },
            ]}
        >
            <Head title={`${student.first_name}'s Report`} />

            {/* MAIN WEB LAYOUT */}
            <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8">

                <div className="flex items-center justify-between pb-2">
                    <Link href={route('teacher.my-students.index')} className="group flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        Back to Students
                    </Link>
                    {/* TRIGGER PRINT HERE */}
                    <Button onClick={handlePrint} className="bg-blue-600 text-white shadow-md hover:bg-blue-700">
                        <Printer className="mr-2 size-4" /> Print Document
                    </Button>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 text-white shadow-xl">
                    <div className="absolute -right-20 -top-40 opacity-10 blur-3xl">
                        <div className="size-96 rounded-full bg-blue-500"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200 border border-blue-400/20">
                            <Award className="size-3.5" />
                            Early Childhood Care and Development
                        </div>

                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                            {student.first_name} {student.last_name}
                        </h1>

                        {student.deleted_at && (
                            <span className="mt-4 inline-block rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-200 border border-amber-500/30">
                                Archived / Alumni Record
                            </span>
                        )}

                        <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-12">
                            <div className="flex items-center gap-3 rounded-lg bg-white/5 px-5 py-3 backdrop-blur-sm">
                                <School className="size-5 text-blue-300" />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Child Development Center</p>
                                    <p className="text-sm font-semibold text-slate-100">{daycare?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-slate-50/50 p-6 text-center">
                                <h3 className="text-lg font-extrabold text-slate-800">Developmental Radar</h3>
                                <p className="mt-1 text-xs font-medium text-slate-500">Visualization of scaled scores</p>
                            </div>

                            <div className="p-6 h-[350px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                                            <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 19]} tick={{ fontSize: 9, fill: '#94a3b8' }} />

                                            <Radar name="1st Assessment" dataKey="1st Assessment" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} />
                                            <Radar name="2nd Assessment" dataKey="2nd Assessment" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                                            <Radar name="3rd Assessment" dataKey="3rd Assessment" stroke="#ec4899" strokeWidth={2} fill="#ec4899" fillOpacity={0.2} />

                                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingTop: '10px' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center space-y-3 text-slate-400">
                                        <div className="rounded-full bg-slate-50 p-4">
                                            <FileText className="size-6 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-medium">Insufficient data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 xl:col-span-9 s`pace-y-8">
                        {history.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500">
                                <FileText className="mb-4 size-8 text-slate-300" />
                                <p className="font-medium">No completed assessments available.</p>
                            </div>
                        ) : (
                            history.map((record) => (
                                <div key={record.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-slate-50 p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                <FileText className="size-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-extrabold text-slate-900">{record.type}</h3>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                    <Calendar className="size-3.5" />
                                                    Tested: {record.date}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-0 overflow-x-auto">
                                        <table className="w-full border-collapse text-left text-sm min-w-[500px]">
                                            <thead className="bg-white">
                                                <tr className="border-b border-slate-200">
                                                    <th className="w-[50%] py-3.5 pl-6 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Developmental Domain</th>
                                                    <th className="w-[25%] py-3.5 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Raw Score</th>
                                                    <th className="w-[25%] py-3.5 pr-6 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]">Scaled Score</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {record.domains.map((d, i) => (
                                                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-3 pl-6 text-slate-700 font-semibold text-xs sm:text-sm">
                                                            {d.name || d.domain_name || d.domain?.name || 'Unknown Domain'}
                                                        </td>
                                                        <td className="py-3 text-center text-slate-500 font-medium">
                                                            {formatScore(d.score ?? d.raw_score)}
                                                        </td>
                                                        <td className="py-3 pr-6 text-center">
                                                            <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-blue-50 py-1 px-3 text-sm font-bold text-blue-700">
                                                                {d.scaled_score ?? '-'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                            <tfoot className="bg-slate-50">
                                                <tr>
                                                    <td colSpan={3} className="p-0">
                                                        <div className="flex flex-col sm:flex-row border-t border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">

                                                            {/* 1. Overall Interpretation */}
                                                            <div className="flex-1 p-5 flex flex-col justify-center">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Interpretation</span>
                                                                <span className="mt-1 text-sm font-bold text-slate-800">{record.interpretation}</span>
                                                            </div>

                                                            {/* 2. NEW: Sum of Scaled Scores */}
                                                            <div className="flex-1 p-5 flex items-center justify-between sm:justify-center gap-4 bg-slate-50/80">
                                                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Scaled Score Sum</span>
                                                                <span className="text-xl font-bold text-slate-700">
                                                                    {record.domains.reduce((sum, d) => sum + (Number(d.scaled_score) || 0), 0)}
                                                                </span>
                                                            </div>

                                                            {/* 3. Standard Score */}
                                                            <div className="flex-1 p-5 flex items-center justify-between sm:justify-end gap-4 bg-blue-50/50">
                                                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600">Standard Score</span>
                                                                <span className="text-2xl font-black text-blue-700">{record.standard_score}</span>
                                                            </div>

                                                        </div>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
