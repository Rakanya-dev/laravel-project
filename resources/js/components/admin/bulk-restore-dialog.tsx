import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import type { Student } from '@/pages/admin/student-management'; // Import shared type

interface BulkRestoreDialogProps {
    selectedArchivedStudents: Student[];
    bulkRestoreStatus: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
    onRestoreStatusChange: React.Dispatch<React.SetStateAction<'Active' | 'Inactive' | 'Graduated' | 'Transferred'>>;
    onConfirm: () => void;
    onCancel: () => void;
}

export function BulkRestoreDialog({
    selectedArchivedStudents,
    bulkRestoreStatus,
    onRestoreStatusChange,
    onConfirm,
    onCancel,
}: BulkRestoreDialogProps) {

    return (
        <DialogContent className="max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Bulk Restore Child Records</DialogTitle>
                <DialogDescription>
                    Set the status for {selectedArchivedStudents.length} selected student(s) when restoring from archive
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {/* Selected Students Preview */}
                <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                    <Label className="text-green-900">Selected Students ({selectedArchivedStudents.length})</Label>
                    <div className="mt-2 max-h-[120px] overflow-y-auto space-y-1">
                        {selectedArchivedStudents.map(student => (
                            <div key={student.id} className="text-[13px] text-green-800 flex items-center justify-between">
                                <span>{`${student.firstName} ${student.middleName} ${student.lastName}`.trim()}</span>
                                <span className="text-[12px] text-green-600">Archived: {student.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                    <Label htmlFor="bulkRestoreStatus">
                        Restore All As <span className="text-red-500">*</span>
                    </Label>
                    <Select value={bulkRestoreStatus} onValueChange={(value: any) => onRestoreStatusChange(value)}>
                        <SelectTrigger id="bulkRestoreStatus"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-50 text-[#27815f] border-[#baf7d1]">Active</Badge>
                                    <span className="text-[13px] text-neutral-500">Currently enrolled</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Inactive">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-gray-50 text-[#697280] border-[#f3f4f5]">Inactive</Badge>
                                    <span className="text-[13px] text-neutral-500">Temporarily not attending</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Graduated">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-[#f4e9fe] text-[#9846dd] border-purple-50">Graduated</Badge>
                                    <span className="text-[13px] text-neutral-500">Keep graduated status</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Transferred">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-[#eff6fe] text-[#4b7ae8] border-[#d7e9fd]">Transferred</Badge>
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
                            <p className="text-blue-900">
                                All {selectedArchivedStudents.length} records will be restored with status: <strong>{bulkRestoreStatus}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700">
                    <RefreshCw className="size-4 mr-2" />
                    Restore {selectedArchivedStudents.length} Student(s)
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
