import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Award, Calendar, FileText, Printer, School } from 'lucide-react';
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { generateStudentReportPDF } from '@/utils/print-student-report';
import { getEccdDomainInterpretation, getItedDomainInterpretation, getOverallInterpretation } from '@/utils/eccd-scoring-system';

export interface Domain {
    id: number;
    name: string;
}

interface DomainScore {
    name?: string;
    domain_name?: string;
    domain?: { name: string; is_core?: boolean };
    scaled_score: number | string;
    score?: number;
    raw_score?: number;
    max_score?: number;
    rating?: string;
}

interface AssessmentRecord {
    id: number;
    type: string;
    date: string;
    // 🚀 Added Exact Backend Columns to prevent guessing
    age_years?: number;
    age_months: number;
    form_type?: string;
    form_version?: string;

    standard_score: number;
    overall_score?: number;
    sum_of_scaled?: number;

    interpretation: string;
    overall_rating?: string;
    domains: DomainScore[];
}

interface ReportProps {
    student: any;
    history: AssessmentRecord[];
    daycare: any;
    domains?: Domain[];
    teacherName: string;
}

const formatScore = (val: string | number | null | undefined) => {
    if (val === null || val === undefined || val === '') return '-';
    return Math.round(Number(val));
};

const CHART_COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

