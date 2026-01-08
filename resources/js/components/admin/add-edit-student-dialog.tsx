import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Student, StudentFormData } from '@/pages/admin/student-management';

interface AddEditStudentDialogProps {
    editingStudent: Student | null;
    formData: StudentFormData;
    onFormDataChange: React.Dispatch<React.SetStateAction<StudentFormData>>;
    onSubmit: () => void;
    daycareList: string[];
    onOpenChange: (open: boolean) => void;
}

export function AddEditStudentDialog({
    editingStudent,
    formData,
    onFormDataChange: setFormData,
    onSubmit,
    daycareList,
    onOpenChange,
}: AddEditStudentDialogProps) {
    const setField = (key: keyof StudentFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <DialogContent className="max-h-[90vh] max-w-[600px] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingStudent ? 'Edit Child Record' : 'Add New Child'}</DialogTitle>
                <DialogDescription>{editingStudent ? 'Update child details' : 'Register a new child into the system'}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
                {/* --- Row 1: Name --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">
                            First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input id="firstName" value={formData.firstName} onChange={(e) => setField('firstName', e.target.value)} placeholder="Juan" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input
                            id="middleName"
                            value={formData.middleName}
                            onChange={(e) => setField('middleName', e.target.value)}
                            placeholder="Santos"
                        />
                    </div>
                </div>

                {/* --- Row 2: Last Name & Nickname --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="lastName">
                            Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setField('lastName', e.target.value)}
                            placeholder="Dela Cruz"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nickname">Nickname</Label>
                        <Input id="nickname" value={formData.nickname} onChange={(e) => setField('nickname', e.target.value)} placeholder="Juany" />
                    </div>
                </div>

                {/* --- Row 3: Vital Stats --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">
                            Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setField('dateOfBirth', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">
                            Gender <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.gender} onValueChange={(value) => setField('gender', value)}>
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- Row 4: Placement --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="daycare">
                            Daycare Center <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.daycare} onValueChange={(value) => setField('daycare', value)}>
                            <SelectTrigger id="daycare">
                                <SelectValue placeholder="Select Daycare" />
                            </SelectTrigger>
                            <SelectContent>
                                {daycareList.map((daycare) => (
                                    <SelectItem key={daycare} value={daycare}>
                                        {daycare}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- Row 5: Details --- */}
                <div className="space-y-2">
                    <Label htmlFor="special_needs">Special Needs / Requirements</Label>
                    <Textarea
                        id="special_needs"
                        value={formData.special_needs}
                        onChange={(e) => setField('special_needs', e.target.value)}
                        placeholder="e.g. ADHD, Needs reading assistance..."
                        className="resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">General Notes</Label>
                    <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setField('notes', e.target.value)}
                        placeholder="Any additional information..."
                        className="resize-none"
                    />
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>

                <Button onClick={onSubmit} className="bg-black text-white hover:bg-black/90">
                    {editingStudent ? 'Save Changes' : 'Add Child'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
