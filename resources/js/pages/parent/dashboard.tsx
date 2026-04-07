import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Activity, CheckCircle2, Download, FileCheck, FileText, Info, Link2, MessageCircle, Plus, UploadCloud, UserSquare2, ShieldCheck, CalendarDays, LineChart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Import Partials
import { ChildAssessmentsList } from '@/components/parent/child-assessments-list';
import { ChildReportsList } from '@/components/parent/child-reports-list';
import { ParentChatTab } from '@/components/parent/parent-chat-tab';
import { ParentAssessmentDialog } from '@/components/parent/parent-assessment-dialog';


// --- TYPES ---
interface ProgressDomain {
    name: string;
    score: number;
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
}

export default function ParentDashboard({ students, conversations, user, daycares, pendingEnrollment, activeMessages }: ParentDashboardProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>(students.length > 0 ? students[0].id.toString() : '');

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

    const currentStudent = students.find((s) => s.id.toString() === selectedStudentId);

    const { data, setData, post, processing, progress, errors, reset } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        daycare_id: '',
        birth_cert: null as File | null,
        parent_id_doc: null as File | null,
    });

    const submitEnrollment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.birth_cert || !data.parent_id_doc) {
            toast.error('Please upload both required documents.');
            return;
        }
        post(route('parent.enroll.store'), {
            onSuccess: () => {
                setIsEnrollModalOpen(false);
                reset();
                toast.success('Secure application submitted successfully!');
            },
            preserveScroll: true,
        });
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
        const channel = window.Echo.private(`daycare.${currentStudent.daycare_id}`)
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
            window.Echo.leave(`daycare.${currentStudent.daycare_id}`);
        };
    }, [currentStudent?.id, currentStudent?.daycare_id]);

    const handleDownload = (id: number) => {
        window.open(route('parent.assessments.download', id), '_blank');
    };

    const handlePrint = (id: number) => {
        window.open(route('parent.assessments.print', id), '_blank');
    };

    const handleReportDownload = (id: number) => {
        window.open(route('parent.reports.download', id), '_blank');
    };

    const handleReportPrint = (id: number) => {
        window.open(route('parent.reports.print', id), '_blank');
    };


    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

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

    const handleLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postLink(route('parent.verify-pin'), {
            onSuccess: () => {
                setIsLinkModalOpen(false);
                resetLink();
            },
        });
    };

    const closeAndReset = () => {
        setIsLinkModalOpen(false);
        resetLink();
        clearLinkErrors();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const modernInputClass = "w-full h-[42px] rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950 px-3 text-sm text-slate-900 dark:text-white shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/10";

    const enrollmentFormContent = (
        <form onSubmit={submitEnrollment} className="space-y-5">
            <div className="space-y-4">
                <h3 className="flex items-center text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    <UserSquare2 className="mr-2 h-4 w-4" /> Child Details
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">First Name <span className="text-red-500">*</span></label>
                        <input type="text" className={modernInputClass} required value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} placeholder="e.g. Juan" />
                        {errors.first_name && <p className="text-[10px] font-medium text-red-500">{errors.first_name}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500">*</span></label>
                        <input type="text" className={modernInputClass} required value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} placeholder="e.g. Dela Cruz" />
                        {errors.last_name && <p className="text-[10px] font-medium text-red-500">{errors.last_name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Middle Name</label>
                        <input type="text" className={modernInputClass} value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} placeholder="Optional" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date of Birth <span className="text-red-500">*</span></label>
                        <input type="date" className={modernInputClass} required value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gender <span className="text-red-500">*</span></label>
                        <select className={modernInputClass} required value={data.gender} onChange={(e) => setData('gender', e.target.value)}>
                            <option value="" disabled className="dark:bg-zinc-900">Select gender</option>
                            <option value="Male" className="dark:bg-zinc-900">Male</option>
                            <option value="Female" className="dark:bg-zinc-900">Female</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1 pt-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Daycare Branch <span className="text-red-500">*</span></label>
                    <select className={modernInputClass} required value={data.daycare_id} onChange={(e) => setData('daycare_id', e.target.value)}>
                        <option value="" disabled className="dark:bg-zinc-900">Choose a daycare location...</option>
                        {daycares?.map((d: any) => (<option key={d.id} value={d.id} className="dark:bg-zinc-900">{d.name}</option>))}
                    </select>
                </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Secure Document Upload
                    </h3>
                    <span className="text-[10px] text-slate-400">Max size: 5MB per file.</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="group flex flex-col">
                        <label className="mb-1.5 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <FileText className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> Birth Certificate <span className="ml-1 text-red-500">*</span>
                        </label>
                        <div className={`relative flex h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${data.birth_cert ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 hover:border-emerald-600' : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 hover:border-indigo-400 dark:hover:border-indigo-700 hover:bg-indigo-50/50'}`}>
                            {data.birth_cert ? (
                                <div className="flex flex-col items-center space-y-1">
                                    <FileCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                                    <span className="w-40 truncate px-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">{data.birth_cert.name}</span>
                                    <span className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400">{formatFileSize(data.birth_cert.size)}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-1">
                                    <UploadCloud className="h-6 w-6 text-indigo-400 transition-colors group-hover:text-indigo-600" />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload File</span>
                                </div>
                            )}
                            <input type="file" required={!data.birth_cert} accept=".pdf,image/jpeg,image/png,image/jpg" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={(e) => setData('birth_cert', e.target.files ? e.target.files[0] : null)} />
                        </div>
                        {errors.birth_cert && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.birth_cert}</p>}
                    </div>

                    <div className="group flex flex-col">
                        <label className="mb-1.5 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <UserSquare2 className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> Valid Parent ID <span className="ml-1 text-red-500">*</span>
                        </label>
                        <div className={`relative flex h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${data.parent_id_doc ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 hover:border-emerald-600' : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 hover:border-indigo-400 dark:hover:border-indigo-700 hover:bg-indigo-50/50'}`}>
                            {data.parent_id_doc ? (
                                <div className="flex flex-col items-center space-y-1">
                                    <FileCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                                    <span className="w-40 truncate px-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">{data.parent_id_doc.name}</span>
                                    <span className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400">{formatFileSize(data.parent_id_doc.size)}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-1">
                                    <UploadCloud className="h-6 w-6 text-indigo-400 transition-colors group-hover:text-indigo-600" />
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload File</span>
                                </div>
                            )}
                            <input type="file" required={!data.parent_id_doc} accept=".pdf,image/jpeg,image/png,image/jpg" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={(e) => setData('parent_id_doc', e.target.files ? e.target.files[0] : null)} />
                        </div>
                        {errors.parent_id_doc && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.parent_id_doc}</p>}
                    </div>
                </div>
            </div>

            {progress && (
                <div className="pt-1">
                    <div className="mb-1.5 flex justify-between text-xs font-medium">
                        <span className="text-indigo-700 dark:text-indigo-400">Encrypting & Uploading...</span>
                        <span className="text-slate-600 dark:text-slate-400">{progress.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out" style={{ width: `${progress.percentage}%` }} />
                    </div>
                </div>
            )}

            <div className="pt-1">
                <Button type="submit" disabled={processing} className="h-11 w-full bg-indigo-600 text-sm font-bold shadow-md shadow-indigo-600/10 hover:bg-indigo-700">
                    {processing ? 'Processing Request...' : 'Submit Secure Application'}
                </Button>
            </div>
        </form>
    );

    if (!currentStudent) {
        return (
            <AppLayout>
                <Head title="Enrollment" />
                <div className="container mx-auto max-w-3xl px-4 py-6">
                    {pendingEnrollment ? (
                        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-500/5 shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 p-3">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-emerald-900 dark:text-white">Application Under Review</h2>
                                <p className="mt-3 max-w-lg text-sm text-emerald-700 dark:text-emerald-400/80">
                                    We have securely received your application for <strong>{pendingEnrollment.first_name}</strong>. The daycare admin
                                    is currently verifying your documents. You will have full dashboard access once approved.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-zinc-900 sm:rounded-xl">
                            <CardHeader className="flex flex-col border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Enroll Your Child</CardTitle>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Provide details and verification documents below.</p>
                                </div>
                                <Button onClick={() => setIsLinkModalOpen(true)} variant="outline" size="sm" className="mt-3 gap-2 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 shadow-sm hover:bg-indigo-50 dark:hover:bg-zinc-800 sm:mt-0 transition-colors">
                                    <Link2 className="size-3.5" /> Have a PIN?
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">{enrollmentFormContent}</CardContent>
                        </Card>
                    )}
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 transition-colors duration-200">
                <div className="space-y-6">

                    {/* BANNER IF A SECOND CHILD IS PENDING */}
                    {pendingEnrollment && (
                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-500/10 p-3 text-blue-800 dark:text-blue-300 shadow-sm transition-colors">
                            <Info className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
                            <p className="text-sm font-medium">
                                Your application for <strong>{pendingEnrollment.first_name} {pendingEnrollment.last_name}</strong> is under review by the Admin.
                            </p>
                        </div>
                    )}

                    {/* HEADER CARD */}
                    <div className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-zinc-900 p-5 shadow-sm md:flex-row md:items-center transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-xl font-bold text-indigo-600 dark:text-indigo-400 ring-4 ring-indigo-50/50 dark:ring-indigo-500/10 transition-all">
                                {currentStudent.name.charAt(0)}
                            </div>
                            <div className="text-left">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{currentStudent.name}</h1>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{currentStudent.daycare}</p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-end">
                            {students.length > 1 && (
                                <div className="w-full md:w-auto text-left">
                                    <label className="mb-1 block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Switch Child</label>
                                    <select className="h-9 w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-indigo-500 md:w-40 transition-colors" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                                        {students.map((s) => (<option key={s.id} value={s.id} className="dark:bg-zinc-900">{s.name}</option>))}
                                    </select>
                                </div>
                            )}

                            {!pendingEnrollment && (
                                <>
                                    <Button onClick={() => setIsLinkModalOpen(true)} variant="outline" size="sm" className="w-full border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 md:w-auto font-bold transition-colors">
                                        <Link2 className="mr-2 h-3.5 w-3.5" /> Link PIN
                                    </Button>
                                    <Button onClick={() => setIsEnrollModalOpen(true)} variant="outline" size="sm" className="w-full border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 md:w-auto font-bold transition-colors">
                                        <Plus className="mr-2 h-3.5 w-3.5" /> Enroll Another
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                        <div className="border-b border-slate-200 dark:border-slate-800">
                            <TabsList className="flex h-12 w-full justify-start overflow-x-auto bg-transparent p-0 no-scrollbar">
                                <TabsTrigger
                                    value="overview"
                                    className="relative flex h-12 items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
                                >
                                    <Activity className="h-4 w-4" /> <span>Overview</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="academics"
                                    className="relative flex h-12 items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
                                >
                                    <FileText className="h-4 w-4" /> <span>Academics</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="messages"
                                    className="relative flex h-12 items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-white data-[state=active]:shadow-none transition-all"
                                >
                                    <MessageCircle className="h-4 w-4" /> <span>Messages</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* --- TAB A: OVERVIEW --- */}
                        <TabsContent value="overview" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 transition-colors">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                                <div className="space-y-4 lg:space-y-6">
                                    <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md">
                                        <CardContent className="p-0">
                                            <div className="flex items-center gap-4 bg-orange-50/50 dark:bg-orange-500/10 p-5 sm:p-6 transition-colors">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                                                    <CalendarDays className="h-6 w-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold tracking-wider text-orange-600 dark:text-orange-400 uppercase">Next Assessment</p>
                                                    <h3 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{currentStudent.overview.next_due}</h3>
                                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated Schedule</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md">
                                        <CardContent className="p-0">
                                            <div className="flex items-center gap-4 bg-indigo-50/30 dark:bg-indigo-500/10 p-5 sm:p-6 transition-colors">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                                    <FileCheck className="h-6 w-6" />
                                                </div>
                                                <div className="w-full text-left">
                                                    <p className="text-xs font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">Latest Evaluation</p>
                                                    {currentStudent.assessments && currentStudent.assessments.length > 0 ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2 w-full border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 hover:text-indigo-700 font-bold transition-colors"
                                                            onClick={() => window.open(route('parent.assessments.download', currentStudent.assessments[0].id), '_blank')}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" /> Download PDF
                                                        </Button>
                                                    ) : (
                                                        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 italic">No evaluations available yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="border-slate-200/60 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm md:row-span-2 transition-colors">
                                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 pb-4 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center text-base font-bold text-slate-800 dark:text-white">
                                                <LineChart className="mr-2 h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Recent Progress
                                            </CardTitle>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                {currentStudent.overview.progress_summary[0]?.fullMark === 19 ? 'ECCD (Scaled)' : 'ITED (Milestones)'}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5 sm:p-6 transition-colors">
                                        <div className="space-y-6">
                                            {currentStudent.overview.progress_summary.map((domain, idx) => {
                                                const isEccd = domain.fullMark === 19;
                                                const percentage = (domain.score / domain.fullMark) * 100;
                                                const barColor = isEccd ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-emerald-500 dark:bg-emerald-400';

                                                return (
                                                    <div key={idx} className="group space-y-2 text-left">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {domain.name}
                                                            </span>
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                                                                    {domain.score} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {domain.fullMark}</span>
                                                                </span>
                                                                {!isEccd && (
                                                                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 transition-colors">
                                                                        {Math.round(percentage)}% Achieved
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-950 shadow-inner transition-colors">
                                                            <div
                                                                className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out shadow-sm`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {currentStudent.overview.progress_summary.length === 0 && (
                                                <div className="flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 transition-colors">
                                                    <Activity className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-700" />
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-500">No assessment data available yet.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 rounded-xl bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-100 dark:border-slate-800 text-left transition-colors">
                                            <p className="text-[10px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                                                <Info className="inline mr-1.5 h-3 w-3 text-slate-400 dark:text-slate-600" />
                                                {currentStudent.overview.progress_summary[0]?.fullMark === 19
                                                    ? "Scores shown are Scaled (1-19). 10 is considered the Average for their age."
                                                    : "Scores reflect the number of milestones achieved out of the total possible for this age group."}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* --- TAB B: ACADEMICS --- */}
                        <TabsContent value="academics" className="animate-in fade-in-50 slide-in-from-bottom-2 space-y-6 duration-500 transition-colors">
                            <Card className="border-slate-200/60 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 pb-4 transition-colors">
                                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Assessment History</CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-slate-400">Track and review your child's developmental evaluations.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 sm:p-6">
                                    <ChildAssessmentsList
                                        assessments={currentStudent.assessments.map(a => ({
                                            ...a,
                                            standardScore: a.standardScore > 0 ? a.standardScore : (a.overall_score || 0)
                                        }))}
                                        onViewDetails={handleViewAssessment}
                                        onDownload={handleDownload}
                                        onPrint={handlePrint}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200/60 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 pb-4 transition-colors">
                                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Report Cards</CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-slate-400">Official semester and year-end documentation.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 sm:p-6">
                                    <ChildReportsList
                                        reports={currentStudent.reports}
                                        onDownload={handleReportDownload}
                                        onPrint={handleReportPrint}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- TAB C: MESSAGES --- */}
                        <TabsContent value="messages" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 transition-colors">
                            <Card className="flex h-[600px] min-h-[500px] flex-col overflow-hidden border-slate-200/60 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm md:h-[calc(100vh-18rem)] transition-colors">
                                <ParentChatTab
                                    conversations={conversations}
                                    currentUser={user}
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
                    <Dialog open={isEnrollModalOpen} onOpenChange={setIsEnrollModalOpen}>
                        <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-3xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-slate-800 dark:text-white">Enroll Another Child</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Provide the details and required verification documents for your other child.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-2 px-1 pb-2">{enrollmentFormContent}</div>
                        </DialogContent>
                    </Dialog>

                    {/* MODAL FOR LINKING EXISTING CHILD */}
                    <Dialog open={isLinkModalOpen} onOpenChange={closeAndReset}>
                        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Link Your Child</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                    Enter the Secret PIN provided by the Center Administrator.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleLinkSubmit} className="space-y-5 py-2">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Secret PIN</label>
                                    <input type="text" placeholder="X7B9WQ" value={linkData.access_code} onChange={(e) => setLinkData('access_code', e.target.value.toUpperCase())} className="h-14 w-full rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-zinc-950 px-4 text-center font-mono text-2xl font-black tracking-[0.3em] text-indigo-600 dark:text-indigo-400 uppercase shadow-sm transition-all placeholder:tracking-normal placeholder:text-slate-300 dark:placeholder:text-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/10" maxLength={8} />
                                    {linkErrors.access_code && <p className="text-center text-[10px] font-bold text-red-500 dark:text-red-400 mt-1">{linkErrors.access_code}</p>}
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Child's Birth Date</label>
                                    <input type="date" value={linkData.date_of_birth} onChange={(e) => setLinkData('date_of_birth', e.target.value)} className={modernInputClass} />
                                    {linkErrors.date_of_birth && <p className="text-[10px] font-bold text-red-500 dark:text-red-400 mt-1">{linkErrors.date_of_birth}</p>}
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="ghost" onClick={closeAndReset} disabled={linkProcessing} className="h-11 px-6 rounded-xl font-bold dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800">Cancel</Button>
                                    <Button type="submit" className="h-11 bg-indigo-600 dark:bg-indigo-600 px-6 rounded-xl font-bold text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-md shadow-indigo-600/10" disabled={linkProcessing}>{linkProcessing ? 'Verifying...' : 'Verify PIN'}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
