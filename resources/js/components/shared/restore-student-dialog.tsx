import { Button } from '@/components/ui/button';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RefreshCcw } from 'lucide-react';
import { MinimalStudent } from './archive-student-dialog'; // Reuse the interface we just made!

interface RestoreStudentDialogProps {
    student: MinimalStudent | null;
    restoreStatus: string;
    onRestoreStatusChange: (status: string) => void;
    onConfirm: () => void;
    onCancel: () => void;

    // Optional props for bulk restoring
    isBulk?: boolean;
    selectedStudents?: MinimalStudent[];
}

export function RestoreStudentDialog({
    student,
    restoreStatus,
    onRestoreStatusChange,
    onConfirm,
    onCancel,
    isBulk = false,
    selectedStudents = [],
}: RestoreStudentDialogProps) {

    const title = isBulk ? 'Restore Multiple Students' : 'Restore Student';
    const description = isBulk
        ? `You are about to restore ${selectedStudents.length} students back to the active roster.`
        : `You are about to restore ${student?.firstName} ${student?.lastName} back to the active roster.`;

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-600">
                    <RefreshCcw className="size-5" />
                    {title}
                </DialogTitle>
                <DialogDescription className="pt-2">
                    {description}
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="status" className="font-semibold">
                        Restore As <span className="text-red-500">*</span>
                    </Label>
                    <Select value={restoreStatus} onValueChange={onRestoreStatusChange}>
                        <SelectTrigger id="status" className={!restoreStatus ? 'border-red-300 bg-white' : 'bg-white'}>
                            <SelectValue placeholder="Select a status..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">🟢 Active (Currently Enrolled)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={onConfirm}
                    disabled={!restoreStatus}
                >
                    Confirm Restore
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
