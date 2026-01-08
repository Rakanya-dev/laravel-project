import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Student } from '@/pages/teacher/my-students';

interface AddEditStudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: Student | null;
    onStudentChange: React.Dispatch<React.SetStateAction<Student | null>>;
    onSave: (data: any) => void;
    currentDaycare: string;
}

export function AddEditStudentDialog({
    open,
    onOpenChange,
    student,
    onSave,
    currentDaycare
}: AddEditStudentDialogProps) {

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        nickname: '',
        dateOfBirth: '',
        gender: '',
        special_needs: '',
        notes: '',
    });

    useEffect(() => {
        setFormData({
            firstName: student?.firstName || '',
            middleName: student?.middleName || '',
            lastName: student?.lastName || '',
            nickname: student?.nickname || '',
            dateOfBirth: student?.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
            gender: student?.gender || '',
            special_needs: student?.special_needs || '',
            notes: student?.notes || '',
        });
    }, [student, open]);

    const setField = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{student ? 'Edit Child Record' : 'Add New Child'}</DialogTitle>
                    <DialogDescription>
                        {student
                            ? `Update details for ${student.firstName} ${student.lastName}`
                            : `Register a new child to ${currentDaycare}`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* --- Row 1: Name --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setField('firstName', e.target.value)}
                                placeholder="Juan"
                            />
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
                            <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setField('lastName', e.target.value)}
                                placeholder="Dela Cruz"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nickname">Nickname</Label>
                            <Input
                                id="nickname"
                                value={formData.nickname}
                                onChange={(e) => setField('nickname', e.target.value)}
                                placeholder="Juany"
                            />
                        </div>
                    </div>

                    {/* --- Row 3: Vital Stats --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth <span className="text-red-500">*</span></Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setField('dateOfBirth', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                            <Select value={formData.gender} onValueChange={(value) => setField('gender', value)}>
                                <SelectTrigger id="gender"><SelectValue placeholder="Select" /></SelectTrigger>
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
                            <Label htmlFor="daycare">Daycare Center</Label>
                            <Input
                                id="daycare"
                                value={currentDaycare}
                                disabled
                                className="bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed"
                            />
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-black hover:bg-black/90 text-white">
                        {student ? 'Save Changes' : 'Add Child'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
