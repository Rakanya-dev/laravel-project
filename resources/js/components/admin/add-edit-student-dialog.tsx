import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Student, StudentFormData, Section } from '@/pages/admin/student-management';
import { Baby, Building2, FileText, UserSquare2, Save, X } from 'lucide-react';

interface AddEditStudentDialogProps {
    editingStudent: Student | null;
    formData: StudentFormData;
    onFormDataChange: React.Dispatch<React.SetStateAction<StudentFormData>>;
    onSubmit: () => void;
    daycares: { id: number; name: string }[];
    sections: Section[];
    onOpenChange: (open: boolean) => void;
}

export function AddEditStudentDialog({
    editingStudent,
    formData,
    onFormDataChange: setFormData,
    onSubmit,
    daycares,
    sections,
    onOpenChange,
}: AddEditStudentDialogProps) {

    const setField = (key: keyof StudentFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const selectedDaycareId = daycares.find(d => d.name === formData.daycare)?.id;
    const availableSections = sections.filter(s => s.daycare_id === selectedDaycareId);

    const handleDaycareChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            daycare: value,
            section_id: ''
        }));
    };

    return (
        <DialogContent hideClose className="sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200">

            {/* --- HEADER --- */}
            <DialogHeader className="bg-white dark:bg-zinc-900 px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors text-left sm:text-left">
                <DialogTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    <UserSquare2 className="size-6 sm:size-7 text-indigo-600 dark:text-indigo-400" />
                    {editingStudent ? 'Edit Learner Record' : 'Register Learner'}
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-base mt-2">
                    {editingStudent ? 'Update official ECCD registry details.' : 'Add a new child to the official ECCD registry.'}
                </DialogDescription>
            </DialogHeader>

            {/* --- BODY --- */}
            <div className="p-6 sm:p-8 overflow-y-auto max-h-[65vh] space-y-8 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

                {/* SECTION 1: Learner Identity */}
                <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                    <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                        <Baby className="size-5 text-indigo-500 dark:text-indigo-400" /> Learner Identity
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">First Name <span className="text-red-500 dark:text-red-400">*</span></Label>
                            <Input id="firstName" value={formData.firstName} onChange={(e) => setField('firstName', e.target.value)} placeholder="e.g. Juan" className="h-12 text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Last Name <span className="text-red-500 dark:text-red-400">*</span></Label>
                            <Input id="lastName" value={formData.lastName} onChange={(e) => setField('lastName', e.target.value)} placeholder="e.g. Dela Cruz" className="h-12 text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="middleName" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Middle Name</Label>
                            <Input id="middleName" value={formData.middleName} onChange={(e) => setField('middleName', e.target.value)} placeholder="Optional" className="h-12 text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nickname" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Known As (Nickname)</Label>
                            <Input id="nickname" value={formData.nickname} onChange={(e) => setField('nickname', e.target.value)} placeholder="e.g. Juanito" className="h-12 text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Date of Birth <span className="text-red-500 dark:text-red-400">*</span></Label>
                            <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setField('dateOfBirth', e.target.value)} className="h-12 text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors" />
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 transition-colors">Determines Form Type (0-3 or 3-5 years)</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Gender <span className="text-red-500 dark:text-red-400">*</span></Label>
                            <Select value={formData.gender || undefined} onValueChange={(value) => setField('gender', value)}>
                                <SelectTrigger id="gender" className="h-12 text-base rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white shadow-sm transition-colors">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-zinc-900 dark:border-slate-800 rounded-xl">
                                    <SelectItem value="Male" className="text-base font-medium rounded-lg dark:focus:bg-zinc-800 dark:text-slate-200 py-2">Male</SelectItem>
                                    <SelectItem value="Female" className="text-base font-medium rounded-lg dark:focus:bg-zinc-800 dark:text-slate-200 py-2">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Placement */}
                <section className="bg-indigo-50/30 dark:bg-indigo-500/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm space-y-6 relative overflow-hidden transition-colors">
                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-indigo-100 dark:bg-indigo-500/20 blur-3xl transition-colors"></div>
                    <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-indigo-900 dark:text-indigo-300 uppercase border-b border-indigo-100 dark:border-indigo-500/20 pb-4 relative z-10 transition-colors">
                        <Building2 className="size-5 text-indigo-500 dark:text-indigo-400" /> Center Placement
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-2">
                            <Label htmlFor="daycare" className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400 transition-colors">Daycare Center <span className="text-red-500 dark:text-red-400">*</span></Label>
                            <Select value={formData.daycare || undefined} onValueChange={handleDaycareChange}>
                                <SelectTrigger id="daycare" className="h-12 text-base rounded-xl bg-white dark:bg-zinc-950 border-indigo-200 dark:border-indigo-500/30 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white shadow-sm transition-colors">
                                    <SelectValue placeholder="Assign to Daycare" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-zinc-900 dark:border-slate-800 rounded-xl">
                                    {daycares.map((daycare) => (
                                        <SelectItem key={daycare.id} value={daycare.name} className="text-base font-medium rounded-lg dark:focus:bg-zinc-800 dark:text-slate-200 py-2">{daycare.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="section_id" className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400 transition-colors">Session / Class <span className="text-red-500 dark:text-red-400">*</span></Label>
                            <Select
                                value={formData.section_id ? String(formData.section_id) : undefined}
                                onValueChange={(value) => setField('section_id', value)}
                                disabled={!formData.daycare || availableSections.length === 0}
                            >
                                <SelectTrigger id="section_id" className="h-12 text-base rounded-xl bg-white dark:bg-zinc-950 border-indigo-200 dark:border-indigo-500/30 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white disabled:opacity-50 shadow-sm transition-colors">
                                    <SelectValue placeholder={!formData.daycare ? "Select Daycare First" : "Assign to Session"} />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-zinc-900 dark:border-slate-800 rounded-xl">
                                    {availableSections.length === 0 ? (
                                        <SelectItem value="none" disabled className="text-base font-medium dark:text-slate-500">No sessions configured</SelectItem>
                                    ) : (
                                        availableSections.map((section) => (
                                            <SelectItem key={section.id} value={String(section.id)} className="text-base font-medium rounded-lg dark:focus:bg-zinc-800 dark:text-slate-200 py-2">{section.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                {/* 🚀 SECTION 3: General Notes */}
                <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                    <h3 className="flex items-center gap-3 text-base font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                        <FileText className="size-5 text-indigo-500 dark:text-indigo-400" /> General Notes & Remarks
                    </h3>
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">General Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setField('notes', e.target.value)}
                            placeholder="Enter any additional background, notes, or remarks for this learner..."
                            className="min-h-[140px] text-base p-4 rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 resize-none font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors shadow-sm"
                        />
                    </div>
                </section>

            </div>

            {/* --- FOOTER --- */}
            <DialogFooter className="px-6 py-4 sm:px-8 sm:py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0">
                <Button variant="ghost" className="h-12 w-full sm:w-auto text-base font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors" onClick={() => onOpenChange(false)}>
                    <X className="mr-2 size-5" /> Cancel
                </Button>
                <Button onClick={onSubmit} className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors">
                    <Save className="mr-2 size-5" /> {editingStudent ? 'Save Learner Record' : 'Register Learner'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
