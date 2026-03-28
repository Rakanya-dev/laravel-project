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
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

// 🚀 FIX: A generic interface so both Admin and Teacher can pass their students!
export interface MinimalStudent {
    firstName: string;
    lastName: string;
    [key: string]: any;
}

interface ArchiveStudentDialogProps {
    student: MinimalStudent | null;
    archiveStatus: string;
    onArchiveStatusChange: (status: string) => void;
    archiveReason: string;
    onArchiveReasonChange: (reason: string) => void;
    onConfirm: () => void;
    onCancel: () => void;

    // 🚀 FIX: Made these optional so the Admin (who only archives 1 at a time) doesn't need to pass them
    isBulk?: boolean;
    selectedStudents?: MinimalStudent[];
}

export function ArchiveStudentDialog({
    student,
    archiveStatus,
    onArchiveStatusChange,
    archiveReason,
    onArchiveReasonChange,
    onConfirm,
    onCancel,
    isBulk = false,
    selectedStudents = [],
}: ArchiveStudentDialogProps) {

    const title = isBulk ? 'Archive Multiple Students' : 'Archive Student';
    const description = isBulk
        ? `You are about to remove ${selectedStudents.length} students from the active roster. They will be moved to the Inactive/Withdrawn list.`
        : `You are about to remove ${student?.firstName} ${student?.lastName} from the active roster. They will be moved to the Inactive/Withdrawn list.`;

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="size-5" />
                    {title}
                </DialogTitle>
                <DialogDescription className="pt-2">
                    {description}
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
                {/* Status Dropdown */}
                <div className="space-y-2">
                    <Label htmlFor="status" className="font-semibold">
                        Archive Status <span className="text-red-500">*</span>
                    </Label>
                    <Select value={archiveStatus} onValueChange={onArchiveStatusChange}>
                        <SelectTrigger id="status" className={!archiveStatus ? 'border-red-300 bg-white' : ' border-red-300 bg-white'}>
                            <SelectValue placeholder="Select a status..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Inactive">Inactive (Dropped / Paused)</SelectItem>
                            <SelectItem value="Transferred">Transferred to another school</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Reason Textarea */}
                <div className="space-y-2">
                    <Label htmlFor="reason" className="font-semibold">Reason / Notes</Label>
                    <Textarea
                        id="reason"
                        placeholder="Briefly explain why they are leaving..."
                        value={archiveReason}
                        onChange={(e) => onArchiveReasonChange(e.target.value)}
                        className="resize-none"
                        rows={3}
                    />
                </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    onClick={onConfirm}
                    disabled={!archiveStatus}
                >
                    Confirm Archive
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
