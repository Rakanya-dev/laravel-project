import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Archive, X } from 'lucide-react';
import type { Student } from '@/pages/admin/student-management';

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
        <DialogContent hideClose className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200">

            {/* Header - Synced with premium modal layouts */}
            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <DialogHeader className="text-left">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                            <Archive className="size-6" strokeWidth={2.5} />
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Bulk Archive Records
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                        Set the status for <strong className="text-slate-700 dark:text-slate-300">{selectedStudents.length}</strong> selected student(s) before moving them to the archive.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

                {/* Selected Students Preview */}
                <div className="rounded-2xl bg-blue-50/50 dark:bg-blue-500/10 p-5 border border-blue-100 dark:border-blue-500/20 shadow-sm transition-colors">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-blue-800 dark:text-blue-400">
                        Selected Students ({selectedStudents.length})
                    </Label>
                    <div className="mt-3 max-h-[140px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
                        {selectedStudents.map(student => (
                            <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-500/30 shadow-sm transition-colors">
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate pr-4">
                                    {`${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim()}
                                </span>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                                    Current: {student.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2.5">
                    <Label htmlFor="bulkArchiveStatus" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Apply Status to All <span className="text-red-500">*</span>
                    </Label>
                    <Select value={bulkArchiveStatus} onValueChange={(value: any) => onArchiveStatusChange(value)}>
                        <SelectTrigger id="bulkArchiveStatus" className="h-12 text-base rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-slate-200 transition-colors shadow-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                            <SelectItem value="Graduated" className="rounded-lg py-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-900/50 uppercase tracking-widest text-[11px] font-bold px-2.5 py-0.5 shadow-none transition-colors">Graduated</Badge>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Completed the program</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Transferred" className="rounded-lg py-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-900/50 uppercase tracking-widest text-[11px] font-bold px-2.5 py-0.5 shadow-none transition-colors">Transferred</Badge>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Moved to another facility</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Inactive" className="rounded-lg py-3 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:border-slate-700 uppercase tracking-widest text-[11px] font-bold px-2.5 py-0.5 shadow-none transition-colors">Inactive</Badge>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">No longer attending</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Bulk Archive Reason */}
                <div className="space-y-2.5">
                    <Label htmlFor="bulkArchiveReason" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Archive Notes (Optional)
                    </Label>
                    <Input
                        id="bulkArchiveReason"
                        value={bulkArchiveReason}
                        onChange={(e) => onArchiveReasonChange(e.target.value)}
                        placeholder="e.g. End of school year graduation..."
                        className="h-12 text-base rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors shadow-sm"
                    />
                </div>

                {/* Warning */}
                <div className="flex items-start gap-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-5 sm:p-6 border border-amber-200 dark:border-amber-900/50 shadow-sm transition-colors">
                    <Archive className="size-6 shrink-0 text-amber-500 dark:text-amber-400" />
                    <div className="font-medium text-amber-800 dark:text-amber-300">
                        <p className="font-extrabold uppercase tracking-widest text-[11px] mb-1.5">Action Confirmation</p>
                        <p className="text-base leading-relaxed">
                            All <strong className="font-black text-amber-900 dark:text-amber-100">{selectedStudents.length}</strong> selected records will be archived with the status <strong className="font-black text-amber-900 dark:text-amber-100">{bulkArchiveStatus}</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                <Button variant="ghost" onClick={onCancel} className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X className="mr-2 size-5" /> Cancel
                </Button>
                <Button onClick={onConfirm} className="h-12 w-full sm:w-auto px-8 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-base font-bold shadow-sm transition-colors">
                    <Archive className="mr-2 size-5" />
                    Archive {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
