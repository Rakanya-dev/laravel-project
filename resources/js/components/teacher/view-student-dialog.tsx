import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { Student } from '@/pages/teacher/my-students';
import {
    Ban,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardPen,
    FileText,
    Mail,
    StickyNote,
    UserCircle2,
    Users,
    Baby,
    Activity,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 🚀 IMPORT NEW DATE TOOLKITS
import { formatPHDate, calculateAge } from '@/utils/date';

interface ViewStudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: Student | null;
    daycareName: string;
    onStartAssessment: () => void;
    isArchived?: boolean;
}

const getFullName = (student: Student | null) => {
    if (!student) return '';
    return `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`.trim();
};

// 🚀 PREMIUM STATUS BADGES (Matches Admin Theme & Dark Mode)
const getStatusBadge = (status: string) => {
    const baseClasses = "px-2.5 py-0.5 text-[11px] uppercase tracking-widest font-bold shadow-none shrink-0 transition-colors w-fit border";

    switch (status) {
        case 'Active':
        case 'In Progress':
        case 'Draft':
            return <Badge variant="outline" className={cn(baseClasses, "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50")}>{status}</Badge>;
        case 'Completed':
        case 'Graduated':
            return <Badge variant="outline" className={cn(baseClasses, "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-900/50")}>{status}</Badge>;
        case 'Transferred':
            return <Badge variant="outline" className={cn(baseClasses, "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900/50")}>Transferred</Badge>;
        case 'Inactive':
            return <Badge variant="outline" className={cn(baseClasses, "bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-slate-700")}>Inactive</Badge>;
        default:
            return <Badge variant="outline" className={cn(baseClasses, "bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-slate-700")}>{status}</Badge>;
    }
};

