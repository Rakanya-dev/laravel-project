import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Archive } from 'lucide-react';
import type { Student } from '@/pages/admin/student-management'; // Import shared type

interface BulkArchiveDialogProps {
    selectedStudents: Student[];
    bulkArchiveStatus: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
    onArchiveStatusChange: React.Dispatch<React.SetStateAction<'Active' | 'Inactive' | 'Graduated' | 'Transferred'>>;
    bulkArchiveReason: string;
    onArchiveReasonChange: React.Dispatch<React.SetStateAction<string>>;
    onConfirm: () => void;
    onCancel: () => void;
}

export function BulkArchiveDialog({
    selectedStudents,
    bulkArchiveStatus,
    onArchiveStatusChange,
    bulkArchiveReason,
    onArchiveReasonChange,
    onConfirm,
    onCancel,
}: BulkArchiveDialogProps) {

    return (
        <DialogContent className="max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Bulk Archive Child Records</DialogTitle>
                <DialogDescription>
                    Set the status for {selectedStudents.length} selected student(s) before archiving
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {/* Selected Students Preview */}
                <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                    <Label className="text-blue-900">Selected Students ({selectedStudents.length})</Label>
                    <div className="mt-2 max-h-[120px] overflow-y-auto space-y-1">
                        {selectedStudents.map(student => (
                            <div key={student.id} className="text-[13px] text-blue-800 flex items-center justify-between">
                                <span>{`${student.firstName} ${student.middleName} ${student.lastName}`.trim()}</span>
                                <span className="text-[12px] text-blue-600">Current: {student.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                    <Label htmlFor="bulkArchiveStatus">
                        Apply Status to All <span className="text-red-500">*</span>
                    </Label>
                    <Select value={bulkArchiveStatus} onValueChange={(value: any) => onArchiveStatusChange(value)}>
                        <SelectTrigger id="bulkArchiveStatus"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Graduated">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-[#f4e9fe] text-[#9846dd] border-purple-50">Graduated</Badge>
                                    <span className="text-[13px] text-neutral-500">Completed the program</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Transferred">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-[#eff6fe] text-[#4b7ae8] border-[#d7e9fd]">Transferred</Badge>
                                    <span className="text-[13px] text-neutral-500">Moved to another facility</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Inactive">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-gray-50 text-[#697280] border-[#f3f4f5]">Inactive</Badge>
                                    <span className="text-[13px] text-neutral-500">No longer attending</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Bulk Archive Reason */}
                <div className="space-y-2">
                    <Label htmlFor="bulkArchiveReason">Archive Notes (Optional)</Label>
                    <Input
                        id="bulkArchiveReason"
                        value={bulkArchiveReason}
                        onChange={(e) => onArchiveReasonChange(e.target.value)}
                        placeholder="e.g., End of school year graduation..."
                    />
                </div>

                {/* Warning */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <div className="flex gap-2">
                        <Archive className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-[13px]">
                            <p className="text-amber-900">
                                All {selectedStudents.length} selected records will be archived with status: <strong>{bulkArchiveStatus}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm} className="bg-black hover:bg-black/90">
                    <Archive className="size-4 mr-2" />
                    Archive {selectedStudents.length} Student(s)
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
