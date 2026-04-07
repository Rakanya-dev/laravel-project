import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { DaycareFormData } from '@/pages/admin/daycare-management';
import { Building2, MapPin, Phone, Users, UserCircle, CheckCircle } from 'lucide-react';

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
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-950 shadow-sm z-10 transition-colors">
                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Add New Daycare Center
                </DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm leading-relaxed">
                    Register a new daycare center branch into the management system.
                </DialogDescription>
            </DialogHeader>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-8 bg-slate-50/50 dark:bg-zinc-900/50 transition-colors">

                {/* --- Section: Basic Info --- */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                        <Building2 className="size-4 text-indigo-500 dark:text-indigo-400" /> Center Information
                    </h4>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Daycare Name <span className="text-rose-500 dark:text-rose-400">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. Happy Kids Learning Center"
                            className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors"
                            value={formData.name}
                            onChange={(e) => setField('name', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</Label>
                        <Textarea
                            placeholder="A brief overview of the facility and its programs..."
                            className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 resize-none h-20 focus-visible:ring-indigo-500 transition-colors"
                            value={formData.description}
                            onChange={(e) => setField('description', e.target.value)}
                        />
                    </div>
                </div>

                {/* --- Section: Location --- */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                        <MapPin className="size-4 text-indigo-500 dark:text-indigo-400" /> Location Details
                    </h4>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Street Address <span className="text-rose-500 dark:text-rose-400">*</span>
                        </Label>
                        <Input
                            placeholder="123 Main St, Brgy. San Jose"
                            className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors"
                            value={formData.address}
                            onChange={(e) => setField('address', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                City <span className="text-rose-500 dark:text-rose-400">*</span>
                            </Label>
                            <Input
                                placeholder="GMA"
                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors"
                                value={formData.city}
                                onChange={(e) => setField('city', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Province <span className="text-rose-500 dark:text-rose-400">*</span>
                            </Label>
                            <Input
                                placeholder="Cavite"
                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors"
                                value={formData.province}
                                onChange={(e) => setField('province', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Postal Code</Label>
                            <Input
                                placeholder="4117"
                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors"
                                value={formData.postal_code}
                                onChange={(e) => setField('postal_code', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* --- Section: Contact --- */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                        <Phone className="size-4 text-indigo-500 dark:text-indigo-400" /> Contact Information
                    </h4>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Email Address <span className="text-rose-500 dark:text-rose-400">*</span>
                            </Label>
                            <Input
                                type="email"
                                placeholder="hello@daycare.com"
                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors"
                                value={formData.email}
                                onChange={(e) => setField('email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Mobile Number <span className="text-rose-500 dark:text-rose-400">*</span>
                            </Label>
                            <Input
                                type="tel"
                                placeholder="+63 XXX XXX XXXX"
                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors"
                                value={formData.phone}
                                onChange={(e) => setField('phone', formatPhoneNumber(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* --- Section: Assign Educators --- */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserCircle className="size-4 text-indigo-500 dark:text-indigo-400" /> Assign Educators
                        </div>
                        <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold border-none transition-colors">
                            {(formData.teachers || []).length} Selected
                        </Badge>
                    </h4>

                    <div className="max-h-[200px] overflow-y-auto space-y-2 p-1 scrollbar-thin dark:scrollbar-thumb-zinc-700">
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
                                return <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 border dark:border-slate-800 rounded-xl border-dashed transition-colors">No teachers available.</p>;
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
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                                                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        <span className={`text-sm font-bold truncate pr-3 ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {teacherName}
                                        </span>
                                        <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {isSelected && <CheckCircle className="size-3.5 text-white" />}
                                        </div>
                                    </button>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* --- Section: Operational --- */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                        <Users className="size-4 text-indigo-500 dark:text-indigo-400" /> Operational Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Maximum Capacity <span className="text-rose-500 dark:text-rose-400">*</span>
                            </Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="50"
                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-indigo-500 transition-colors"
                                value={formData.capacity}
                                onChange={(e) => setField('capacity', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Established Date</Label>
                            <Input
                                type="date"
                                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-indigo-500 transition-colors"
                                value={formData.established_date}
                                onChange={(e) => setField('established_date', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

            </div>

            <DialogFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-950 gap-2 sm:gap-0 transition-colors">
                <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="w-full sm:w-auto text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    Cancel
                </Button>
                <Button
                    className="w-full sm:w-auto gap-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm transition-colors"
                    onClick={handleSave}
                >
                    Create Center
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
