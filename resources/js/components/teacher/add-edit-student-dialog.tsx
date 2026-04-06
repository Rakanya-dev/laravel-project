import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Student } from '@/pages/teacher/my-students';
import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Baby, Building2, FileText, UserSquare2 } from 'lucide-react';

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
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
                {/* --- HEADER --- */}
                <DialogHeader className="p-6 pb-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm z-10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 transition-colors">
                            <UserSquare2 className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white transition-colors">
                                {student ? 'Edit Learner Record' : 'Register New Learner'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">
                                {student ? `Update details for ${formData.first_name}` : `Add a new child to ${currentDaycare}`}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* --- BODY: STACKED CARDS --- */}
                <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">

                    {/* SECTION 1: Learner Identity */}
                    <section className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
                        <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors">
                            <Baby className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Learner Identity
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="firstName" className="text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">First Name <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input id="firstName" value={formData.first_name} onChange={(e) => setField('first_name', e.target.value)} placeholder="e.g. Juan" className="h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lastName" className="text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">Last Name <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input id="lastName" value={formData.last_name} onChange={(e) => setField('last_name', e.target.value)} placeholder="e.g. Dela Cruz" className="h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="middleName" className="text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">Middle Name</Label>
                                <Input id="middleName" value={formData.middle_name} onChange={(e) => setField('middle_name', e.target.value)} placeholder="Optional" className="h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="nickname" className="text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">Nickname</Label>
                                <Input id="nickname" value={formData.nickname} onChange={(e) => setField('nickname', e.target.value)} placeholder="e.g. Juanito" className="h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="dateOfBirth" className="text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">Date of Birth <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input id="dateOfBirth" type="date" value={formData.date_of_birth} onChange={(e) => setField('date_of_birth', e.target.value)} className="h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-indigo-500 transition-colors" />
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-1 transition-colors">Determines Form Type (0-3 or 3-5 years)</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="gender" className="text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">Gender <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Select value={formData.gender || undefined} onValueChange={(value) => setField('gender', value)}>
                                    <SelectTrigger id="gender" className="h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-indigo-500 transition-colors">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                        <SelectItem value="Male" className="dark:text-slate-200 dark:focus:bg-zinc-800">Male</SelectItem>
                                        <SelectItem value="Female" className="dark:text-slate-200 dark:focus:bg-zinc-800">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: Placement */}
                    <section className="bg-indigo-50/50 dark:bg-indigo-500/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm space-y-4 transition-colors">
                        <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-indigo-900 dark:text-indigo-300 uppercase border-b border-indigo-100 dark:border-indigo-500/20 pb-2 transition-colors">
                            <Building2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Center Placement
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="daycare" className="text-indigo-900 dark:text-indigo-300 text-xs font-bold transition-colors">Daycare Center</Label>
                                <Input
                                    id="daycare"
                                    value={currentDaycare}
                                    disabled
                                    className="h-10 cursor-not-allowed border-indigo-200 dark:border-indigo-500/30 bg-indigo-100/50 dark:bg-zinc-950 text-indigo-800 dark:text-indigo-400 font-medium shadow-none transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="section_id" className="text-indigo-900 dark:text-indigo-300 text-xs font-bold transition-colors">Session / Class <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Select
                                    value={formData.section_id ? String(formData.section_id) : undefined}
                                    onValueChange={(value) => setField('section_id', value)}
                                >
                                    <SelectTrigger id="section_id" className="h-10 bg-white dark:bg-zinc-950 border-indigo-200 dark:border-indigo-500/30 text-slate-900 dark:text-white focus:ring-indigo-500 transition-colors">
                                        <SelectValue placeholder="Assign to session" />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                        {sections?.length === 0 ? (
                                            <SelectItem value="none" disabled className="dark:text-slate-500">No sessions configured</SelectItem>
                                        ) : (
                                            sections?.map((section) => (
                                                <SelectItem key={section.id} value={String(section.id)} className="dark:text-slate-200 dark:focus:bg-zinc-800">{section.name}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: General Notes */}
                    <section className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
                        <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors">
                            <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> General Notes & Remarks
                        </h3>
                        <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors">General Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setField('notes', e.target.value)}
                                placeholder="Enter any additional background, notes, or remarks for this learner..."
                                className="resize-none h-[100px] bg-white dark:bg-zinc-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500 shadow-sm transition-colors"
                            />
                        </div>
                    </section>

                </div>

                {/* --- FOOTER --- */}
                <DialogFooter className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 transition-colors sm:flex-row gap-2 sm:gap-0">
                    <Button variant="outline" className="w-full sm:w-auto text-slate-600 dark:text-slate-300 bg-white dark:bg-zinc-900 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-indigo-600 dark:bg-indigo-600 text-white hover:bg-indigo-700 dark:hover:bg-indigo-500 w-full sm:w-auto shadow-sm transition-colors">
                        {isSubmitting ? 'Saving...' : student ? 'Save Learner Record' : 'Register Learner'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
