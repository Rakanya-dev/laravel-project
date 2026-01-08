import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Archive } from 'lucide-react';
import type { Student } from '@/pages/admin/student-management'; // Import shared type

interface ArchiveStudentDialogProps {
    student: Student | null;
    archiveStatus: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
    onArchiveStatusChange: React.Dispatch<React.SetStateAction<'Active' | 'Inactive' | 'Graduated' | 'Transferred'>>;
    archiveReason: string;
    onArchiveReasonChange: React.Dispatch<React.SetStateAction<string>>;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ArchiveStudentDialog({
    student,
    archiveStatus,
    onArchiveStatusChange,
    archiveReason,
    onArchiveReasonChange,
    onConfirm,
    onCancel,
}: ArchiveStudentDialogProps) {
    if (!student) return null;

    return (
        <DialogContent className="max-w-[550px]">
            <DialogHeader>
                <DialogTitle>Archive Child Record</DialogTitle>
                <DialogDescription>Please confirm the final status before archiving this record</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <div className="rounded-lg bg-gray-50 p-4 border">
                    <Label className="text-neutral-500">Child Being Archived</Label>
                    <p className="mt-1">{`${student.firstName} ${student.middleName} ${student.lastName}`.trim()}</p>
                    <p className="text-[13px] text-neutral-500 mt-1">Current Status: {student.status}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="archiveStatus">Final Status <span className="text-red-500">*</span></Label>
                    <Select value={archiveStatus} onValueChange={(value: any) => onArchiveStatusChange(value)}>
                        <SelectTrigger id="archiveStatus"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Graduated"><Badge className="bg-[#f4e9fe] text-[#9846dd] border-purple-50">Graduated</Badge></SelectItem>
                            <SelectItem value="Transferred"><Badge className="bg-[#eff6fe] text-[#4b7ae8] border-[#d7e9fd]">Transferred</Badge></SelectItem>
                            <SelectItem value="Inactive"><Badge className="bg-gray-50 text-[#697280] border-[#f3f4f5]">Inactive</Badge></SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="archiveReason">Archive Notes (Optional)</Label>
                    <Input id="archiveReason" value={archiveReason} onChange={(e) => onArchiveReasonChange(e.target.value)} placeholder="e.g., Completed program..." />
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} className="bg-black hover:bg-black/90">
                    <Archive className="size-4 mr-2" />
                    Confirm Archive
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
