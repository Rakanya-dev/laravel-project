import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { DaycareFormData } from '@/pages/admin/daycare-management'; // Import the shared type
import { Separator } from '@radix-ui/react-separator';

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

    const validateForm = (formData: DaycareFormData): boolean => {
        if (!formData.name || !formData.address || !formData.city || !formData.province || !formData.phone || !formData.email || !formData.capacity) {
            toast.error('Validation Error', { description: 'All fields marked with * are required.' });
            return false;
        }
        if (parseInt(formData.capacity) <= 0) {
            toast.error('Validation Error', { description: 'Capacity must be greater than 0.' });
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validateForm(formData)) {
            return;
        }
        onSave(formData);
    };

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Add New Daycare Center</DialogTitle>
                <DialogDescription>Register a new daycare center in the system</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Daycare Name <span className="text-red-500">*</span></Label>
                    <Input placeholder="Enter daycare name" value={formData.name} onChange={(e) => setField('name', e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>Street Address <span className="text-red-500">*</span></Label>
                    <Input placeholder="123 Main St, Brgy. San Jose" value={formData.address} onChange={(e) => setField('address', e.target.value)} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>City <span className="text-red-500">*</span></Label>
                        <Input placeholder="General Mariano Alvarez" value={formData.city} onChange={(e) => setField('city', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Province <span className="text-red-500">*</span></Label>
                        <Input placeholder="Cavite" value={formData.province} onChange={(e) => setField('province', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Postal Code <span className="text-red-500">*</span></Label>
                        <Input placeholder="4117" value={formData.postal_code} onChange={(e) => setField('postal_code', e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Contact Email <span className="text-red-500">*</span></Label>
                        <Input type="email" placeholder="info@daycare.com" value={formData.email} onChange={(e) => setField('email', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Phone <span className="text-red-500">*</span></Label>
                        <Input placeholder="+63 917 123 4567" value={formData.phone} onChange={(e) => setField('phone', e.target.value)} />
                    </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Capacity <span className="text-red-500">*</span></Label>
                        <Input type="number" placeholder="50" value={formData.capacity} onChange={(e) => setField('capacity', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Current Enrollment</Label>
                        <Input type="number" placeholder="0" value={formData.current_enrollment} onChange={(e) => setField('current_enrollment', e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Established Date</Label>
                    <Input type="date" value={formData.established_date} onChange={(e) => setField('established_date', e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="A short description of the daycare..." value={formData.description} onChange={(e) => setField('description', e.target.value)} />
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button className="bg-black hover:bg-black/90" onClick={handleSave}>Create Daycare</Button>
            </DialogFooter>
        </DialogContent>
    );
}
