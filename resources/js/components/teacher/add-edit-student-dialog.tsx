import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Student } from '@/pages/teacher/my-students';
import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Baby, Building2, FileText, UserSquare2, X } from 'lucide-react';

interface AddEditStudentDialogProps {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    student: Student | null;
    onStudentChange: Dispatch<SetStateAction<Student | null>>;
    onSave: (data: any) => void;
    currentDaycare: string;
    sections: { id: number; name: string }[];
}

export function AddEditStudentDialog({ open, onOpenChange, student, onSave, currentDaycare, sections }: AddEditStudentDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Exact column names for Laravel
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        nickname: '',
        date_of_birth: '',
        gender: '',
        section_id: '',
        special_needs: '',
        notes: '',
    });

    useEffect(() => {
        if (open) {
            setIsSubmitting(false);
            setFormData({
                first_name: student?.firstName || '',
                middle_name: student?.middleName || '',
                last_name: student?.lastName || '',
                nickname: student?.nickname || '',
                date_of_birth: student?.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
                gender: student?.gender || '',
                section_id: student?.section_id ? student.section_id.toString() : '',
                special_needs: student?.special_needs || '',
                notes: student?.notes || '',
            });
        }
    }, [student, open]);

    const setField = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideClose className="sm:max-w-[750px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col max-h-[90vh]">

                {/* --- PREMIUM HEADER --- */}
                <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors z-10 shrink-0">
                    <DialogHeader className="text-left">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                                <UserSquare2 className="size-6" strokeWidth={2.5} />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {student ? 'Edit Learner Record' : 'Register New Learner'}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                            {student ? `Update details for ${formData.first_name}` : `Add a new child to ${currentDaycare}`}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* --- SCROLLABLE BODY --- */}
                <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6 sm:space-y-8 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30 max-h-[65vh]">

                    {/* SECTION 1: Learner Identity */}
                    <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                        <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <Baby className="size-5 text-indigo-500 dark:text-indigo-400" /> Learner Identity
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="firstName" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">First Name <span className="text-red-500">*</span></Label>
                                <Input id="firstName" value={formData.first_name} onChange={(e) => setField('first_name', e.target.value)} placeholder="e.g. Juan" className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="lastName" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Last Name <span className="text-red-500">*</span></Label>
                                <Input id="lastName" value={formData.last_name} onChange={(e) => setField('last_name', e.target.value)} placeholder="e.g. Dela Cruz" className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="middleName" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Middle Name</Label>
                                <Input id="middleName" value={formData.middle_name} onChange={(e) => setField('middle_name', e.target.value)} placeholder="Optional" className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="nickname" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Nickname</Label>
                                <Input id="nickname" value={formData.nickname} onChange={(e) => setField('nickname', e.target.value)} placeholder="e.g. Juanito" className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="dateOfBirth" className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                    <span>Date of Birth <span className="text-red-500">*</span></span>
                                </Label>
                                <Input id="dateOfBirth" type="date" value={formData.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mt-1 transition-colors">Determines Form Type (0-3 or 3-5 yrs)</p>
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="gender" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Gender <span className="text-red-500">*</span></Label>
                                <Select value={formData.gender || undefined} onValueChange={(value) => setField('gender', value)}>
                                    <SelectTrigger id="gender" className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm focus:ring-indigo-500 transition-colors">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800 transition-colors">
                                        <SelectItem value="Male" className="font-medium rounded-lg py-3 text-base cursor-pointer transition-colors">Male</SelectItem>
                                        <SelectItem value="Female" className="font-medium rounded-lg py-3 text-base cursor-pointer transition-colors">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: Placement */}
                    <section className="bg-indigo-50/30 dark:bg-indigo-500/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm space-y-6 relative overflow-hidden transition-colors">
                        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-indigo-100 dark:bg-indigo-500/20 blur-3xl transition-colors"></div>
                        <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-indigo-900 dark:text-indigo-300 uppercase border-b border-indigo-200/50 dark:border-indigo-500/20 pb-4 relative z-10 transition-colors">
                            <Building2 className="size-5 text-indigo-500 dark:text-indigo-400" /> Center Placement
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                            <div className="space-y-2.5">
                                <Label htmlFor="daycare" className="text-[11px] font-bold uppercase tracking-widest text-indigo-800/80 dark:text-indigo-400/80 transition-colors">Daycare Center</Label>
                                <Input
                                    id="daycare"
                                    value={currentDaycare}
                                    disabled
                                    className="h-12 text-base rounded-xl cursor-not-allowed border-indigo-200 dark:border-indigo-500/30 bg-indigo-100/50 dark:bg-zinc-950/50 text-indigo-900 dark:text-indigo-400 font-bold shadow-none transition-colors"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label htmlFor="section_id" className="text-[11px] font-bold uppercase tracking-widest text-indigo-800/80 dark:text-indigo-400/80 transition-colors">Session / Class <span className="text-red-500">*</span></Label>
                                <Select
                                    value={formData.section_id ? String(formData.section_id) : undefined}
                                    onValueChange={(value) => setField('section_id', value)}
                                >
                                    <SelectTrigger id="section_id" className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-950 border-indigo-200 dark:border-indigo-500/30 text-slate-900 dark:text-white shadow-sm focus:ring-indigo-500 transition-colors">
                                        <SelectValue placeholder="Assign to session" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800 transition-colors">
                                        {sections?.length === 0 ? (
                                            <SelectItem value="none" disabled className="dark:text-slate-500 text-base py-3">No sessions configured</SelectItem>
                                        ) : (
                                            sections?.map((section) => (
                                                <SelectItem key={section.id} value={String(section.id)} className="font-medium rounded-lg py-3 text-base cursor-pointer transition-colors">{section.name}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: General Notes */}
                    <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                        <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <FileText className="size-5 text-indigo-500 dark:text-indigo-400" /> General Notes & Remarks
                        </h3>
                        <div className="space-y-2.5">
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setField('notes', e.target.value)}
                                placeholder="Enter any additional background, notes, or remarks for this learner..."
                                className="min-h-[140px] p-4 text-base font-medium rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 shadow-sm focus-visible:ring-indigo-500 transition-colors"
                            />
                        </div>
                    </section>

                </div>

                {/* --- PREMIUM FOOTER --- */}
                <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0 rounded-b-2xl shrink-0">
                    <Button
                        variant="ghost"
                        className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="mr-2 size-5" /> Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors"
                    >
                        {isSubmitting ? 'Saving...' : student ? 'Save Learner Record' : 'Register Learner'}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
