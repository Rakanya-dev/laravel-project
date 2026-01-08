import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import type { Student } from '@/pages/admin/student-management'; // Import shared type

interface RestoreStudentDialogProps {
    student: Student | null;
    restoreStatus: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
    onRestoreStatusChange: React.Dispatch<React.SetStateAction<'Active' | 'Inactive' | 'Graduated' | 'Transferred'>>;
    onConfirm: () => void;
    onCancel: () => void;
}

// Helper to format date
const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US'); // 03/20/2020
};

export function RestoreStudentDialog({
    student,
    restoreStatus,
    onRestoreStatusChange,
    onConfirm,
    onCancel,
}: RestoreStudentDialogProps) {
    if (!student) return null;

    return (
        <DialogContent className="max-w-[550px]">
            <DialogHeader>
                <DialogTitle>Restore Child Record</DialogTitle>
                <DialogDescription>
                    Choose the status for this student when restoring from archive
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {/* Student Info */}
                <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                    <Label className="text-green-900">Child Being Restored</Label>
                    <p className="mt-1 text-green-950">{`${student.firstName} ${student.middleName} ${student.lastName}`.trim()}</p>
                    <p className="text-[13px] text-green-700 mt-1">
                        DOB: {formatDateForDisplay(student.dateOfBirth)}
                    </p>
                    <p className="text-[13px] text-green-700">
                        Archived Status: {student.status}
                    </p>
                    {student.archivedDate && (
                        <p className="text-[13px] text-green-700">
                            Archived On: {formatDateForDisplay(student.archivedDate)}
                        </p>
                    )}
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                    <Label htmlFor="restoreStatus">
                        Restore As <span className="text-red-500">*</span>
                    </Label>
                    <Select value={restoreStatus} onValueChange={(value: any) => onRestoreStatusChange(value)}>
                        <SelectTrigger id="restoreStatus">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-50 text-[#27815f] border-[#baf7d1] hover:bg-green-50 text-[13px] px-3 py-1 rounded-lg">Active</Badge>
                                    <span className="text-[13px] text-neutral-500">Currently enrolled</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Inactive">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-gray-50 text-[#697280] border-[#f3f4f5] hover:bg-gray-50 text-[13px] px-3 py-1 rounded-lg">Inactive</Badge>
                                    <span className="text-[13px] text-neutral-500">Temporarily not attending</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Graduated">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-[#f4e9fe] text-[#9846dd] border-purple-50 hover:bg-[#f4e9fe] text-[13px] px-3 py-1 rounded-lg">Graduated</Badge>
                                    <span className="text-[13px] text-neutral-500">Keep graduated status</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Transferred">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-[#eff6fe] text-[#4b7ae8] border-[#d7e9fd] hover:bg-[#eff6fe] text-[13px] px-3 py-1 rounded-lg">Transferred</Badge>
                                    <span className="text-[13px] text-neutral-500">Keep transferred status</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Info Notice */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <div className="flex gap-2">
                        <RefreshCw className="size-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-[13px]">
                            <p className="text-blue-900">This record will be restored to the active student list.</p>
                            <p className="text-blue-700 mt-1">You can archive it again later if needed.</p>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
                    <RefreshCw className="size-4 mr-2" />
                    Restore Student
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
