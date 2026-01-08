import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Student } from '@/pages/teacher/my-students';
import { AlertCircle, Archive, Ban, FileText, Phone, StickyNote, User } from 'lucide-react';

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
    return `${student.firstName}${student.middleName ? ' ' + student.middleName : ''} ${student.lastName}`.trim();
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export function ViewStudentDialog({ open, onOpenChange, student, daycareName, onStartAssessment, isArchived = false }: ViewStudentDialogProps) {
    if (!student) return null;

    const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
    const isActuallyArchived = isArchived || ['Graduated', 'Transferred', 'Inactive'].includes(student.status);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden rounded-xl border-0 p-0 sm:max-w-[600px]">
                <div className="px-6 pt-6 pb-0">
                    <DialogHeader className="mb-6 flex flex-row items-start justify-between text-left">
                        <div>
                            <DialogTitle className="text-xl font-semibold text-gray-900">Student Details</DialogTitle>
                            <DialogDescription className="text-gray-500">View detailed information about {student.firstName}</DialogDescription>
                        </div>
                        {/* Visual Indicator for Archived Students */}
                        {isArchived && (
                            <Badge
                                variant="destructive"
                                className="flex items-center gap-1.5 border-amber-200 bg-amber-100 px-3 py-1 text-amber-800 shadow-sm hover:bg-amber-100"
                            >
                                <Archive className="size-3.5" /> Archived
                            </Badge>
                        )}
                    </DialogHeader>

                    {/* Header Profile Section */}
                    <div className="flex items-center gap-5 rounded-xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
                        <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
                            <AvatarFallback className="bg-blue-600 text-2xl font-bold text-white">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">{getFullName(student)}</h3>
                            <div className="mt-1.5 flex items-center gap-3 text-sm font-medium text-slate-600">
                                <span className="flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-0.5">
                                    <User className="size-3.5 text-slate-400" /> {student.age} years old
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-600">{student.gender || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="my-6 grid grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Parent/Guardian</p>
                            <p className="text-sm font-medium text-gray-900">{student.parentName}</p>
                            <p className="text-xs text-gray-500">{student.parentEmail}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Status</p>
                            <Badge
                                variant="secondary"
                                className={`font-medium ${isArchived ? 'border-gray-200 bg-gray-100 text-gray-500' : 'border-green-100 bg-green-50 text-green-700'}`}
                            >
                                {student.status}
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Last Assessment</p>
                            <p className="text-sm font-medium text-gray-900">{student.lastAssessment || 'N/A'}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Daycare Center</p>
                            <p className="text-sm font-medium text-gray-900">{daycareName}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Date of Birth</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(student.date_of_birth)}</p>
                        </div>
                    </div>

                    {isActuallyArchived && (student.archiveReason || student.notes) && (
                        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-full bg-amber-100 p-1.5 text-amber-600">
                                    <StickyNote className="size-4" />
                                </div>
                                <div>
                                    <p className="mb-1 text-xs font-bold tracking-wide text-amber-800 uppercase">Reason for Archiving</p>
                                    <p className="text-sm leading-relaxed text-gray-800">{student.archiveReason || student.notes}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Emergency Contact (Conditional) */}
                    {(student.emergency_contact_name || student.emergency_contact_phone) && (
                        <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50/50 p-3">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full border border-rose-100 bg-white p-1.5 shadow-sm">
                                    <AlertCircle className="size-4 text-rose-500" />
                                </div>
                                <div>
                                    <p className="mb-0.5 text-xs font-bold tracking-wide text-rose-800 uppercase">Emergency Contact</p>
                                    <p className="text-sm font-semibold text-gray-900">{student.emergency_contact_name}</p>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-600">
                                        <Phone className="size-3" /> {student.emergency_contact_phone}
                                        {student.emergency_contact_relationship && (
                                            <span className="text-gray-400">• {student.emergency_contact_relationship}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9 border-gray-300 bg-white hover:bg-gray-50">
                            Close
                        </Button>

                        {isActuallyArchived ? (
                            <Button disabled className="h-9 cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400 shadow-none">
                                <Ban className="mr-2 size-3.5" /> Archived
                            </Button>
                        ) : (
                            <Button className="h-9 bg-slate-900 text-white shadow-sm hover:bg-slate-800" onClick={onStartAssessment}>
                                <FileText className="mr-2 size-3.5" /> New Assessment
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