export default function StudentProfileReport({ student, history, daycare, domains = [], teacherName }: ReportProps) {
    const { auth } = usePage().props as any;
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const activeTeacherName = teacherName
        || (auth?.user ? `${auth.user.first_name} ${auth.user.last_name}` : null)
        || auth?.user?.name
        || 'Child Development Worker';

    const assessmentTypes = Array.from(new Set(history.map(h => h.type)));

    const domainNames = domains.length > 0
        ? domains.map(d => d.name)
        : Array.from(new Set(history.flatMap(r => r.domains.map(d => d.name || d.domain_name || d.domain?.name || 'Unknown'))));

    const chartData = domainNames.map((dName) => {
        const dataPoint: any = { subject: dName };

        history.forEach((record) => {
            const matchingDomain = record.domains.find(
                (d) => (d.name || d.domain_name || d.domain?.name) === dName
            );
            dataPoint[record.type] = Number(matchingDomain?.scaled_score) || 0;
        });

        return dataPoint;
    });

    const handlePrint = () => {
        generateStudentReportPDF({
            student,
            history,
            daycare,
            domains,
            teacherName: activeTeacherName
        } as any);
    };

    // Check if the student ONLY has ITED records so we can adjust the Radar Chart scale
    const isPurelyIted = history.every(r => (r.age_years !== undefined ? r.age_years < 3 : r.age_months < 36) && r.form_type !== 'record_2');

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'My Students', href: route('teacher.my-students.index') },
                { title: 'Reports', href: '#' },
                { title: student.first_name, href: '#' },
            ]}
        >
            <Head title={`${student.first_name}'s Report`} />

            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                    <Link
                        href={route('teacher.my-students.index')}
                        className="group flex items-center gap-2 text-base font-bold text-slate-500 dark:text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
                        <span className="hidden sm:inline">Back to My Students</span>
                        <span className="sm:hidden">Back</span>
                    </Link>
                    <Button onClick={handlePrint} className="h-12 px-6 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-white text-base font-bold shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors w-full sm:w-auto">
                        <Printer className="mr-2 size-5" /> Print Document
                    </Button>
                </div>

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 sm:p-14 text-white shadow-xl dark:shadow-indigo-900/20 transition-colors">
                    <div className="absolute -right-20 -top-40 opacity-30 blur-3xl pointer-events-none">
                        <div className="size-96 rounded-full bg-indigo-500"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-200 border border-white/10 backdrop-blur-md shadow-sm">
                            <Award className="size-4" />
                            Early Childhood Care and Development
                        </div>

                        <h1 className="mt-4 text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-sm transition-colors">
                            {student.first_name} {student.last_name}
                        </h1>

                        <div className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-12">
                            <div className="flex items-center gap-4 rounded-2xl bg-white/5 px-6 py-4 border border-white/10 backdrop-blur-sm shadow-sm transition-colors">
                                <School className="size-6 text-indigo-300" />
                                <div className="text-left mt-0.5">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Child Development Center</p>
                                    <p className="text-base font-bold text-slate-100 mt-1">{daycare?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* LEFT COLUMN: Radar Chart */}
                    <div className="lg:col-span-4 xl:col-span-4">
                        <div className="sticky top-8 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                            <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 p-6 sm:p-8 text-center transition-colors">
                                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">Developmental Radar</h3>
                                <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Visualization of scores</p>
                            </div>

                            <div className="p-4 sm:p-6 h-[400px] w-full bg-white dark:bg-zinc-900 transition-colors">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                                            <PolarGrid stroke={isDarkMode ? '#334155' : '#e2e8f0'} strokeDasharray="3 3" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 700 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 19]} tick={{ fontSize: 10, fontWeight: 700, fill: isDarkMode ? '#64748b' : '#94a3b8' }} />

                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: isDarkMode ? '#18181b' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }} itemStyle={{ fontWeight: 'bold' }} />

                                            {assessmentTypes.map((type, index) => (
                                                <Radar key={type} name={type} dataKey={type} stroke={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={2.5} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.2} />
                                            ))}

                                            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '15px', color: isDarkMode ? '#94a3b8' : '#475569' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center space-y-4 text-slate-400 dark:text-slate-500 transition-colors">
                                        <div className="rounded-2xl bg-slate-50 dark:bg-zinc-800 p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                                            <FileText className="size-8 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors">Insufficient data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Assessment History Cards */}
                    <div className="lg:col-span-8 xl:col-span-8 space-y-8">
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/50 text-center transition-colors">
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                    <FileText className="size-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No completed assessments</h3>
                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">Evaluations will appear here once finalized.</p>
                            </div>
                        ) : (
                            history.map((record) => {
                                // 🚀 BULLETPROOF ITED/ECCD DETECTION
                                const ageY = record.age_years !== undefined ? Number(record.age_years) : Math.floor(record.age_months / 12);
                                const ageM = record.age_years !== undefined ? Number(record.age_months) : record.age_months % 12;

                                const isEccd =
                                    record.form_type === 'record_2' ||
                                    record.form_version?.includes('ECCD') ||
                                    ageY >= 3;

                                // Extract overall stats
                                const totalMax = record.domains.reduce((sum, d) => sum + (d.max_score || 0), 0);
                                const totalRaw = record.domains.reduce((sum, d) => sum + (d.score ?? d.raw_score ?? 0), 0);
                                const displayScore = record.overall_score ?? record.standard_score ?? totalRaw;

                                // Prioritize exact backend string if available, fallback to manual calculation
                                const forcedOverallInterpretation = record.overall_rating || (isEccd
                                    ? getOverallInterpretation(displayScore, ageY, ageM)
                                    : getOverallInterpretation(displayScore, ageY, ageM, totalMax));

                                return (
                                    <div key={record.id} className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 duration-300">

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 transition-colors">
                                            <div className="flex items-center gap-4 sm:gap-5">
                                                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20 transition-colors">
                                                    <FileText className="size-6" strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                                                        {record.type} {isEccd ? '' : <span className="ml-2 text-sm text-slate-400 font-bold tracking-widest uppercase">(ITED)</span>}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">
                                                        <Calendar className="size-4" />
                                                        Tested: {record.date}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-0 overflow-x-auto custom-scrollbar">
                                            <table className="w-full border-collapse text-left min-w-[650px]">
                                                <thead className="bg-slate-50 dark:bg-zinc-900/50 transition-colors">
                                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                                        <th className="w-[30%] py-5 pl-6 sm:pl-8 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] transition-colors">Developmental Domain</th>

                                                        {/* 🚀 TOGGLE TABLE HEADERS */}
                                                        {isEccd ? (
                                                            <>
                                                                <th className="w-[15%] py-5 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] transition-colors">Raw Score</th>
                                                                <th className="w-[15%] py-5 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] transition-colors">Scaled Score</th>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <th className="w-[15%] py-5 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] transition-colors">Max Possible</th>
                                                                <th className="w-[15%] py-5 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] transition-colors">Raw Score</th>
                                                            </>
                                                        )}

                                                        <th className="w-[40%] py-5 pr-6 sm:pr-8 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[11px] transition-colors">Interpretation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                                    {record.domains.map((d, i) => {
                                                        const rawVal = Number(d.score ?? d.raw_score ?? 0);

                                                        return (
                                                            <tr key={i} className="group hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors h-16">
                                                                <td className="py-4 pl-6 sm:pl-8 text-slate-700 dark:text-slate-200 font-bold text-base transition-colors">
                                                                    {d.name || d.domain_name || d.domain?.name || 'Unknown Domain'}
                                                                </td>

                                                                {/* 🚀 TOGGLE TABLE CELLS */}
                                                                {isEccd ? (
                                                                    <>
                                                                        <td className="py-4 text-center text-slate-600 dark:text-slate-400 font-bold text-base transition-colors">
                                                                            {formatScore(rawVal)}
                                                                        </td>
                                                                        <td className="py-4 text-center">
                                                                            <span className="inline-flex min-w-[3rem] items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 py-1.5 px-3 text-base font-black text-indigo-700 dark:text-indigo-400 transition-colors">
                                                                                {d.scaled_score ?? '-'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-4 pr-6 sm:pr-8 text-right">
                                                                            <Badge variant="outline" className="text-sm font-bold bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 shadow-sm">
                                                                                {d.rating || getEccdDomainInterpretation(Number(d.scaled_score))}
                                                                            </Badge>
                                                                        </td>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <td className="py-4 text-center text-slate-400 dark:text-slate-500 font-bold text-sm transition-colors">
                                                                            / {d.max_score ?? '-'}
                                                                        </td>
                                                                        <td className="py-4 text-center">
                                                                            <span className="inline-flex min-w-[3rem] items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 py-1.5 px-3 text-base font-black text-emerald-700 dark:text-emerald-400 transition-colors">
                                                                                {formatScore(rawVal)}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-4 pr-6 sm:pr-8 text-right">
                                                                            <Badge variant="outline" className="text-sm font-bold bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 shadow-sm">
                                                                                {d.rating || getItedDomainInterpretation(rawVal, Number(d.max_score || 1))}
                                                                            </Badge>
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>

                                                <tfoot className="bg-slate-50 dark:bg-zinc-900/50 transition-colors">
                                                    <tr>
                                                        <td colSpan={4} className="p-0">
                                                            <div className="flex flex-col sm:flex-row border-t border-slate-200 dark:border-slate-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 transition-colors">

                                                                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                                                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Overall Interpretation</span>
                                                                    <span className="mt-2 text-lg font-black text-slate-900 dark:text-white transition-colors">
                                                                        {forcedOverallInterpretation}
                                                                    </span>
                                                                </div>

                                                                {/* 🚀 TOGGLE TABLE FOOTER STATS */}
                                                                {isEccd ? (
                                                                    <>
                                                                        <div className="flex-1 p-6 sm:p-8 flex items-center justify-between sm:justify-center gap-4 transition-colors">
                                                                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Scaled Score Sum</span>
                                                                            <span className="text-3xl font-black text-slate-800 dark:text-slate-200 transition-colors">
                                                                                {record.sum_of_scaled ?? record.domains.reduce((sum, d) => {
                                                                                    const isCore = d.domain?.is_core !== false;
                                                                                    return sum + (isCore ? (Number(d.scaled_score) || 0) : 0);
                                                                                }, 0)}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex-1 p-6 sm:p-8 flex items-center justify-between sm:justify-end gap-5 bg-indigo-50/50 dark:bg-indigo-500/10 transition-colors">
                                                                            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400 transition-colors">Standard Score</span>
                                                                            <span className="text-4xl font-black text-indigo-700 dark:text-indigo-300 transition-colors">{displayScore}</span>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex-1 p-6 sm:p-8 flex items-center justify-between sm:justify-center gap-4 transition-colors">
                                                                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Checklist Mode</span>
                                                                            <span className="text-xl font-black text-slate-600 dark:text-slate-400 transition-colors">
                                                                                ITED                                                                        </span>
                                                                        </div>

                                                                        <div className="flex-1 p-6 sm:p-8 flex items-center justify-between sm:justify-end gap-5 bg-emerald-50/50 dark:bg-emerald-500/10 transition-colors">
                                                                            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 transition-colors">Total Raw Score</span>
                                                                            <span className="text-4xl font-black text-emerald-700 dark:text-emerald-300 transition-colors">{displayScore}</span>
                                                                        </div>
                                                                    </>
                                                                )}

                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
