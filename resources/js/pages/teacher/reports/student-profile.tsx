import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Award, Calendar, FileText, Printer, School } from 'lucide-react';
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

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
    const { auth } = usePage().props as any;

    // Check dark mode state to dynamically style the Radar Chart
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
        generateStudentReportPDF({
            student,
            history,
            daycare,
            teacherName: activeTeacherName
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

            <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 transition-colors duration-200">

                <div className="flex items-center justify-between pb-2">
                    <Link href={route('teacher.my-students.index')} className="group flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white">
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        Back to Students
                    </Link>
                    <Button onClick={handlePrint} className="bg-indigo-600 dark:bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-500 h-11 rounded-xl transition-colors">
                        <Printer className="mr-2 size-4" /> Print Document
                    </Button>
                </div>

                {/* --- HERO BANNER --- */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl dark:shadow-indigo-900/10">
                    <div className="absolute -right-20 -top-40 opacity-20 blur-3xl">
                        <div className="size-96 rounded-full bg-indigo-500"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-200 border border-white/10 backdrop-blur-md">
                            <Award className="size-3.5" />
                            Early Childhood Care and Development
                        </div>

                        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                            {student.first_name} {student.last_name}
                        </h1>

                        {student.deleted_at && (
                            <span className="mt-4 inline-block rounded-full bg-amber-500/20 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-200 border border-amber-500/30 backdrop-blur-sm">
                                Archived / Alumni Record
                            </span>
                        )}

                        <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-12">
                            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-6 py-3 border border-white/10 backdrop-blur-sm">
                                <School className="size-5 text-indigo-300" />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Child Development Center</p>
                                    <p className="text-sm font-bold text-slate-100">{daycare?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* --- RADAR CHART SIDEBAR --- */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 p-6 text-center">
                                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Developmental Radar</h3>
                                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Visualization of scaled scores</p>
                            </div>

                            <div className="p-4 h-[350px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                                            <PolarGrid stroke={isDarkMode ? '#334155' : '#cbd5e1'} strokeDasharray="3 3" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#94a3b8' : '#475569', fontSize: 10, fontWeight: 600 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 19]} tick={{ fontSize: 9, fill: isDarkMode ? '#64748b' : '#94a3b8' }} />

                                            <Radar name="1st Assessment" dataKey="1st Assessment" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.2} />
                                            <Radar name="2nd Assessment" dataKey="2nd Assessment" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                                            <Radar name="3rd Assessment" dataKey="3rd Assessment" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.2} />

                                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingTop: '10px', color: isDarkMode ? '#94a3b8' : '#475569' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center space-y-3 text-slate-400 dark:text-slate-600">
                                        <div className="rounded-full bg-slate-50 dark:bg-zinc-800 p-4">
                                            <FileText className="size-6 text-slate-300 dark:text-slate-700" />
                                        </div>
                                        <p className="text-sm font-medium">Insufficient data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- ASSESSMENT HISTORY CARDS --- */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                        {history.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900/50 text-slate-500 transition-colors">
                                <FileText className="mb-4 size-8 text-slate-300 dark:text-slate-700" />
                                <p className="font-medium">No completed assessments available.</p>
                            </div>
                        ) : (
                            history.map((record) => (
                                <div key={record.id} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md">

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950/50 p-5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                                <FileText className="size-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-extrabold text-slate-900 dark:text-white transition-colors">{record.type}</h3>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <Calendar className="size-3.5" />
                                                    Tested: {record.date}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-0 overflow-x-auto">
                                        <table className="w-full border-collapse text-left text-sm min-w-[500px]">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                                    <th className="w-[50%] py-3.5 pl-6 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Developmental Domain</th>
                                                    <th className="w-[25%] py-3.5 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Raw Score</th>
                                                    <th className="w-[25%] py-3.5 pr-6 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Scaled Score</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {record.domains.map((d, i) => (
                                                    <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                        <td className="py-3 pl-6 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm">
                                                            {d.name || d.domain_name || d.domain?.name || 'Unknown Domain'}
                                                        </td>
                                                        <td className="py-3 text-center text-slate-500 dark:text-slate-400 font-medium">
                                                            {formatScore(d.score ?? d.raw_score)}
                                                        </td>
                                                        <td className="py-3 pr-6 text-center">
                                                            <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 py-1 px-3 text-sm font-bold text-indigo-700 dark:text-indigo-400 transition-colors">
                                                                {d.scaled_score ?? '-'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                            <tfoot className="bg-slate-50 dark:bg-zinc-950/50">
                                                <tr>
                                                    <td colSpan={3} className="p-0">
                                                        <div className="flex flex-col sm:flex-row border-t border-slate-200 dark:border-slate-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">

                                                            <div className="flex-1 p-5 flex flex-col justify-center">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Overall Interpretation</span>
                                                                <span className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{record.interpretation}</span>
                                                            </div>

                                                            <div className="flex-1 p-5 flex items-center justify-between sm:justify-center gap-4">
                                                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scaled Score Sum</span>
                                                                <span className="text-xl font-black text-slate-700 dark:text-slate-300">
                                                                    {record.domains.reduce((sum, d) => sum + (Number(d.scaled_score) || 0), 0)}
                                                                </span>
                                                            </div>

                                                            <div className="flex-1 p-5 flex items-center justify-between sm:justify-end gap-4 bg-indigo-50/50 dark:bg-indigo-500/10">
                                                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Standard Score</span>
                                                                <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{record.standard_score}</span>
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
