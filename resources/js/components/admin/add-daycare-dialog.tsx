import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { DaycareFormData } from '@/pages/admin/daycare-management';
import { Building2, MapPin, Phone, Users } from 'lucide-react';

interface AddDaycareDialogProps {
    onOpenChange: (open: boolean) => void;
    onSave: (daycare: DaycareFormData) => void;
    initialForm: DaycareFormData;
    onSetForm: React.Dispatch<React.SetStateAction<DaycareFormData>>;
}

export default function AddDaycareDialog({
    onOpenChange,
    onSave,
    initialForm: formData,
    onSetForm: setFormData
}: AddDaycareDialogProps) {

    const setField = (key: keyof DaycareFormData, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // 🚀 NEW: Smart Phone Number Formatter
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Strip out anything that isn't a number
        let val = e.target.value.replace(/\D/g, '');

        // If they accidentally copy-pasted a leading zero or 63, strip it so it formats perfectly
        if (val.startsWith('63')) val = val.substring(2);
        if (val.startsWith('0')) val = val.substring(1);

        // Limit to 10 digits (Standard PH mobile format: 917 123 4567)
        if (val.length > 10) val = val.substring(0, 10);

        setField('phone', val);
    };

    const validateForm = (data: DaycareFormData): boolean => {
        if (!data.name || !data.address || !data.city || !data.province || !data.phone || !data.email || !data.capacity) {
            toast.error('Missing required fields', { description: 'Please fill out all fields marked with an asterisk (*).' });
            return false;
        }
        if (data.phone.length !== 10) {
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

        // 🚀 We bundle the +63 prefix with their 10 digits right before sending it to Laravel
        const formattedData = {
            ...formData,
            phone: `+63${formData.phone}`
        };

        onSave(formattedData);
    };

    return (
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-white">
            {/* 🚀 FIXED: Sticky Header */}
            <DialogHeader className="p-6 pb-4 border-b border-neutral-100 bg-white shadow-sm z-10">
                <DialogTitle className="text-xl">Add New Daycare Center</DialogTitle>
                <DialogDescription>Register a new daycare center branch into the management system.</DialogDescription>
            </DialogHeader>

            {/* 🚀 FIXED: Scrollable Inner Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-8 bg-neutral-50/30">

                {/* --- Section: Basic Info --- */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold tracking-wider text-neutral-500 uppercase flex items-center gap-2">
                        <Building2 className="size-4" /> Center Information
                    </h4>
                    <div className="space-y-2">
                        <Label className="text-black">Daycare Name <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="e.g. Happy Kids Learning Center"
                            className="bg-white border-neutral-200"
                            value={formData.name}
                            onChange={(e) => setField('name', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-black">Description</Label>
                        <Textarea
                            placeholder="A brief overview of the facility and its programs..."
                            className="bg-white border-neutral-200 resize-none h-20"
                            value={formData.description}
                            onChange={(e) => setField('description', e.target.value)}
                        />
                    </div>
                </div>

                {/* --- Section: Location --- */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold tracking-wider text-neutral-500 uppercase flex items-center gap-2">
                        <MapPin className="size-4" /> Location Details
                    </h4>
                    <div className="space-y-2">
                        <Label className="text-black">Street Address <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="123 Main St, Brgy. San Jose"
                            className="bg-white"
                            value={formData.address}
                            onChange={(e) => setField('address', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-black">City <span className="text-red-500">*</span></Label>
                            <Input placeholder="GMA" className="bg-white" value={formData.city} onChange={(e) => setField('city', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-black">Province <span className="text-red-500">*</span></Label>
                            <Input placeholder="Cavite" className="bg-white" value={formData.province} onChange={(e) => setField('province', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-black">Postal Code</Label>
                            <Input placeholder="4117" className="bg-white" value={formData.postal_code} onChange={(e) => setField('postal_code', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* --- Section: Contact --- */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold tracking-wider text-neutral-500 uppercase flex items-center gap-2">
                        <Phone className="size-4" /> Contact Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-black">Email Address <span className="text-red-500">*</span></Label>
                            <Input
                                type="email"
                                placeholder="hello@daycare.com"
                                className="bg-white"
                                value={formData.email}
                                onChange={(e) => setField('email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-black">Mobile Number <span className="text-red-500">*</span></Label>
                            <div className="flex">
                                {/* 🚀 The permanently affixed +63 badge */}
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-200 bg-neutral-100 text-neutral-600 font-medium text-sm">
                                    +63
                                </span>
                                <Input
                                    type="tel"
                                    placeholder="917 123 4567"
                                    className="rounded-l-none bg-white focus-visible:ring-1 focus-visible:ring-black"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Section: Operational --- */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold tracking-wider text-neutral-500 uppercase flex items-center gap-2">
                        <Users className="size-4" /> Operational Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-black">Maximum Capacity <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="50"
                                className="bg-white"
                                value={formData.capacity}
                                onChange={(e) => setField('capacity', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-black">Established Date</Label>
                            <Input
                                type="date"
                                className="bg-white"
                                value={formData.established_date}
                                onChange={(e) => setField('established_date', e.target.value)}
                            />
                        </div>
                        {/* 🚀 REMOVED: current_enrollment input box! */}
                    </div>
                </div>

            </div>

            {/* 🚀 FIXED: Sticky Footer */}
            <DialogFooter className="p-6 border-t border-neutral-100 bg-white">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
                <Button className="bg-black hover:bg-black/90 w-full sm:w-auto gap-2" onClick={handleSave}>
                    Create Center
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
