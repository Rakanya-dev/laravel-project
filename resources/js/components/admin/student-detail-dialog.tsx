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
            return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-50">Active</Badge>;
        case 'Graduated':
            return <Badge className="border-purple-200 bg-purple-50 text-purple-700 font-bold uppercase tracking-widest text-[10px] hover:bg-purple-50">Graduated</Badge>;
        case 'Transferred':
            return <Badge className="border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase tracking-widest text-[10px] hover:bg-blue-50">Transferred</Badge>;
        case 'Inactive':
            return <Badge className="border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50">Inactive</Badge>;
        default:
            return <Badge variant="outline" className="border-slate-200 font-bold uppercase tracking-widest text-[10px]">{status}</Badge>;
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
        <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden bg-slate-100 rounded-2xl border-slate-200 shadow-lg">
            {/* --- HEADER --- */}
            <DialogHeader className="p-6 pb-5 border-b border-slate-100 bg-white shadow-sm z-10 flex flex-row items-center justify-between sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-white bg-indigo-50 text-xl font-black text-indigo-700 shadow-sm ring-1 ring-slate-100">
                        {getInitials(student.firstName, student.lastName)}
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-extrabold text-slate-900">{fullName}</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-2">
                            Official Learner Profile
                        </DialogDescription>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 mt-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                    {getStatusBadge(student.status)}
                </div>
            </DialogHeader>

            {/* --- BODY --- */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 scrollbar-thin">

                {/* SECTION 1: Learner Identity */}
                <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-slate-800 uppercase border-b border-slate-100 pb-3">
                        <Baby className="size-4 text-indigo-500" /> Learner Identity
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                        <div className="sm:col-span-2">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth & Age</Label>
                            <div className="mt-1.5 flex items-center gap-3 text-sm font-bold text-slate-900">
                                <span className="flex items-center gap-2">
                                    <CalendarDays className="size-4 text-indigo-400" />
                                    {formatPHDate(student.dateOfBirth)}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">
                                    <Activity className="size-3" />
                                    {calculateAge(student.dateOfBirth)} years old
                                </span>
                            </div>
                        </div>
                        <div>
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</Label>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">{student.gender || 'Not specified'}</p>
                        </div>
                        <div>
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Known As</Label>
                            <p className="mt-1.5 text-sm font-bold text-slate-900">{student.nickname ? `"${student.nickname}"` : 'N/A'}</p>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Center Placement & Guardian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-5 relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 size-24 rounded-full bg-indigo-100 blur-2xl"></div>
                        <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-indigo-900 uppercase border-b border-indigo-100 pb-3 relative z-10">
                            <Building2 className="size-4 text-indigo-500" /> Placement
                        </h3>
                        <div className="space-y-5 relative z-10">
                            <div>
                                <Label className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">Daycare Center</Label>
                                <p className="mt-1.5 text-base font-extrabold text-indigo-950">{student.daycare}</p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">Assigned Session</Label>
                                <p className="mt-1.5 text-sm font-bold text-indigo-800">
                                    {student.section_name || (student.section_id ? 'Assigned' : 'Unassigned')}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                        <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-slate-800 uppercase border-b border-slate-100 pb-3">
                            <Users className="size-4 text-indigo-500" /> Guardian Info
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Guardian Name</Label>
                                <p className="mt-1.5 text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <UserCircle2 className="size-4 text-slate-400" />
                                    {student.parentName || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile App Access</Label>
                                <div className="mt-1.5">
                                    {student.parentLinked ? (
                                        <Badge className="border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase text-indigo-700 hover:bg-indigo-50">
                                            <ClipboardCheck className="mr-1.5 size-3" /> Account Linked
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase text-slate-500 shadow-none">
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
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                        <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-slate-800 uppercase border-b border-slate-100 pb-3">
                            <FileText className="size-4 text-indigo-500" /> General Notes & Remarks
                        </h3>
                        <div>
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Background</Label>
                            <div className="mt-2 text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[80px]">
                                {student.notes ? (
                                    student.notes
                                ) : (
                                    <span className="text-slate-400 italic">No additional background or notes recorded.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Amber Archive Reason Sticky Note (Only shows if Archived) */}
                    {isActuallyArchived && student.archiveReason && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                                    <StickyNote className="size-5" />
                                </div>
                                <div>
                                    <p className="mb-1 text-[11px] font-bold tracking-wide text-amber-800 uppercase">Archive Reason</p>
                                    <p className="text-sm font-medium leading-relaxed text-slate-800 italic">"{student.archiveReason}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

            </div>

            {/* --- FOOTER --- */}
            <DialogFooter className="p-5 border-t border-slate-100 bg-white flex flex-row justify-between items-center sm:justify-between rounded-b-2xl">
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-11 rounded-xl font-bold">
                    <X className="mr-2 size-4" /> Close Profile
                </Button>

                {!isActuallyArchived && (
                    <Button
                        className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm h-11 rounded-xl font-bold"
                        onClick={() => {
                            onOpenChange(false);
                            onOpenEdit(student);
                        }}
                    >
                        <Edit2 className="mr-2 size-4" />
                        Edit Learner Record
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
    );
}
