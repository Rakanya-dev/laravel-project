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
    // Add this to help the UI differentiate
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
    daycare_id: number; // 👈 Add this line here
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
        // 🚀 FIX: Inject the current student so the Modal header shows the name & avatar!
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

        // 1. Subscribe to the private daycare channel
        const channel = window.Echo.private(`daycare.${currentStudent.daycare_id}`)
            .listen('.assessment.updated', (e: any) => {

                // 2. Filter: Only act if the update is for THIS specific child
                if (e.assessment.student_id === currentStudent.id) {

                    // 3. The "Silent" Update
                    // We only reload the 'students' prop. This updates:
                    // - progress_summary (Overview)
                    // - assessments (Academic History)
                    router.reload({
                        only: ['students'],
                        // @ts-ignore - If TS still complains despite correct usage
                        preserveScroll: true,
                        onSuccess: () => {
                            toast.success('New assessment data synced!', {
                                description: 'The dashboard has updated with latest scores.'
                            });
                        }
                    });
                }
            });

        // 4. Cleanup when the component unmounts
        return () => {
            window.Echo.leave(`daycare.${currentStudent.daycare_id}`);
        };
    }, [currentStudent?.id, currentStudent?.daycare_id]);
    const handleDownload = (id: number) => {
        // 🚀 FIX: Use the 'parent' route namespace
        window.open(route('parent.assessments.download', id), '_blank');
    };

    const handlePrint = (id: number) => {
        // 🚀 FIX: Use the 'parent' route namespace
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

    const modernInputClass = "w-full h-[42px] rounded-lg border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

    const enrollmentFormContent = (
        <form onSubmit={submitEnrollment} className="space-y-5">
            {/* Form Section: Details */}
            <div className="space-y-4">
                <h3 className="flex items-center text-xs font-bold tracking-wider text-slate-500 uppercase">
                    <UserSquare2 className="mr-2 h-4 w-4" /> Child Details
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">First Name <span className="text-red-500">*</span></label>
                        <input type="text" className={modernInputClass} required value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} placeholder="e.g. Juan" />
                        {errors.first_name && <p className="text-[10px] font-medium text-red-500">{errors.first_name}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                        <input type="text" className={modernInputClass} required value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} placeholder="e.g. Dela Cruz" />
                        {errors.last_name && <p className="text-[10px] font-medium text-red-500">{errors.last_name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Middle Name</label>
                        <input type="text" className={modernInputClass} value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} placeholder="Optional" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Date of Birth <span className="text-red-500">*</span></label>
                        <input type="date" className={modernInputClass} required value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Gender <span className="text-red-500">*</span></label>
                        <select className={modernInputClass} required value={data.gender} onChange={(e) => setData('gender', e.target.value)}>
                            <option value="" disabled>Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1 pt-1">
                    <label className="text-xs font-semibold text-slate-700">Select Daycare Branch <span className="text-red-500">*</span></label>
                    <select className={modernInputClass} required value={data.daycare_id} onChange={(e) => setData('daycare_id', e.target.value)}>
                        <option value="" disabled>Choose a daycare location...</option>
                        {daycares?.map((d: any) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                    </select>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* Form Section: Documents */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center text-xs font-bold tracking-wider text-slate-500 uppercase">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Secure Document Upload
                    </h3>
                    <span className="text-[10px] text-slate-400">Max size: 5MB per file.</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="group flex flex-col">
                        <label className="mb-1.5 flex items-center text-xs font-semibold text-slate-700">
                            <FileText className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> Birth Certificate <span className="ml-1 text-red-500">*</span>
                        </label>
                        <div className={`relative flex h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${data.birth_cert ? 'border-emerald-500 bg-emerald-50/50 hover:border-emerald-600' : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'}`}>
                            {data.birth_cert ? (
                                <div className="flex flex-col items-center space-y-1">
                                    <FileCheck className="h-6 w-6 text-emerald-600" />
                                    <span className="w-40 truncate px-1 text-[11px] font-bold text-emerald-800">{data.birth_cert.name}</span>
                                    <span className="text-[10px] font-medium text-emerald-600/80">{formatFileSize(data.birth_cert.size)}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-1">
                                    <UploadCloud className="h-6 w-6 text-indigo-400 transition-colors group-hover:text-indigo-600" />
                                    <span className="text-xs font-semibold text-slate-700">Upload File</span>
                                </div>
                            )}
                            <input type="file" required={!data.birth_cert} accept=".pdf,image/jpeg,image/png,image/jpg" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={(e) => setData('birth_cert', e.target.files ? e.target.files[0] : null)} />
                        </div>
                        {errors.birth_cert && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.birth_cert}</p>}
                    </div>

                    <div className="group flex flex-col">
                        <label className="mb-1.5 flex items-center text-xs font-semibold text-slate-700">
                            <UserSquare2 className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> Valid Parent ID <span className="ml-1 text-red-500">*</span>
                        </label>
                        <div className={`relative flex h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${data.parent_id_doc ? 'border-emerald-500 bg-emerald-50/50 hover:border-emerald-600' : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'}`}>
                            {data.parent_id_doc ? (
                                <div className="flex flex-col items-center space-y-1">
                                    <FileCheck className="h-6 w-6 text-emerald-600" />
                                    <span className="w-40 truncate px-1 text-[11px] font-bold text-emerald-800">{data.parent_id_doc.name}</span>
                                    <span className="text-[10px] font-medium text-emerald-600/80">{formatFileSize(data.parent_id_doc.size)}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-1">
                                    <UploadCloud className="h-6 w-6 text-indigo-400 transition-colors group-hover:text-indigo-600" />
                                    <span className="text-xs font-semibold text-slate-700">Upload File</span>
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
                        <span className="text-indigo-700">Encrypting & Uploading...</span>
                        <span className="text-slate-600">{progress.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
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
                        <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 rounded-full bg-emerald-100 p-3">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-emerald-900">Application Under Review</h2>
                                <p className="mt-3 max-w-lg text-sm text-emerald-700">
                                    We have securely received your application for <strong>{pendingEnrollment.first_name}</strong>. The daycare admin
                                    is currently verifying your documents. You will have full dashboard access once approved.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="overflow-hidden border-slate-200/60 shadow-lg shadow-slate-200/40 sm:rounded-xl">
                            <CardHeader className="flex flex-col border-b border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-800">Enroll Your Child</CardTitle>
                                    <p className="mt-1 text-xs text-slate-500">Provide details and verification documents below.</p>
                                </div>
                                <Button onClick={() => setIsLinkModalOpen(true)} variant="outline" size="sm" className="mt-3 gap-2 border-indigo-200 text-indigo-700 shadow-sm hover:bg-indigo-50 sm:mt-0">
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

            <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="space-y-6">

                    {/* BANNER IF A SECOND CHILD IS PENDING */}
                    {pendingEnrollment && (
                        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800 shadow-sm">
                            <Info className="h-4 w-4 shrink-0 text-blue-500" />
                            <p className="text-sm">
                                Your application for <strong>{pendingEnrollment.first_name} {pendingEnrollment.last_name}</strong> is under review by the Admin.
                            </p>
                        </div>
                    )}

                    {/* HEADER CARD */}
                    <div className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xl font-bold text-indigo-600 ring-4 ring-indigo-50/50">
                                {currentStudent.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900">{currentStudent.name}</h1>
                                <p className="text-xs font-medium text-slate-500">{currentStudent.daycare}</p>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-end">
                            {students.length > 1 && (
                                <div className="w-full md:w-auto">
                                    <label className="mb-1 block text-[10px] font-semibold text-slate-500 uppercase">Switch Child</label>
                                    <select className="h-9 w-full rounded-lg border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium focus:border-indigo-500 focus:ring-indigo-500 md:w-40" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                                        {students.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                                    </select>
                                </div>
                            )}

                            {!pendingEnrollment && (
                                <>
                                    <Button onClick={() => setIsLinkModalOpen(true)} variant="outline" size="sm" className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 md:w-auto">
                                        <Link2 className="mr-2 h-3.5 w-3.5" /> Link PIN
                                    </Button>
                                    <Button onClick={() => setIsEnrollModalOpen(true)} variant="outline" size="sm" className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 md:w-auto">
                                        <Plus className="mr-2 h-3.5 w-3.5" /> Enroll Another
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 🚀 UPGRADED MAIN TABS: Admin/SaaS "Underline" Style */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                        <div className="border-b border-slate-200">
                            <TabsList className="flex h-12 w-full justify-start overflow-x-auto bg-transparent p-0 no-scrollbar">
                                <TabsTrigger
                                    value="overview"
                                    className="relative flex h-12 items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-semibold tracking-wide text-slate-500 hover:text-slate-800 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none"
                                >
                                    <Activity className="h-4 w-4" /> <span>Overview</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="academics"
                                    className="relative flex h-12 items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-semibold tracking-wide text-slate-500 hover:text-slate-800 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none"
                                >
                                    <FileText className="h-4 w-4" /> <span>Academics</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="messages"
                                    className="relative flex h-12 items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-semibold tracking-wide text-slate-500 hover:text-slate-800 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none"
                                >
                                    <MessageCircle className="h-4 w-4" /> <span>Messages</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* --- TAB A: OVERVIEW --- */}
                        <TabsContent value="overview" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
                                <div className="space-y-4 lg:space-y-6">
                                    <Card className="overflow-hidden border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                                        <CardContent className="p-0">
                                            <div className="flex items-center gap-4 bg-orange-50/50 p-5 sm:p-6">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                                    <CalendarDays className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold tracking-wider text-orange-600 uppercase">Next Assessment</p>
                                                    <h3 className="mt-1 text-2xl font-bold text-slate-900">{currentStudent.overview.next_due}</h3>
                                                    <p className="text-xs text-slate-500">Estimated Schedule</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="overflow-hidden border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                                        <CardContent className="p-0">
                                            <div className="flex items-center gap-4 bg-indigo-50/30 p-5 sm:p-6">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                                    <FileCheck className="h-6 w-6" />
                                                </div>
                                                <div className="w-full">
                                                    <p className="text-xs font-bold tracking-wider text-indigo-600 uppercase">Latest Evaluation</p>
                                                    {/* 🚀 FIX: Check if they have ANY assessments, and grab the first one (which is the newest) */}
                                                    {currentStudent.assessments && currentStudent.assessments.length > 0 ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-2 w-full border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                                            // Point the download to the parent.assessments.download route using the newest assessment ID
                                                            onClick={() => window.open(route('parent.assessments.download', currentStudent.assessments[0].id), '_blank')}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" /> Download PDF
                                                        </Button>
                                                    ) : (
                                                        <p className="mt-1 text-sm text-slate-400 italic">No evaluations available yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="border-slate-200/60 shadow-sm md:row-span-2">
                                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center text-base font-bold text-slate-800">
                                                <LineChart className="mr-2 h-5 w-5 text-indigo-500" /> Recent Progress
                                            </CardTitle>
                                            {/* 💡 Adaptive Legend */}
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                {currentStudent.overview.progress_summary[0]?.fullMark === 19 ? 'ECCD (Scaled)' : 'ITED (Milestones)'}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5 sm:p-6">
                                        <div className="space-y-6">
                                            {currentStudent.overview.progress_summary.map((domain, idx) => {
                                                const isEccd = domain.fullMark === 19;
                                                const percentage = (domain.score / domain.fullMark) * 100;

                                                // 🎨 Adaptive Colors: Blue for standard ECCD, Emerald/Green for Milestone growth
                                                const barColor = isEccd ? 'bg-indigo-500' : 'bg-emerald-500';

                                                return (
                                                    <div key={idx} className="group space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                                {domain.name}
                                                            </span>
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-mono text-xs font-black text-slate-900">
                                                                    {domain.score} <span className="text-slate-400 font-normal">/ {domain.fullMark}</span>
                                                                </span>
                                                                {/* 💡 Show percentage for ITED (Milestones) to make it easier to read */}
                                                                {!isEccd && (
                                                                    <span className="text-[9px] font-bold text-emerald-600">
                                                                        {Math.round(percentage)}% Achieved
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                                                            <div
                                                                className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {currentStudent.overview.progress_summary.length === 0 && (
                                                <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                                                    <Activity className="mb-2 h-8 w-8 text-slate-300" />
                                                    <p className="text-sm font-medium text-slate-500">No assessment data available yet.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* 💡 Tooltip/Info Section */}
                                        <div className="mt-6 rounded-lg bg-slate-50 p-3 border border-slate-100">
                                            <p className="text-[10px] leading-relaxed text-slate-500">
                                                <Info className="inline mr-1 h-3 w-3 text-slate-400" />
                                                {currentStudent.overview.progress_summary[0]?.fullMark === 19
                                                    ? "Scores shown are Scaled (1-19). 10 is Average."
                                                    : "Scores reflect the number of milestones achieved out of the total possible for this age group."}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* --- TAB B: ACADEMICS --- */}
                        <TabsContent value="academics" className="animate-in fade-in-50 slide-in-from-bottom-2 space-y-6 duration-500">
                            <Card className="border-slate-200/60 shadow-sm">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800">Assessment History</CardTitle>
                                    <CardDescription>Track and review your child's developmental evaluations.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 sm:p-6">
                                    <ChildAssessmentsList
                                        // 🚀 FIX: Map the assessments to ensure standardScore uses the overall_score if it came back as 0
                                        assessments={currentStudent.assessments.map(a => ({
                                            ...a,
                                            standardScore: a.standardScore > 0 ? a.standardScore : (a.overall_score || 0)
                                        }))}
                                        onViewDetails={handleViewAssessment}
                                        onDownload={handleDownload}
                                        onPrint={handlePrint}
                                    />                                </CardContent>
                            </Card>

                            <Card className="border-slate-200/60 shadow-sm">
                                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-800">Report Cards</CardTitle>
                                    <CardDescription>Official semester and year-end documentation.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 sm:p-6">
                                    <ChildReportsList
                                        reports={currentStudent.reports}
                                        onDownload={handleReportDownload}
                                        onPrint={handleReportPrint}
                                    />                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- TAB C: MESSAGES --- */}
                        <TabsContent value="messages" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                            <Card className="flex h-[600px] min-h-[500px] flex-col overflow-hidden border-slate-200/60 shadow-sm md:h-[calc(100vh-18rem)]">
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
                        <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-3xl">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-slate-800">Enroll Another Child</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    Provide the details and required verification documents for your other child.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-2 px-1 pb-2">{enrollmentFormContent}</div>
                        </DialogContent>
                    </Dialog>

                    {/* MODAL FOR LINKING EXISTING CHILD */}
                    <Dialog open={isLinkModalOpen} onOpenChange={closeAndReset}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-slate-900">Link Your Child</DialogTitle>
                                <DialogDescription className="text-xs text-slate-500">
                                    Did you receive a Secret PIN from the Admin? Enter it below.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleLinkSubmit} className="space-y-4 py-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Secret PIN</label>
                                    <input type="text" placeholder="e.g. X7B9WQ" value={linkData.access_code} onChange={(e) => setLinkData('access_code', e.target.value.toUpperCase())} className="h-12 w-full rounded-lg border-slate-300 bg-slate-50/50 px-4 text-center font-mono text-xl tracking-[0.25em] text-slate-700 uppercase shadow-sm transition-all placeholder:tracking-normal placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" maxLength={8} />
                                    {linkErrors.access_code && <p className="text-center text-[10px] font-medium text-red-500">{linkErrors.access_code}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Child's Date of Birth</label>
                                    <input type="date" value={linkData.date_of_birth} onChange={(e) => setLinkData('date_of_birth', e.target.value)} className={modernInputClass} />
                                    {linkErrors.date_of_birth && <p className="text-[10px] font-medium text-red-500">{linkErrors.date_of_birth}</p>}
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="ghost" onClick={closeAndReset} disabled={linkProcessing} className="h-10 px-4 text-sm">Cancel</Button>
                                    <Button type="submit" className="h-10 bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700" disabled={linkProcessing}>{linkProcessing ? 'Verifying...' : 'Verify & Continue'}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
