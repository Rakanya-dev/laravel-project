import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Student, StudentFormData, Section } from '@/pages/admin/student-management';
import { Baby, Building2, FileText, UserSquare2 } from 'lucide-react';

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

    // Find Daycare ID to filter available sessions
    const selectedDaycareId = daycares.find(d => d.name === formData.daycare)?.id;
    const availableSections = sections.filter(s => s.daycare_id === selectedDaycareId);

    const handleDaycareChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            daycare: value,
            section_id: '' // Clear session when daycare changes so they don't submit invalid combos
        }));
    };

    return (
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-slate-50">
            {/* --- HEADER --- */}
            <DialogHeader className="p-6 pb-5 border-b border-slate-200 bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <UserSquare2 className="h-6 w-6" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-slate-800">
                            {editingStudent ? 'Edit Learner Record' : 'Register New Learner'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 mt-0.5">
                            {editingStudent ? 'Update official ECCD registry details.' : 'Add a new child to the official ECCD registry.'}
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            {/* --- BODY --- */}
            <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">

                {/* SECTION 1: Learner Identity */}
                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-800 uppercase border-b border-slate-100 pb-2">
                        <Baby className="h-4 w-4 text-indigo-500" /> Learner Identity
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-slate-700 text-xs font-bold">First Name <span className="text-red-500">*</span></Label>
                            <Input id="firstName" value={formData.firstName} onChange={(e) => setField('firstName', e.target.value)} placeholder="e.g. Juan" className="h-10" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-slate-700 text-xs font-bold">Last Name <span className="text-red-500">*</span></Label>
                            <Input id="lastName" value={formData.lastName} onChange={(e) => setField('lastName', e.target.value)} placeholder="e.g. Dela Cruz" className="h-10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="middleName" className="text-slate-700 text-xs font-bold">Middle Name</Label>
                            <Input id="middleName" value={formData.middleName} onChange={(e) => setField('middleName', e.target.value)} placeholder="Optional" className="h-10" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="nickname" className="text-slate-700 text-xs font-bold">Nickname</Label>
                            <Input id="nickname" value={formData.nickname} onChange={(e) => setField('nickname', e.target.value)} placeholder="e.g. Juanito" className="h-10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="dateOfBirth" className="text-slate-700 text-xs font-bold">Date of Birth <span className="text-red-500">*</span></Label>
                            <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setField('dateOfBirth', e.target.value)} className="h-10" />
                            <p className="text-[10px] text-slate-400 leading-tight mt-1">Determines Form Type (0-3 or 3-5 years)</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="gender" className="text-slate-700 text-xs font-bold">Gender <span className="text-red-500">*</span></Label>
                            <Select value={formData.gender || undefined} onValueChange={(value) => setField('gender', value)}>
                                <SelectTrigger id="gender" className="h-10">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: Placement */}
                <section className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 shadow-sm space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-indigo-900 uppercase border-b border-indigo-100 pb-2">
                        <Building2 className="h-4 w-4 text-indigo-500" /> Center Placement
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="daycare" className="text-indigo-900 text-xs font-bold">Daycare Center <span className="text-red-500">*</span></Label>
                            <Select value={formData.daycare || undefined} onValueChange={handleDaycareChange}>
                                <SelectTrigger id="daycare" className="h-10 bg-white border-indigo-200 focus:ring-indigo-500">
                                    <SelectValue placeholder="Assign to Daycare" />
                                </SelectTrigger>
                                <SelectContent>
                                    {daycares.map((daycare) => (
                                        <SelectItem key={daycare.id} value={daycare.name}>{daycare.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="section_id" className="text-indigo-900 text-xs font-bold">Session / Class <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.section_id ? String(formData.section_id) : undefined}
                                onValueChange={(value) => setField('section_id', value)}
                                disabled={!formData.daycare || availableSections.length === 0}
                            >
                                <SelectTrigger id="section_id" className="h-10 bg-white border-indigo-200 focus:ring-indigo-500">
                                    <SelectValue placeholder={!formData.daycare ? "Select Daycare First" : "Assign to Session"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableSections.length === 0 ? (
                                        <SelectItem value="none" disabled>No sessions configured</SelectItem>
                                    ) : (
                                        availableSections.map((section) => (
                                            <SelectItem key={section.id} value={String(section.id)}>{section.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </section>

                {/* 🚀 SECTION 3: General Notes (No Health Fields) */}
                <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-800 uppercase border-b border-slate-100 pb-2">
                        <FileText className="h-4 w-4 text-indigo-500" /> General Notes & Remarks
                    </h3>
                    <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-slate-700 text-xs font-bold">General Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setField('notes', e.target.value)}
                            placeholder="Enter any additional background, notes, or remarks for this learner..."
                            className="resize-none h-[100px] border-slate-300 focus:border-indigo-500 shadow-sm"
                        />
                    </div>
                </section>

            </div>

            {/* --- FOOTER --- */}
            <DialogFooter className="p-5 border-t border-slate-200 bg-white">
                <Button variant="outline" className="w-full sm:w-auto text-slate-600 border-slate-300" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} className="bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto shadow-sm">
                    {editingStudent ? 'Save Learner Record' : 'Register Learner'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
