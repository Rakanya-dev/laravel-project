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
import { RefreshCw } from "lucide-react";
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
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <RefreshCw className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <AlertDialogTitle>Restore Student?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to restore <strong>{student.firstName} {student.lastName}</strong>?
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                <div className="py-2 text-sm text-muted-foreground">
                    This will move the student back to the <strong>Active</strong> list. They will be visible in your main "My Students" table again.
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Confirm Restore
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