export function ViewStudentDialog({ open, onOpenChange, student, daycareName, onStartAssessment, isArchived = false }: ViewStudentDialogProps) {
    if (!student) return null;

    const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
    const isActuallyArchived = isArchived || ['Graduated', 'Transferred', 'Inactive'].includes(student.status);
    const dateOfBirth = student.date_of_birth || student.dateOfBirth;

    // 🚀 SMART NOTES LOGIC
    const archiveReasonText = student.archiveReason || student.archive_reason;
    const isDuplicateNote = isActuallyArchived && student.notes && student.notes === archiveReasonText;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideClose className="sm:max-w-[750px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col max-h-[90vh]">

                {/* --- PREMIUM HEADER --- */}
                <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors z-10 shrink-0">
                    <DialogHeader className="text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 w-full">
                            <div className="flex items-center gap-4">
                                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 text-xl font-black shadow-sm transition-colors">
                                    {initials}
                                </div>
                                <div className="text-left">
                                    <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                                        {getFullName(student)}
                                    </DialogTitle>
                                    <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                                        Official Learner Profile
                                    </DialogDescription>
                                </div>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 pl-16 sm:pl-0">
                                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Current Status</p>
                                {isActuallyArchived ? (
                                    <Badge variant="outline" className="px-2.5 py-0.5 text-[11px] uppercase tracking-widest font-bold shadow-none shrink-0 transition-colors w-fit border border-red-200 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/50">Archived</Badge>
                                ) : (
                                    getStatusBadge(student.status)
                                )}
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* --- SCROLLABLE BODY --- */}
                <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6 sm:space-y-8 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

                    {/* SECTION 1: Learner Identity */}
                    <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                        <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <Baby className="size-5 text-indigo-500 dark:text-indigo-400" /> Learner Identity
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                            <div className="sm:col-span-2">
                                <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Date of Birth & Age</Label>
                                <div className="mt-2.5 flex items-center gap-3 text-base font-bold text-slate-900 dark:text-white transition-colors">
                                    <span className="flex items-center gap-2">
                                        <CalendarDays className="size-5 text-indigo-500 dark:text-indigo-400" />
                                        {formatPHDate(dateOfBirth)}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-2.5 py-1 rounded-md text-[13px] transition-colors">
                                        <Activity className="size-4" />
                                        {student.age || calculateAge(dateOfBirth)} years old
                                    </span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Gender</Label>
                                <p className="mt-2.5 text-base font-bold text-slate-900 dark:text-white transition-colors">{student.gender || 'Not specified'}</p>
                            </div>
                            <div>
                                <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Known As</Label>
                                <p className="mt-2.5 text-base font-bold text-slate-900 dark:text-white transition-colors">{student.nickname ? `"${student.nickname}"` : 'N/A'}</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: Center Placement & Guardian */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section className="bg-indigo-50/30 dark:bg-indigo-500/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm space-y-6 relative overflow-hidden transition-colors">
                            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-indigo-100 dark:bg-indigo-500/20 blur-3xl transition-colors"></div>
                            <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-indigo-900 dark:text-indigo-300 uppercase border-b border-indigo-200/50 dark:border-indigo-500/20 pb-4 relative z-10 transition-colors">
                                <Building2 className="size-5 text-indigo-500 dark:text-indigo-400" /> Placement
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <Label className="text-[11px] font-bold text-indigo-800/80 dark:text-indigo-400/80 uppercase tracking-widest transition-colors">Daycare Center</Label>
                                    <p className="mt-2.5 text-lg font-extrabold text-indigo-950 dark:text-indigo-100 transition-colors">{daycareName}</p>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-bold text-indigo-800/80 dark:text-indigo-400/80 uppercase tracking-widest transition-colors">Assigned Session</Label>
                                    <p className="mt-2.5 text-base font-bold text-indigo-800 dark:text-indigo-300 transition-colors">
                                        {student.section_name || 'Unassigned'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                            <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                                <Users className="size-5 text-indigo-500 dark:text-indigo-400" /> Guardian & Progress
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Primary Guardian</Label>
                                    <p className="mt-2.5 text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5 transition-colors">
                                        <UserCircle2 className="size-5 text-slate-400 dark:text-slate-500" />
                                        {student.parentName || 'Not Linked'}
                                    </p>
                                    {student.parentEmail && (
                                        <div className="mt-1.5 flex items-center gap-2 text-[13px] font-medium text-slate-500 dark:text-slate-400 ml-7 transition-colors">
                                            <Mail className="size-4" /> {student.parentEmail}
                                        </div>
                                    )}
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                    <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Latest Assessment</Label>
                                    <p className="mt-2.5 text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 transition-colors">
                                        <FileText className="size-5" />
                                        {student.lastAssessment || 'No assessments yet'}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* SECTION 3: Smart Notes */}
                    <section className="space-y-6">
                        {/* Only show General Notes if they aren't an exact copy of the Archive Reason */}
                        {!isDuplicateNote && (
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                                <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                                    <FileText className="size-5 text-indigo-500 dark:text-indigo-400" /> General Notes & Remarks
                                </h3>
                                <div className="mt-4 text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-5 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[100px] transition-colors">
                                    {student.notes ? (
                                        student.notes
                                    ) : (
                                        <span className="text-slate-400 dark:text-slate-500 italic">No additional notes recorded for this learner.</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Archived Notes (Only visible if archived and has a reason) */}
                        {isActuallyArchived && archiveReasonText && (
                            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 p-6 shadow-sm transition-colors">
                                <div className="flex items-start gap-4 sm:gap-5">
                                    <div className="rounded-xl bg-amber-100 dark:bg-amber-500/20 p-3 text-amber-600 dark:text-amber-400 transition-colors mt-1">
                                        <StickyNote className="size-6" />
                                    </div>
                                    <div>
                                        <p className="mb-1.5 text-[11px] font-bold tracking-widest text-amber-800 dark:text-amber-500 uppercase transition-colors">Archive Reason</p>
                                        <p className="text-base font-medium leading-relaxed text-amber-900 dark:text-amber-300 italic transition-colors">"{archiveReasonText}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fallback if both are completely empty on an archived student */}
                        {isActuallyArchived && !archiveReasonText && !student.notes && (
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center transition-colors">
                                <span className="text-slate-400 dark:text-slate-500 italic text-base font-medium">No archive reasons or notes recorded.</span>
                            </div>
                        )}
                    </section>
                </div>

                {/* --- PREMIUM FOOTER ACTIONS --- */}
                <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex-col sm:flex-row justify-between items-center gap-3 transition-colors m-0 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="mr-2 size-5" /> Close Profile
                    </Button>

                    {isActuallyArchived ? (
                        <Button disabled className="cursor-not-allowed border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 shadow-none h-12 w-full sm:w-auto px-6 rounded-xl font-bold transition-colors text-base">
                            <Ban className="mr-2 size-5" /> Account Archived
                        </Button>
                    ) : student.status === 'Completed' ? (
                        <Button disabled className="cursor-not-allowed border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-none h-12 w-full sm:w-auto px-6 rounded-xl font-bold transition-colors text-base">
                            <CheckCircle2 className="mr-2 size-5" /> Curriculum Completed
                        </Button>
                    ) : ['Draft', 'In Progress'].includes(student.status) ? (
                        <Button disabled className="cursor-not-allowed border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-none h-12 w-full sm:w-auto px-6 rounded-xl font-bold transition-colors text-base">
                            <ClipboardPen className="mr-2 size-5" /> Active Draft Exists
                        </Button>
                    ) : (
                        <Button
                            className="bg-indigo-600 dark:bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 h-12 w-full sm:w-auto px-8 rounded-xl font-bold transition-colors text-base"
                            onClick={onStartAssessment}
                        >
                            <FileText className="mr-2 size-5" /> Start Evaluation
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
