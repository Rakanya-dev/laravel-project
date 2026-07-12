import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Activity, CheckCircle2, Download, FileCheck, FileText, Info, Link2, MessageCircle, Plus, UploadCloud, UserSquare2, ShieldCheck, CalendarDays, LineChart, X, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Import Partials
import { ChildAssessmentsList } from '@/components/parent/child-assessments-list';
import { ChildReportsList } from '@/components/parent/child-reports-list';
import { ParentChatTab } from '@/components/parent/parent-chat-tab';
import { ParentAssessmentDialog } from '@/components/parent/parent-assessment-dialog';
import { cn } from '@/lib/utils';

// --- TYPES ---
interface ProgressDomain {
    name: string;
    score: number;
    // 🚀 Added scaled score properties so React can actually see them!
    scaled_score?: number;
    scaledScore?: number;
    scaled?: number;
    fullMark: number;
    isEccd?: boolean;
}

interface StudentOverview {
    next_due: string;
    latest_report_id: number | null;
    progress_summary: ProgressDomain[];
}

interface Student {
    id: number;
    name: string;
    daycare: string;
    daycare_id: number;
    age: string;
    overview: StudentOverview;
    assessments: any[];
    reports: any[];
}

interface Conversation {
    contact_id: number;
    contact_name: string;
    contact_role: string;
    contact_avatar?: string | null;
    last_message: string;
    time: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface ParentDashboardProps {
    students: Student[];
    conversations: Conversation[];
    user: User;
    daycares: { id: number; name: string }[];
    pendingEnrollment: any;
    activeMessages: any[];
    teachers: any[];
}

export default function ParentDashboard({ students, conversations, user, daycares, pendingEnrollment, activeMessages, teachers = [] }: ParentDashboardProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>(students?.length > 0 ? students[0].id.toString() : '');

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    const currentStudent = students?.find((s) => s.id.toString() === selectedStudentId);

    // Bulletproof ECCD Detector that ignores bad data
    const isEccdDashboard = useMemo(() => {
        if (!currentStudent) return false;

        // 1. Look at historical assessments first (Most accurate)
        if (currentStudent.assessments && currentStudent.assessments.length > 0) {
            const latest = currentStudent.assessments[0];
            const ageY = latest.age_years !== undefined ? Number(latest.age_years) : Math.floor(Number(latest.age_months) / 12);
            if (latest.form_type === 'record_2' || latest.form_version?.includes('ECCD') || ageY >= 3 || Number(latest.sum_of_scaled) > 0) {
                return true;
            }
        }

        // 2. Look at the progress summary explicitly
        if (currentStudent.overview?.progress_summary?.some(d => Number(d.fullMark) === 19)) return true;

        // 3. Fallback to raw age string (e.g. "5 Years")
        const ageStr = String(currentStudent.age || '').toLowerCase();
        const num = parseInt(ageStr);
        if (!isNaN(num)) {
            if (ageStr.includes('month')) return num >= 37;
            return num >= 3;
        }

        return false;
    }, [currentStudent]);

    const allAssessmentsCompleted = useMemo(() => {
        if (!currentStudent || !currentStudent.assessments) return false;
        const requiredTypes = ['1st Assessment', '2nd Assessment', '3rd Assessment'];
        return requiredTypes.every(type =>
            currentStudent.assessments.some(a => a.assessment_type === type && a.status === 'Completed')
        );
    }, [currentStudent]);

    const { data, setData, post, processing, progress, errors, reset, clearErrors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        daycare_id: '',
        birth_cert: null as File | null,
        parent_id_doc: null as File | null,
    });

    const {
        data: linkData,
        setData: setLinkData,
        post: postLink,
        processing: linkProcessing,
        errors: linkErrors,
        reset: resetLink,
        clearErrors: clearLinkErrors,
    } = useForm({
        access_code: '',
        date_of_birth: '',
    });

