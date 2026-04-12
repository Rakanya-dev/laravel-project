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
import { MinimalStudent } from './archive-student-dialog';

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
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 transition-colors">
                    <RefreshCcw className="size-5" />
                    {title}
                </DialogTitle>
                <DialogDescription className="pt-2 text-slate-500 dark:text-slate-400 transition-colors">
                    {description}
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="status" className="font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                        Restore As <span className="text-red-500 dark:text-red-400">*</span>
                    </Label>
                    <Select value={restoreStatus} onValueChange={onRestoreStatusChange}>
                        <SelectTrigger
                            id="status"
                            className={!restoreStatus
                                ? 'border-red-300 dark:border-red-500/50 bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 transition-colors'
                                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors'
                            }
                        >
                            <SelectValue placeholder="Select a status..." />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-950 dark:border-slate-800">
                            <SelectItem value="Active" className="dark:focus:bg-zinc-800 text-slate-900 dark:text-slate-100">
                                🟢 Active (Currently Enrolled)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 transition-colors">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="font-bold bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                    Cancel
                </Button>
                <Button
                    className="font-bold bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white transition-colors"
                    onClick={onConfirm}
                    disabled={!restoreStatus}
                >
                    Confirm Restore
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
