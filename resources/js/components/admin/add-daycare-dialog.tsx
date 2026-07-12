import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { DaycareFormData } from '@/pages/admin/daycare-management';
import { Building2, MapPin, Phone, Users, UserCircle, CheckCircle, Mail, Plus, X } from 'lucide-react';

import { formatPhoneNumber } from '@/utils/phone';

interface AddDaycareDialogProps {
    onOpenChange: (open: boolean) => void;
    onSave: (daycare: DaycareFormData) => void;
    initialForm: DaycareFormData;
    onSetForm: React.Dispatch<React.SetStateAction<DaycareFormData>>;
    availableTeachers: string[];
}

export default function AddDaycareDialog({
    onOpenChange,
    onSave,
    initialForm: formData,
    onSetForm: setFormData,
    availableTeachers,
}: AddDaycareDialogProps) {

    const setField = (key: keyof DaycareFormData, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const validateForm = (data: DaycareFormData): boolean => {
        if (!data.name || !data.address || !data.city || !data.province || !data.phone || !data.email || !data.capacity) {
            toast.error('Missing required fields', { description: 'Please fill out all fields marked with an asterisk (*).' });
            return false;
        }

        const cleanPhone = data.phone.replace(/\D/g, '');

        if (cleanPhone.length !== 12) {
            toast.error('Invalid Phone Number', { description: 'Please enter a valid 10-digit Philippine mobile number.' });
            return false;
        }

        if (parseInt(data.capacity) <= 0) {
            toast.error('Invalid Capacity', { description: 'Maximum capacity must be at least 1 student.' });
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validateForm(formData)) return;

        const formattedData = {
            ...formData,
            phone: formData.phone.replace(/\s/g, '')
        };

        onSave(formattedData);
    };

    return (
        <DialogContent hideClose className="sm:max-w-[700px] p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 transition-colors duration-200 shadow-2xl rounded-2xl">

            {/* --- HEADER (Premium Standard) --- */}
            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors z-10">
                <DialogHeader className="text-left">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                            <Building2 className="size-6" strokeWidth={2.5} />
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Add New Daycare Center
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                        Register a new daycare center branch into the management system.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[65vh] space-y-8 bg-slate-50 dark:bg-zinc-950/30 transition-colors custom-scrollbar">

                {/* --- Section: Basic Info --- */}
                <div className="space-y-6">
                    <h4 className="flex items-center gap-3 text-sm font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-200 dark:border-slate-800 pb-3 transition-colors">
                        <Building2 className="size-5 text-indigo-500 dark:text-indigo-400" /> Center Information
                    </h4>

                    <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                            Daycare Name <span className="text-red-500 dark:text-red-400">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. Happy Kids Learning Center"
                            className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors shadow-sm"
                            value={formData.name}
                            onChange={(e) => setField('name', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Description</Label>
                        <Textarea
                            placeholder="A brief overview of the facility and its programs..."
                            className="min-h-[140px] p-4 text-base font-medium rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 resize-none focus-visible:ring-indigo-500 transition-colors shadow-sm"
                            value={formData.description}
                            onChange={(e) => setField('description', e.target.value)}
                        />
                    </div>
                </div>

                {/* --- Section: Location --- */}
                <div className="space-y-6">
                    <h4 className="flex items-center gap-3 text-sm font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-200 dark:border-slate-800 pb-3 transition-colors">
                        <MapPin className="size-5 text-indigo-500 dark:text-indigo-400" /> Location Details
                    </h4>

                    <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                            Street Address <span className="text-red-500 dark:text-red-400">*</span>
                        </Label>
                        <Input
                            placeholder="123 Main St, Brgy. San Jose"
                            className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors shadow-sm"
                            value={formData.address}
                            onChange={(e) => setField('address', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                City <span className="text-red-500 dark:text-red-400">*</span>
                            </Label>
                            <Input
                                placeholder="GMA"
                                className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors shadow-sm"
                                value={formData.city}
                                onChange={(e) => setField('city', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                Province <span className="text-red-500 dark:text-red-400">*</span>
                            </Label>
                            <Input
                                placeholder="Cavite"
                                className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors shadow-sm"
                                value={formData.province}
                                onChange={(e) => setField('province', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Postal Code</Label>
                            <Input
                                placeholder="4117"
                                className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors shadow-sm"
                                value={formData.postal_code}
                                onChange={(e) => setField('postal_code', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* --- Section: Contact --- */}
                <div className="space-y-6">
                    <h4 className="flex items-center gap-3 text-sm font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-200 dark:border-slate-800 pb-3 transition-colors">
                        <Phone className="size-5 text-indigo-500 dark:text-indigo-400" /> Contact Information
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                Email Address <span className="text-red-500 dark:text-red-400">*</span>
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                                <Input
                                    type="email"
                                    placeholder="hello@daycare.com"
                                    className="h-12 text-base pl-12 font-medium rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors shadow-sm"
                                    value={formData.email}
                                    onChange={(e) => setField('email', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                Mobile Number <span className="text-red-500 dark:text-red-400">*</span>
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                                <Input
                                    type="tel"
                                    placeholder="+63 9XX XXX XXXX"
                                    className="h-12 text-base pl-12 font-medium rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors shadow-sm"
                                    value={formData.phone}
                                    onChange={(e) => setField('phone', formatPhoneNumber(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Section: Assign Educators --- */}
                <div className="space-y-6">
                    <h4 className="flex items-center justify-between text-sm font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-200 dark:border-slate-800 pb-3 transition-colors">
                        <div className="flex items-center gap-3">
                            <UserCircle className="size-5 text-indigo-500 dark:text-indigo-400" /> Assign Educators
                        </div>
                        <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold px-3 py-1 text-[11px] shadow-none border-none transition-colors">
                            {(formData.teachers || []).length} Selected
                        </Badge>
                    </h4>

                    <div className="max-h-[240px] overflow-y-auto space-y-3 p-1 custom-scrollbar">
                        {(() => {
                            const currentTeachers = formData.teachers || [];

                            const sortedTeachers = [...availableTeachers].sort((a, b) => {
                                const aSelected = currentTeachers.includes(a);
                                const bSelected = currentTeachers.includes(b);

                                if (aSelected && !bSelected) return -1;
                                if (!aSelected && bSelected) return 1;
                                return a.localeCompare(b);
                            });

                            if (sortedTeachers.length === 0) {
                                return <p className="text-base font-medium text-slate-500 dark:text-slate-400 text-center py-6 border border-slate-200 dark:border-slate-800 rounded-xl border-dashed transition-colors">No teachers available.</p>;
                            }

                            return sortedTeachers.map((teacherName) => {
                                const isSelected = currentTeachers.includes(teacherName);

                                return (
                                    <button
                                        key={teacherName}
                                        type="button"
                                        onClick={() => {
                                            let updatedTeachers = [...currentTeachers];
                                            if (isSelected) {
                                                updatedTeachers = updatedTeachers.filter(t => t !== teacherName);
                                            } else {
                                                updatedTeachers.push(teacherName);
                                            }
                                            setField('teachers', updatedTeachers);
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                                                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        <span className={`text-base font-bold truncate pr-3 ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {teacherName}
                                        </span>
                                        <div className={`size-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {isSelected && <CheckCircle className="size-4 text-white" />}
                                        </div>
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* --- Section: Operational --- */}
                <div className="space-y-6">
                    <h4 className="flex items-center gap-3 text-sm font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-200 dark:border-slate-800 pb-3 transition-colors">
                        <Users className="size-5 text-indigo-500 dark:text-indigo-400" /> Operational Settings
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                Maximum Capacity <span className="text-red-500 dark:text-red-400">*</span>
                            </Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="50"
                                className="h-12 text-lg font-black rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors shadow-sm"
                                value={formData.capacity}
                                onChange={(e) => setField('capacity', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Established Date</Label>
                            <Input
                                type="date"
                                className="h-12 text-base font-medium rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-indigo-500 transition-colors shadow-sm"
                                value={formData.established_date}
                                onChange={(e) => setField('established_date', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* --- FOOTER --- */}
            <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0 rounded-b-2xl">
                <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors m-0"
                >
                    <X className="mr-2 size-5" /> Cancel
                </Button>
                <Button
                    className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm transition-colors m-0"
                    onClick={handleSave}
                >
                    <Plus className="size-5 mr-2" /> Create Center
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
