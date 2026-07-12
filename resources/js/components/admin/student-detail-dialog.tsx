import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import type { Student } from '@/pages/admin/student-management';
import { Edit2, Baby, Building2, UserCircle2, Users, CalendarDays, ClipboardCheck, X, Activity, FileText, StickyNote } from 'lucide-react';

// 🚀 IMPORT NEW DATE TOOLKITS
import { formatPHDate, calculateAge } from '@/utils/date';

interface StudentDetailDialogProps {
    student: Student | null;
    onOpenChange: (open: boolean) => void;
    onOpenEdit: (student: Student) => void;
}

// 🚀 PREMIUM STATUS BADGES
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Active':
            return <Badge className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest text-[11px] px-3 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 shadow-none transition-colors">Active</Badge>;
        case 'Graduated':
            return <Badge className="border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold uppercase tracking-widest text-[11px] px-3 py-1 hover:bg-purple-50 dark:hover:bg-purple-500/20 shadow-none transition-colors">Graduated</Badge>;
        case 'Transferred':
            return <Badge className="border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold uppercase tracking-widest text-[11px] px-3 py-1 hover:bg-blue-50 dark:hover:bg-blue-500/20 shadow-none transition-colors">Transferred</Badge>;
        case 'Inactive':
            return <Badge className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-[11px] px-3 py-1 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-none transition-colors">Inactive</Badge>;
        default:
            return <Badge variant="outline" className="border-slate-200 dark:border-slate-700 font-bold uppercase tracking-widest text-[11px] px-3 py-1 text-slate-700 dark:text-slate-300 shadow-none transition-colors">{status}</Badge>;
    }
};

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export function StudentDetailDialog({ student, onOpenChange, onOpenEdit }: StudentDetailDialogProps) {
    if (!student) return null;

    const fullName = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
    const isActuallyArchived = student.archived || ['Graduated', 'Transferred', 'Inactive'].includes(student.status);

    return (
        <DialogContent hideClose className="sm:max-w-[800px] p-0 overflow-hidden bg-slate-100 dark:bg-zinc-950 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-200">
            {/* --- HEADER --- */}
            <DialogHeader className="bg-white dark:bg-zinc-900 px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 text-left sm:text-left z-10 relative">
                <div className="flex items-center gap-5">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border-4 border-white dark:border-zinc-900 bg-indigo-50 dark:bg-indigo-500/20 text-2xl font-black text-indigo-700 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition-colors">
                        {getInitials(student.firstName, student.lastName)}
                    </div>
                    <div className="mt-1">
                        <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white transition-colors break-words">
                            {fullName}
                        </DialogTitle>
                        <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 transition-colors">
                            Official Learner Profile
                        </DialogDescription>
                    </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 mt-0">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block transition-colors">Current Status</p>
                    {getStatusBadge(student.status)}
                </div>
            </DialogHeader>

            {/* --- BODY --- */}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[65vh] space-y-8 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30 transition-colors">

                {/* SECTION 1: Learner Identity */}
                <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                    <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                        <Baby className="size-5 text-indigo-500 dark:text-indigo-400" /> Learner Identity
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        <div className="sm:col-span-2">
                            <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Date of Birth & Age</Label>
                            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-base font-bold text-slate-900 dark:text-slate-100 transition-colors">
                                <span className="flex items-center gap-2">
                                    <CalendarDays className="size-5 text-indigo-400 dark:text-indigo-500" />
                                    {formatPHDate(student.dateOfBirth)}
                                </span>
                                <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                                <span className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-3 py-1 rounded-lg text-sm transition-colors">
                                    <Activity className="size-4" />
                                    {calculateAge(student.dateOfBirth)} years old
                                </span>
                            </div>
                        </div>
                        <div>
                            <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Gender</Label>
                            <p className="mt-2.5 text-base font-bold text-slate-900 dark:text-slate-100 transition-colors">{student.gender || 'Not specified'}</p>
                        </div>
                        <div>
                            <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Known As</Label>
                            <p className="mt-2.5 text-base font-bold text-slate-900 dark:text-slate-100 transition-colors">{student.nickname ? `"${student.nickname}"` : 'N/A'}</p>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Center Placement & Guardian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-indigo-50/30 dark:bg-indigo-500/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm space-y-6 relative overflow-hidden transition-colors">
                        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-indigo-100 dark:bg-indigo-500/20 blur-3xl transition-colors"></div>
                        <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-indigo-900 dark:text-indigo-300 uppercase border-b border-indigo-100 dark:border-indigo-500/20 pb-4 relative z-10 transition-colors">
                            <Building2 className="size-5 text-indigo-500 dark:text-indigo-400" /> Placement
                        </h3>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <Label className="text-[11px] font-bold text-indigo-400/80 dark:text-indigo-400/60 uppercase tracking-widest transition-colors">Daycare Center</Label>
                                <p className="mt-2.5 text-lg font-black text-indigo-950 dark:text-indigo-100 transition-colors">{student.daycare}</p>
                            </div>
                            <div>
                                <Label className="text-[11px] font-bold text-indigo-400/80 dark:text-indigo-400/60 uppercase tracking-widest transition-colors">Assigned Session</Label>
                                <p className="mt-2.5 text-base font-bold text-indigo-800 dark:text-indigo-300 transition-colors">
                                    {student.section_name || (student.section_id ? 'Assigned' : 'Unassigned Session')}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                        <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <Users className="size-5 text-indigo-500 dark:text-indigo-400" /> Guardian Info
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Primary Guardian Name</Label>
                                <p className="mt-2.5 text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5 transition-colors">
                                    <UserCircle2 className="size-5 text-slate-400 dark:text-slate-500" />
                                    {student.parentName || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Mobile App Access</Label>
                                <div className="mt-2.5">
                                    {student.parentLinked ? (
                                        <Badge className="border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-indigo-700 dark:text-indigo-400 shadow-none transition-colors">
                                            <ClipboardCheck className="mr-2 size-4" /> Account Linked
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-zinc-800 px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 shadow-none transition-colors">
                                            Not Linked Yet
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 🚀 SECTION 3: Unified General Notes */}
                <section className="space-y-6">
                    {/* General Notes Block (Shows for both Active and Archived if it exists) */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                        <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <FileText className="size-5 text-indigo-500 dark:text-indigo-400" /> General Notes & Remarks
                        </h3>
                        <div>
                            <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Additional Background</Label>
                            <div className="mt-3 text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-5 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[120px] transition-colors">
                                {student.notes ? (
                                    student.notes
                                ) : (
                                    <span className="text-slate-400 dark:text-slate-600 italic transition-colors">No additional background or notes recorded.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Amber Archive Reason Sticky Note (Only shows if Archived) */}
                    {isActuallyArchived && student.archiveReason && (
                        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 p-6 shadow-sm transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-amber-100 dark:bg-amber-500/20 p-3 text-amber-600 dark:text-amber-400 transition-colors">
                                    <StickyNote className="size-6" />
                                </div>
                                <div>
                                    <p className="mb-1.5 text-[11px] font-bold tracking-widest text-amber-800 dark:text-amber-500 uppercase transition-colors">Archive Reason</p>
                                    <p className="text-base font-medium leading-relaxed text-slate-800 dark:text-amber-100 italic transition-colors">"{student.archiveReason}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

            </div>

            {/* --- FOOTER --- */}
            <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 print:hidden">
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X className="mr-2 size-5" /> Close Profile
                </Button>

                {!isActuallyArchived && (
                    <Button
                        className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors"
                        onClick={() => {
                            onOpenChange(false);
                            onOpenEdit(student);
                        }}
                    >
                        <Edit2 className="mr-2 size-5" />
                        Edit Learner Record
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
    );
}
