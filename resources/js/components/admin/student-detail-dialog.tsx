import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit2 } from 'lucide-react';
import type { Student } from '@/pages/admin/student-management';

interface StudentDetailDialogProps {
    student: Student | null;
    onOpenChange: (open: boolean) => void;
    onOpenEdit: (student: Student) => void;
}

const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US'); // 03/20/2020
};

// Internal component for status badge rendering
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Active':
            return <Badge className="bg-green-50 text-[#27815f] border-[#baf7d1] hover:bg-green-50 text-[13px] px-3 py-1 rounded-lg">Active</Badge>;
        case 'Graduated':
            return <Badge className="bg-[#f4e9fe] text-[#9846dd] border-purple-50 hover:bg-[#f4e9fe] text-[13px] px-3 py-1 rounded-lg">Graduated</Badge>;
        case 'Transferred':
            return <Badge className="bg-[#eff6fe] text-[#4b7ae8] border-[#d7e9fd] hover:bg-[#eff6fe] text-[13px] px-3 py-1 rounded-lg">Transferred</Badge>;
        case 'Inactive':
            return <Badge className="bg-gray-50 text-[#697280] border-[#f3f4f5] hover:bg-gray-50 text-[13px] px-3 py-1 rounded-lg">Inactive</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
};

export function StudentDetailDialog({
    student,
    onOpenChange,
    onOpenEdit,
}: StudentDetailDialogProps) {
    if (!student) return null;

    return (
        <DialogContent className="max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Child Details</DialogTitle>
                <DialogDescription>Complete information for this child record</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-neutral-500">Full Name</Label>
                        <p className="mt-1">{`${student.firstName} ${student.middleName} ${student.lastName}`.trim()}</p>
                    </div>
                    <div>
                        <Label className="text-neutral-500">Date of Birth</Label>
                        <p className="mt-1">{formatDateForDisplay(student.dateOfBirth)}</p>
                    </div>
                </div>
                <div>
                    <Label className="text-neutral-500">Daycare Center</Label>
                    <p className="mt-1">{student.daycare}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-neutral-500">Status</Label>
                        <div className="mt-1">{getStatusBadge(student.status)}</div>
                    </div>
                    <div>
                        <Label className="text-neutral-500">Parent Status</Label>
                        <div className="mt-1">
                            {student.parentLinked ? (
                                <div className="flex flex-col gap-1">
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50 text-[13px] px-3 py-1 rounded-lg w-fit">Linked</Badge>
                                    <span className="text-[13px] text-neutral-500">{student.parentName}</span>
                                </div>
                            ) : (
                                <Badge variant="outline" className="text-[13px] px-3 py-1 rounded-lg border-neutral-300 text-neutral-600">Not Linked</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                <Button
                    className="bg-black hover:bg-black/90"
                    onClick={() => {
                        onOpenChange(false);
                        onOpenEdit(student);
                    }}
                >
                    <Edit2 className="size-4 mr-2" />
                    Edit Record
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
