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
import { RefreshCcw, X } from 'lucide-react';
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
        <DialogContent hideClose className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col">

            {/* --- PREMIUM HEADER --- */}
            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <DialogHeader className="text-left">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                            <RefreshCcw className="size-6" strokeWidth={2.5} />
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                        {description}
                    </DialogDescription>
                </DialogHeader>
            </div>

            {/* --- SCROLLABLE BODY --- */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

                {/* Status Dropdown */}
                <div className="space-y-2.5">
                    <Label htmlFor="status" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                        Restore As <span className="text-red-500">*</span>
                    </Label>
                    <Select value={restoreStatus} onValueChange={onRestoreStatusChange}>
                        <SelectTrigger
                            id="status"
                            className={`h-12 text-base font-medium rounded-xl shadow-sm transition-all focus-visible:ring-indigo-500 ${
                                !restoreStatus
                                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white'
                            }`}
                        >
                            <SelectValue placeholder="Select a status..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800 transition-colors">
                            <SelectItem value="Active" className="font-medium rounded-lg py-3 cursor-pointer transition-colors text-base">
                                Active (Currently Enrolled)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* --- PREMIUM FOOTER --- */}
            <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                >
                    <X className="mr-2 size-5" /> Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={!restoreStatus}
                    className="h-12 w-full sm:w-auto px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-base font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                    <RefreshCcw className="mr-2 size-5" /> Confirm Restore
                </Button>
            </DialogFooter>

        </DialogContent>
    );
}
