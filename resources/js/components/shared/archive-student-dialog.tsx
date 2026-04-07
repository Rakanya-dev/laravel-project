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
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl transition-colors duration-200">
            <DialogHeader className="p-6 pb-4 border-b border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-500/10 transition-colors">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-amber-700 dark:text-amber-500">
                    <AlertTriangle className="size-5" />
                    {title}
                </DialogTitle>
                <DialogDescription className="pt-2 text-sm font-medium text-amber-800/70 dark:text-amber-400/80 leading-relaxed">
                    {description}
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 p-6 bg-slate-50/50 dark:bg-zinc-950 transition-colors">
                {/* Status Dropdown */}
                <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Archive Status <span className="text-rose-500 dark:text-rose-400">*</span>
                    </Label>
                    <Select value={archiveStatus} onValueChange={onArchiveStatusChange}>
                        <SelectTrigger
                            id="status"
                            className={`h-11 rounded-xl transition-all ${
                                !archiveStatus
                                    ? 'border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 text-slate-500 dark:text-slate-400'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 font-medium text-slate-900 dark:text-white focus:ring-indigo-500'
                            }`}
                        >
                            <SelectValue placeholder="Select a status..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                            <SelectItem value="Inactive" className="font-medium dark:focus:bg-zinc-800 dark:text-slate-200">Inactive (Dropped / Paused)</SelectItem>
                            <SelectItem value="Transferred" className="font-medium dark:focus:bg-zinc-800 dark:text-slate-200">Transferred to another school</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Reason Textarea */}
                <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reason / Notes</Label>
                    <Textarea
                        id="reason"
                        placeholder="Briefly explain why they are leaving..."
                        value={archiveReason}
                        onChange={(e) => onArchiveReasonChange(e.target.value)}
                        className="resize-none rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                        rows={3}
                    />
                </div>
            </div>

            <DialogFooter className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-950 flex flex-row justify-end items-center gap-2 sm:gap-2 transition-colors">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="h-11 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button
                    variant="destructive"
                    onClick={onConfirm}
                    disabled={!archiveStatus}
                    className="h-11 rounded-xl font-bold bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white shadow-sm transition-colors w-full sm:w-auto disabled:opacity-50"
                >
                    Confirm Archive
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