    const submitEnrollment = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('parent.enroll.store'), {
            onSuccess: () => {
                setIsEnrollModalOpen(false);
                reset();
                toast.success('Secure application submitted successfully!');
            },
            preserveScroll: true,
        });
    };

    const handleLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postLink(route('parent.verify-pin'), {
            onSuccess: () => {
                setIsLinkModalOpen(false);
                resetLink();
                toast.success('Child successfully linked to your account!');
            },
        });
    };

    const closeLinkModal = () => {
        setIsLinkModalOpen(false);
        resetLink();
        clearLinkErrors();
    };

    const closeEnrollModal = () => {
        setIsEnrollModalOpen(false);
        reset();
        clearErrors();
    };

    const handleViewAssessment = (assessment: any) => {
        setSelectedAssessment({
            ...assessment,
            student: {
                first_name: currentStudent?.name.split(' ')[0],
                last_name: currentStudent?.name.split(' ').slice(1).join(' ') || '',
            }
        });
        setIsDetailOpen(true);
    };

    useEffect(() => {
        if (!currentStudent?.daycare_id) return;
        const channel = window.Echo?.private(`daycare.${currentStudent.daycare_id}`)
            .listen('.assessment.updated', (e: any) => {
                if (e.assessment.student_id === currentStudent.id) {
                    router.reload({
                        only: ['students'],
                        // @ts-ignore
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('New assessment data synced!', {
                                description: 'The dashboard has updated with latest scores.'
                            });
                        }
                    });
                }
            });
        return () => {
            if (window.Echo) {
                window.Echo.leave(`daycare.${currentStudent.daycare_id}`);
            }
        };
    }, [currentStudent?.id, currentStudent?.daycare_id]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const openAssessmentId = params.get('open_assessment');

        if (openAssessmentId && students && students.length > 0) {
            for (const student of students) {
                const foundAssessment = student.assessments?.find((a: any) => a.id.toString() === openAssessmentId);

                if (foundAssessment) {
                    setSelectedStudentId(student.id.toString());
                    setActiveTab('academics');

                    const finalScore = Number(foundAssessment.overall_score ?? foundAssessment.overallScore ?? foundAssessment.standard_score ?? foundAssessment.standardScore ?? 0);
                    const finalSum = Number(foundAssessment.sum_of_scaled ?? foundAssessment.sumOfScaled ?? 0);

                    setSelectedAssessment({
                        ...foundAssessment,
                        standardScore: finalScore,
                        standard_score: finalScore,
                        overall_score: finalScore,
                        sumOfScaled: finalSum,
                        sum_of_scaled: finalSum,
                        student: {
                            first_name: student.name.split(' ')[0],
                            last_name: student.name.split(' ').slice(1).join(' ') || '',
                        }
                    });

                    setIsDetailOpen(true);
                    window.history.replaceState({}, '', route('parent.dashboard'));
                    break;
                }
            }
        }
    }, [students]);

    const handleDownload = (id: number) => window.open(route('parent.assessments.download', id), '_blank');
    const handlePrint = (id: number) => window.open(route('parent.assessments.print', id), '_blank');
    const handleReportDownload = (id: number) => window.open(route('parent.reports.download', id), '_blank');
    const handleReportPrint = (id: number) => window.open(route('parent.reports.print', id), '_blank');

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const labelClass = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center transition-colors";
    const inputClass = "h-12 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 px-4 text-base font-medium text-slate-900 dark:text-white shadow-sm transition-colors focus-visible:ring-indigo-500 focus:border-indigo-500";

    const enrollmentFormContent = (
        <div className="space-y-8">
            <div className="space-y-6">
                <h3 className="flex items-center text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800 pb-3 transition-colors">
                    <UserSquare2 className="mr-2 size-4" /> Child Details
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="flex flex-col">
                        <label className={labelClass}>First Name <span className="text-red-500 ml-1">*</span></label>
                        <input type="text" className={inputClass} required value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} placeholder="e.g. Juan" />
                        {errors.first_name && <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-red-500">{errors.first_name}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>Last Name <span className="text-red-500 ml-1">*</span></label>
                        <input type="text" className={inputClass} required value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} placeholder="e.g. Dela Cruz" />
                        {errors.last_name && <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-red-500">{errors.last_name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="flex flex-col">
                        <label className={labelClass}>Middle Name</label>
                        <input type="text" className={inputClass} value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} placeholder="Optional" />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>Date of Birth <span className="text-red-500 ml-1">*</span></label>
                        <input type="date" className={inputClass} required value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelClass}>Gender <span className="text-red-500 ml-1">*</span></label>
                        <select className={inputClass} required value={data.gender} onChange={(e) => setData('gender', e.target.value)}>
                            <option value="" disabled className="dark:bg-zinc-900">Select gender</option>
                            <option value="Male" className="dark:bg-zinc-900">Male</option>
                            <option value="Female" className="dark:bg-zinc-900">Female</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className={labelClass}>Select Daycare Branch <span className="text-red-500 ml-1">*</span></label>
                    <select className={inputClass} required value={data.daycare_id} onChange={(e) => setData('daycare_id', e.target.value)}>
                        <option value="" disabled className="dark:bg-zinc-900">Choose a daycare location...</option>
                        {daycares?.map((d: any) => (<option key={d.id} value={d.id} className="dark:bg-zinc-900">{d.name}</option>))}
                    </select>
                </div>
            </div>

            <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 transition-colors">
                    <h3 className="flex items-center text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                        <ShieldCheck className="mr-2 size-4" /> Secure Document Upload
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Max 5MB</span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="group flex flex-col">
                        <label className={labelClass}>
                            <FileText className="mr-1.5 size-4" /> Birth Certificate <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className={`relative flex h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${data.birth_cert ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 hover:border-emerald-600' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-zinc-950/50 hover:border-indigo-400 dark:hover:border-indigo-600'}`}>
                            {data.birth_cert ? (
                                <div className="flex flex-col items-center space-y-2">
                                    <FileCheck className="size-8 text-emerald-600 dark:text-emerald-500" />
                                    <span className="w-56 truncate px-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">{data.birth_cert.name}</span>
                                    <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-600/80 dark:text-emerald-400">{formatFileSize(data.birth_cert.size)}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-2">
                                    <UploadCloud className="size-8 text-slate-400 transition-colors group-hover:text-indigo-500" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Click to Upload</span>
                                </div>
                            )}
                            <input type="file" accept=".pdf,image/jpeg,image/png,image/jpg" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={(e) => setData('birth_cert', e.target.files ? e.target.files[0] : null)} />
                        </div>
                        {errors.birth_cert && <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-red-500">{errors.birth_cert}</p>}
                    </div>

                    <div className="group flex flex-col">
                        <label className={labelClass}>
                            <UserSquare2 className="mr-1.5 size-4" /> Valid Parent ID <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className={`relative flex h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${data.parent_id_doc ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 hover:border-emerald-600' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-zinc-950/50 hover:border-indigo-400 dark:hover:border-indigo-600'}`}>
                            {data.parent_id_doc ? (
                                <div className="flex flex-col items-center space-y-2">
                                    <FileCheck className="size-8 text-emerald-600 dark:text-emerald-500" />
                                    <span className="w-56 truncate px-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">{data.parent_id_doc.name}</span>
                                    <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-600/80 dark:text-emerald-400">{formatFileSize(data.parent_id_doc.size)}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-2">
                                    <UploadCloud className="size-8 text-slate-400 transition-colors group-hover:text-indigo-500" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Click to Upload</span>
                                </div>
                            )}
                            <input type="file" accept=".pdf,image/jpeg,image/png,image/jpg" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={(e) => setData('parent_id_doc', e.target.files ? e.target.files[0] : null)} />
                        </div>
                        {errors.parent_id_doc && <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-red-500">{errors.parent_id_doc}</p>}
                    </div>
                </div>
            </div>

            {progress && (
                <div className="pt-3">
                    <div className="mb-2 flex justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-indigo-600 dark:text-indigo-400">Encrypting & Uploading...</span>
                        <span className="text-slate-500 dark:text-slate-400">{progress.percentage}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out" style={{ width: `${progress.percentage}%` }} />
                    </div>
                </div>
            )}
        </div>
    );

    // --- ZERO STATE (No Children Enrolled) ---
    if (!currentStudent) {
        return (
            <AppLayout>
                <Head title="Enrollment" />
                <div className="container mx-auto max-w-4xl px-4 py-10 sm:py-16 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {pendingEnrollment ? (
                        <div className="flex flex-col items-center justify-center p-8 sm:p-14 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-3xl shadow-sm text-center transition-colors">
                            <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-500/30">
                                <CheckCircle2 className="size-10" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-emerald-900 dark:text-white tracking-tight">Application Under Review</h2>
                            <p className="mt-4 max-w-xl text-base sm:text-lg font-medium text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
                                We have securely received your application for <strong className="font-bold text-emerald-900 dark:text-emerald-200">{pendingEnrollment.first_name}</strong>. The daycare admin
                                is currently verifying your documents. You will have full dashboard access once approved.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl bg-white dark:bg-zinc-950 transition-colors">
                            <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 p-8 sm:px-10 sm:py-10 sm:flex-row sm:items-center sm:justify-between transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors">
                                        <UserPlus className="size-8" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Enroll Your Child</h2>
                                        <p className="mt-1.5 text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">Provide details and verification documents below.</p>
                                    </div>
                                </div>
                                <Button onClick={() => setIsLinkModalOpen(true)} variant="outline" className="mt-6 h-12 px-6 rounded-xl font-bold text-base border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 shadow-sm hover:bg-indigo-50 dark:hover:bg-zinc-800 sm:mt-0 transition-colors w-full sm:w-auto">
                                    <Link2 className="mr-2 size-5" /> Have a PIN?
                                </Button>
                            </div>

                            <form onSubmit={submitEnrollment} className="p-8 sm:p-10 bg-slate-50 dark:bg-zinc-950/30 transition-colors">
                                {enrollmentFormContent}
                                <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-8 transition-colors">
                                    <Button type="submit" disabled={processing} className="h-14 w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-lg font-bold text-white rounded-xl shadow-md transition-colors">
                                        {processing ? 'Processing Request...' : 'Submit Secure Application'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ZERO STATE LINK MODAL */}
                    <Dialog open={isLinkModalOpen} onOpenChange={closeLinkModal}>
                        <DialogContent hideClose className="sm:max-w-[500px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col">
                            <DialogHeader className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors text-left shrink-0">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors">
                                        <Link2 className="size-6" strokeWidth={2.5} />
                                    </div>
                                    <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Link Your Child
                                    </DialogTitle>
                                </div>
                                <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors leading-relaxed">
                                    Enter the Secret PIN provided by the Center Administrator.
                                </DialogDescription>
                            </DialogHeader>

                            <form id="zero-state-link-modal-form" onSubmit={handleLinkSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50 dark:bg-zinc-950/30">
                                <div className="flex flex-col">
                                    <label className={labelClass}>Secret PIN</label>
                                    <input type="text" placeholder="X7B9WQ" value={linkData.access_code} onChange={(e) => setLinkData('access_code', e.target.value.toUpperCase())} className="h-14 w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-900 px-4 text-center font-mono text-3xl font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-400 uppercase shadow-sm transition-colors placeholder:tracking-normal placeholder:text-slate-300 dark:placeholder:text-slate-800 focus:border-indigo-500 focus-visible:ring-indigo-500" maxLength={8} />
                                    {linkErrors.access_code && <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">{linkErrors.access_code}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className={labelClass}>Child's Birth Date</label>
                                    <input type="date" value={linkData.date_of_birth} onChange={(e) => setLinkData('date_of_birth', e.target.value)} className={inputClass} />
                                    {linkErrors.date_of_birth && <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">{linkErrors.date_of_birth}</p>}
                                </div>
                            </form>

                            <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                                <Button type="button" variant="ghost" onClick={closeLinkModal} disabled={linkProcessing} className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                                    <X className="mr-2 size-5" /> Cancel
                                </Button>
                                <Button type="submit" form="zero-state-link-modal-form" disabled={linkProcessing} className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors">
                                    {linkProcessing ? 'Verifying...' : 'Verify PIN'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </AppLayout>
        );
    }

    // --- MAIN DASHBOARD (Children Enrolled) ---
    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-200 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-6 sm:space-y-8">

                    {/* BANNER IF A SECOND CHILD IS PENDING */}
                    {pendingEnrollment && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-500/10 p-5 text-blue-800 dark:text-blue-300 shadow-sm transition-colors">
                            <Info className="size-6 shrink-0 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm sm:text-base font-medium">
                                Your application for <strong className="font-bold text-blue-900 dark:text-blue-200">{pendingEnrollment.first_name} {pendingEnrollment.last_name}</strong> is under review by the Admin.
                            </p>
                        </div>
                    )}

                    {/* HEADER CARD */}
                    <div className="flex flex-col justify-between gap-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm md:flex-row md:items-center transition-colors">
                        <div className="flex items-center gap-5 sm:gap-6">
                            <div className="flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 text-3xl font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 shadow-sm transition-all">
                                {currentStudent?.name.charAt(0)}
                            </div>
                            <div className="text-left">
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">{currentStudent?.name}</h1>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">{currentStudent?.daycare}</p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:items-end">
                            {students.length > 1 && (
                                <div className="w-full md:w-auto text-left">
                                    <label className={labelClass}>Switch Child</label>
                                    <select className={inputClass} value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                                        {students.map((s) => (<option key={s.id} value={s.id} className="dark:bg-zinc-900">{s.name}</option>))}
                                    </select>
                                </div>
                            )}

                            {!pendingEnrollment && (
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <Button onClick={() => setIsLinkModalOpen(true)} variant="outline" className="h-12 w-full sm:w-auto px-6 rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 text-base font-bold transition-colors">
                                        <Link2 className="mr-2 size-5" /> Link PIN
                                    </Button>
                                    <Button onClick={() => setIsEnrollModalOpen(true)} variant="outline" className="h-12 w-full sm:w-auto px-6 rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 text-base font-bold transition-colors">
                                        <Plus className="mr-2 size-5" /> Enroll Another
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6 sm:space-y-8">
                        <div className="border-b border-slate-200 dark:border-slate-800">
                            <TabsList className="flex h-16 w-full justify-start overflow-x-auto bg-transparent p-0 no-scrollbar">
                                <TabsTrigger
                                    value="overview"
                                    className="relative flex h-16 items-center justify-center gap-2.5 rounded-none border-b-2 border-transparent bg-transparent px-4 sm:px-8 py-2 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
                                >
                                    <Activity className="size-5" /> <span>Overview</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="academics"
                                    className="relative flex h-16 items-center justify-center gap-2.5 rounded-none border-b-2 border-transparent bg-transparent px-4 sm:px-8 py-2 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
                                >
                                    <FileText className="size-5" /> <span>Academics</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="messages"
                                    className="relative flex h-16 items-center justify-center gap-2.5 rounded-none border-b-2 border-transparent bg-transparent px-4 sm:px-8 py-2 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
                                >
                                    <MessageCircle className="size-5" /> <span>Messages</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* --- TAB A: OVERVIEW --- */}
                        <TabsContent value="overview" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 transition-colors">
                            <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-2">
                                <div className="space-y-6 lg:space-y-8">
                                    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl transition-colors">
                                        <CardContent className="p-0">
                                            <div className={cn(
                                                "flex items-center gap-5 p-6 sm:p-8 transition-colors",
                                                allAssessmentsCompleted
                                                    ? "bg-emerald-50/50 dark:bg-emerald-500/10"
                                                    : "bg-orange-50/50 dark:bg-orange-500/10"
                                            )}>
                                                <div className={cn(
                                                    "flex size-16 shrink-0 items-center justify-center rounded-xl shadow-sm border transition-colors",
                                                    allAssessmentsCompleted
                                                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/30"
                                                        : "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-500/30"
                                                )}>
                                                    {allAssessmentsCompleted ? <CheckCircle2 className="size-8" /> : <CalendarDays className="size-8" />}
                                                </div>
                                                <div className="text-left min-w-0">
                                                    <p className={cn(
                                                        "text-[11px] font-bold tracking-widest uppercase transition-colors",
                                                        allAssessmentsCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"
                                                    )}>
                                                        {allAssessmentsCompleted ? "Program Status" : "Next Assessment"}
                                                    </p>
                                                    <h3 className="mt-1 text-3xl sm:text-4xl font-black text-slate-900 dark:text-white truncate transition-colors">
                                                        {allAssessmentsCompleted ? "Evaluations Finished" : currentStudent?.overview?.next_due || 'TBD'}
                                                    </h3>
                                                    <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                                        {allAssessmentsCompleted ? "Graduation Ready" : "Estimated Schedule"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl transition-colors">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-indigo-50/50 dark:bg-indigo-500/10 p-6 sm:p-8 transition-colors">
                                                <div className="flex items-center gap-5">
                                                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200/50 dark:border-indigo-500/30 transition-colors">
                                                        <FileCheck className="size-8" />
                                                    </div>
                                                    <div className="text-left min-w-0">
                                                        <p className="text-[11px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase transition-colors">Latest Evaluation</p>
                                                        {currentStudent?.assessments && currentStudent.assessments.length > 0 ? (
                                                            <h3 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate transition-colors">
                                                                {currentStudent.assessments[0].assessment_type}
                                                            </h3>
                                                        ) : (
                                                            <p className="mt-1.5 text-base font-bold text-slate-500 dark:text-slate-400 italic transition-colors">Not available yet</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {currentStudent?.assessments && currentStudent.assessments.length > 0 && (
                                                    <Button
                                                        variant="outline"
                                                        className="h-12 w-full sm:w-auto px-6 rounded-xl border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-950 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 text-base font-bold shadow-sm transition-colors"
                                                        onClick={() => window.open(route('parent.assessments.download', currentStudent.assessments[0].id), '_blank')}
                                                    >
                                                        <Download className="mr-2 size-5" /> Download
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl md:row-span-2 transition-colors flex flex-col">
                                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 p-6 sm:p-8 transition-colors shrink-0">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                                                <LineChart className="mr-3 size-6 text-indigo-500 dark:text-indigo-400" /> Recent Progress
                                            </CardTitle>
                                            {/* 🚀 Uses bulletproof ECCD variable! */}
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">
                                                {isEccdDashboard ? 'ECCD (Scaled)' : 'ITED (Milestones)'}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 sm:p-8 transition-colors flex-1 flex flex-col">
                                        <div className="space-y-7 flex-1">
                                            {currentStudent?.overview?.progress_summary?.map((domain, idx) => {
                                                const isEccd = isEccdDashboard;

                                                // 🚀 Grab the scaled score from the backend payload if it's ECCD!
                                                const displayScore = isEccd
                                                    ? (domain.scaled_score ?? domain.scaledScore ?? domain.scaled ?? domain.score)
                                                    : domain.score;

                                                const actualFullMark = isEccd ? 19 : domain.fullMark;
                                                const percentage = (Number(displayScore) / actualFullMark) * 100;
                                                const barColor = isEccd ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-emerald-500 dark:bg-emerald-400';

                                                return (
                                                    <div key={idx} className="group space-y-3 text-left">
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-base font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {domain.name}
                                                            </span>
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-mono text-lg font-black text-slate-900 dark:text-white transition-colors">
                                                                    {displayScore} <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/ {actualFullMark}</span>
                                                                </span>
                                                                {!isEccd && (
                                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 transition-colors">
                                                                        {Math.round(percentage)}% Achieved
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-950 shadow-inner transition-colors">
                                                            <div
                                                                className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out shadow-sm`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {(!currentStudent?.overview?.progress_summary || currentStudent.overview.progress_summary.length === 0) && (
                                                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950/50 transition-colors">
                                                    <Activity className="mb-4 size-10 text-slate-400 dark:text-slate-600" />
                                                    <p className="text-base font-bold text-slate-500 dark:text-slate-400">No assessment data available yet.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 rounded-xl bg-slate-50 dark:bg-zinc-950 p-5 border border-slate-100 dark:border-slate-800 text-left transition-colors shrink-0">
                                            <p className="text-sm leading-relaxed font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                                <Info className="inline mr-2 size-4 text-slate-400 dark:text-slate-500" />
                                                {/* 🚀 Uses bulletproof ECCD variable for footnote! */}
                                                {isEccdDashboard
                                                    ? "Scores shown are Scaled (1-19). 10 is considered the Average for their age."
                                                    : "Scores reflect the number of milestones achieved out of the total possible for this age group."}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* --- TAB B: ACADEMICS --- */}
                        <TabsContent value="academics" className="animate-in fade-in-50 slide-in-from-bottom-4 space-y-6 sm:space-y-8 duration-500 transition-colors">
                            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl transition-colors overflow-hidden">
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 p-6 sm:p-8 transition-colors">
                                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Assessment History</CardTitle>
                                    <CardDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">Track and review your child's developmental evaluations.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ChildAssessmentsList
                                        assessments={currentStudent?.assessments?.map(a => {
                                            const finalScore = Number(a.overall_score ?? a.overallScore ?? a.standard_score ?? a.standardScore ?? 0);
                                            const finalSum = Number(a.sum_of_scaled ?? a.sumOfScaled ?? 0);
                                            return {
                                                ...a,
                                                standardScore: finalScore,
                                                standard_score: finalScore,
                                                overall_score: finalScore,
                                                sumOfScaled: finalSum,
                                                sum_of_scaled: finalSum
                                            };
                                        }) || []}
                                        onViewDetails={handleViewAssessment}
                                        onDownload={handleDownload}
                                        onPrint={handlePrint}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl transition-colors overflow-hidden">
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 p-6 sm:p-8 transition-colors">
                                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Report Cards</CardTitle>
                                    <CardDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">Official semester and year-end documentation.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 sm:p-6 sm:bg-slate-50/30 sm:dark:bg-zinc-950/30">
                                    <ChildReportsList
                                        reports={currentStudent?.reports || []}
                                        onDownload={handleReportDownload}
                                        onPrint={handleReportPrint}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- TAB C: MESSAGES --- */}
                        <TabsContent value="messages" className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 transition-colors">
                            <Card className="flex h-[700px] min-h-[600px] flex-col overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl transition-colors">
                                <ParentChatTab
                                    conversations={conversations}
                                    currentUser={user}
                                    teachers={teachers}
                                />
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {selectedAssessment && (
                        <ParentAssessmentDialog
                            open={isDetailOpen}
                            onOpenChange={setIsDetailOpen}
                            assessment={selectedAssessment}
                        />
                    )}

                    {/* MODAL FOR ENROLLING A SECOND CHILD */}
                    <Dialog open={isEnrollModalOpen} onOpenChange={closeEnrollModal}>
                        <DialogContent hideClose className="sm:max-w-3xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col max-h-[90vh]">
                            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors text-left shrink-0">
                                <DialogHeader>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors">
                                            <UserPlus className="size-6" strokeWidth={2.5} />
                                        </div>
                                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            Enroll Another Child
                                        </DialogTitle>
                                    </div>
                                    <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors leading-relaxed">
                                        Provide the details and required verification documents for your other child.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 bg-slate-50 dark:bg-zinc-950/30">
                                <form id="main-enroll-modal-form" onSubmit={submitEnrollment}>
                                    {enrollmentFormContent}
                                </form>
                            </div>

                            <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                                <Button type="button" variant="ghost" onClick={closeEnrollModal} disabled={processing} className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                                    <X className="mr-2 size-5" /> Cancel
                                </Button>
                                <Button type="submit" form="main-enroll-modal-form" disabled={processing} className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors">
                                    {processing ? 'Processing...' : 'Submit Secure Application'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* MODAL FOR LINKING EXISTING CHILD */}
                    <Dialog open={isLinkModalOpen} onOpenChange={closeLinkModal}>
                        <DialogContent hideClose className="sm:max-w-[500px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col">
                            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors text-left shrink-0">
                                <DialogHeader>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors">
                                            <Link2 className="size-6" strokeWidth={2.5} />
                                        </div>
                                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            Link Your Child
                                        </DialogTitle>
                                    </div>
                                    <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors leading-relaxed">
                                        Enter the Secret PIN provided by the Center Administrator.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <form id="main-link-modal-form" onSubmit={handleLinkSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50 dark:bg-zinc-950/30">
                                <div className="flex flex-col">
                                    <label className={labelClass}>Secret PIN</label>
                                    <input type="text" placeholder="X7B9WQ" value={linkData.access_code} onChange={(e) => setLinkData('access_code', e.target.value.toUpperCase())} className="h-14 w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-900 px-4 text-center font-mono text-3xl font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-400 uppercase shadow-sm transition-colors placeholder:tracking-normal placeholder:text-slate-300 dark:placeholder:text-slate-800 focus:border-indigo-500 focus-visible:ring-indigo-500" maxLength={8} />
                                    {linkErrors.access_code && <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">{linkErrors.access_code}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className={labelClass}>Child's Birth Date</label>
                                    <input type="date" value={linkData.date_of_birth} onChange={(e) => setLinkData('date_of_birth', e.target.value)} className={inputClass} />
                                    {linkErrors.date_of_birth && <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">{linkErrors.date_of_birth}</p>}
                                </div>
                            </form>

                            <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                                <Button type="button" variant="ghost" onClick={closeLinkModal} disabled={linkProcessing} className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                                    <X className="mr-2 size-5" /> Cancel
                                </Button>
                                <Button type="submit" form="zero-state-link-modal-form" disabled={linkProcessing} className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors">
                                    {linkProcessing ? 'Verifying...' : 'Verify PIN'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
