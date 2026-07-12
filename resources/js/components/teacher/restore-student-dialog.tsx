import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefreshCw, X } from "lucide-react";
import type { Student } from '@/pages/teacher/my-students';

interface RestoreStudentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: Student | null;
    onConfirm: () => void;
}

export function RestoreStudentDialog({
    open,
    onOpenChange,
    student,
    onConfirm,
}: RestoreStudentDialogProps) {
    if (!student) return null;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col">

                {/* --- PREMIUM HEADER --- */}
                <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors shrink-0">
                    <AlertDialogHeader className="text-left">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                                <RefreshCw className="size-6" strokeWidth={2.5} />
                            </div>
                            <AlertDialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Restore Student
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                            Are you sure you want to restore <strong className="text-slate-900 dark:text-white font-black">{student.firstName} {student.lastName}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </div>

                {/* --- SCROLLABLE BODY --- */}
                <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

                    {/* Info Notice */}
                    <div className="flex items-start gap-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-5 sm:p-6 border border-emerald-200 dark:border-emerald-900/50 shadow-sm transition-colors">
                        <RefreshCw className="size-6 shrink-0 text-emerald-500 dark:text-emerald-400" />
                        <div className="font-medium text-emerald-800 dark:text-emerald-300">
                            <p className="font-extrabold uppercase tracking-widest text-[11px] mb-1.5">Action Confirmation</p>
                            <p className="text-base leading-relaxed">
                                This will move the student back to the <strong className="font-black text-emerald-900 dark:text-emerald-100">Active</strong> list. They will be visible in your main "My Students" roster again.
                            </p>
                        </div>
                    </div>

                </div>

                {/* --- PREMIUM FOOTER --- */}
                <AlertDialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                    <AlertDialogCancel
                        className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold bg-transparent border-0 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors m-0 shadow-none"
                    >
                        <X className="mr-2 size-5" /> Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="h-12 w-full sm:w-auto px-8 rounded-xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-colors m-0"
                    >
                        <RefreshCw className="mr-2 size-5" /> Confirm Restore
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}
