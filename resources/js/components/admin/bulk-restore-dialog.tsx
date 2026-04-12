import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import type { Student } from '@/pages/admin/student-management';

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
        <DialogContent className="max-w-[600px] bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white transition-colors">Bulk Restore Child Records</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 transition-colors">
                    Set the status for {selectedArchivedStudents.length} selected student(s) when restoring from archive
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {/* Selected Students Preview */}
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-4 border border-emerald-200 dark:border-emerald-500/20 transition-colors">
                    <Label className="text-emerald-900 dark:text-emerald-400 font-bold transition-colors">Selected Students ({selectedArchivedStudents.length})</Label>
                    <div className="mt-2 max-h-[120px] overflow-y-auto space-y-1 custom-scrollbar">
                        {selectedArchivedStudents.map(student => (
                            <div key={student.id} className="text-[13px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between transition-colors">
                                <span className="font-medium">{`${student.firstName} ${student.middleName} ${student.lastName}`.trim()}</span>
                                <span className="text-[12px] text-emerald-600 dark:text-emerald-500">Archived: {student.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                    <Label htmlFor="bulkRestoreStatus" className="text-slate-700 dark:text-slate-300 transition-colors">
                        Restore All As <span className="text-red-500 dark:text-red-400">*</span>
                    </Label>
                    <Select value={bulkRestoreStatus} onValueChange={(value: any) => onRestoreStatusChange(value)}>
                        <SelectTrigger id="bulkRestoreStatus" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-950 dark:border-slate-800">
                            <SelectItem value="Active" className="dark:focus:bg-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-colors">Active</Badge>
                                    <span className="text-[13px] text-slate-500 dark:text-slate-400 transition-colors">Currently enrolled</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Inactive" className="dark:focus:bg-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800/50 dark:text-slate-400 dark:border-slate-700/50 transition-colors">Inactive</Badge>
                                    <span className="text-[13px] text-slate-500 dark:text-slate-400 transition-colors">Temporarily not attending</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Graduated" className="dark:focus:bg-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 transition-colors">Graduated</Badge>
                                    <span className="text-[13px] text-slate-500 dark:text-slate-400 transition-colors">Keep graduated status</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Transferred" className="dark:focus:bg-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 transition-colors">Transferred</Badge>
                                    <span className="text-[13px] text-slate-500 dark:text-slate-400 transition-colors">Keep transferred status</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Info Notice */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-3 transition-colors">
                    <div className="flex gap-2">
                        <RefreshCw className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                        <div className="text-[13px]">
                            <p className="text-blue-900 dark:text-blue-200 transition-colors">
                                All {selectedArchivedStudents.length} records will be restored with status: <strong className="dark:text-blue-100">{bulkRestoreStatus}</strong>
                            </p>
                        </div>
                    </div>
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
                    onClick={onConfirm}
                    className="font-bold bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white transition-colors"
                >
                    <RefreshCw className="size-4 mr-2" />
                    Restore {selectedArchivedStudents.length} Student(s)
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
