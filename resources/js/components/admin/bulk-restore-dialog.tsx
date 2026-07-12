import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, X } from 'lucide-react';
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
        <DialogContent hideClose className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200">

            {/* Header - Synced with premium modal layouts */}
            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <DialogHeader className="text-left">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                            <RefreshCw className="size-6" strokeWidth={2.5} />
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Bulk Restore Records
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                        Set the status for <strong className="text-slate-700 dark:text-slate-300">{selectedArchivedStudents.length}</strong> selected student(s) when restoring them from the archive.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

                {/* Selected Students Preview */}
                <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/10 p-5 border border-emerald-100 dark:border-emerald-500/20 shadow-sm transition-colors">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">
                        Selected Students ({selectedArchivedStudents.length})
                    </Label>
                    <div className="mt-3 max-h-[140px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                        {selectedArchivedStudents.map(student => (
                            <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-500/30 shadow-sm transition-colors">
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate pr-4">
                                    {`${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim()}
                                </span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                    Archived: {student.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2.5">
                    <Label htmlFor="bulkRestoreStatus" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Restore All As <span className="text-red-500">*</span>
                    </Label>
                    <Select value={bulkRestoreStatus} onValueChange={(value: any) => onRestoreStatusChange(value)}>
                        <SelectTrigger id="bulkRestoreStatus" className="h-12 text-base rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-slate-200 transition-colors shadow-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                            <SelectItem value="Active" className="rounded-lg py-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50 uppercase tracking-widest text-[11px] font-bold px-2.5 py-0.5 shadow-none transition-colors">Active</Badge>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Currently enrolled</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Inactive" className="rounded-lg py-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:border-slate-700 uppercase tracking-widest text-[11px] font-bold px-2.5 py-0.5 shadow-none transition-colors">Inactive</Badge>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Temporarily not attending</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Graduated" className="rounded-lg py-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-900/50 uppercase tracking-widest text-[11px] font-bold px-2.5 py-0.5 shadow-none transition-colors">Graduated</Badge>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Keep graduated status</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Transferred" className="rounded-lg py-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900/50 uppercase tracking-widest text-[11px] font-bold px-2.5 py-0.5 shadow-none transition-colors">Transferred</Badge>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Keep transferred status</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Info Notice */}
                <div className="flex items-start gap-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 p-5 sm:p-6 border border-blue-200 dark:border-blue-900/50 shadow-sm transition-colors">
                    <RefreshCw className="size-6 shrink-0 text-blue-500 dark:text-blue-400" />
                    <div className="font-medium text-blue-800 dark:text-blue-300">
                        <p className="font-extrabold uppercase tracking-widest text-[11px] mb-1.5">Action Confirmation</p>
                        <p className="text-base leading-relaxed">
                            All <strong className="font-black text-blue-900 dark:text-blue-100">{selectedArchivedStudents.length}</strong> selected records will be restored to the active roster with the status <strong className="font-black text-blue-900 dark:text-blue-100">{bulkRestoreStatus}</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                <Button variant="ghost" onClick={onCancel} className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X className="mr-2 size-5" /> Cancel
                </Button>
                <Button onClick={onConfirm} className="h-12 w-full sm:w-auto px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-base font-bold shadow-sm transition-colors">
                    <RefreshCw className="mr-2 size-5" />
                    Restore {selectedArchivedStudents.length} Student{selectedArchivedStudents.length !== 1 ? 's' : ''}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
