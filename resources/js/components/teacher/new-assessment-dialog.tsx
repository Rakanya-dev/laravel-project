import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export interface FlexibleAssessmentHistory {
    student_id?: number;
    studentId?: number;
    assessment_type?: string;
    type?: string;
    areas_for_improvement?: string | null;
    [key: string]: any;
}

interface NewAssessmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    students: { id: number; name: string; age: number; isDisabled: boolean; statusLabel?: string }[];
    domains: { id: number; name: string }[];
    assessments: FlexibleAssessmentHistory[];
    onSave: (payload: { student_id: number; assessment_type: string }[], domainIds: number[]) => void;
    isSubmitting: boolean;
}

export function NewAssessmentDialog({ open, onOpenChange, students, domains, assessments, onSave, isSubmitting }: NewAssessmentDialogProps) {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Reset selections when dialog opens
    useEffect(() => {
        if (open) setSelectedIds(new Set());
    }, [open]);

    // Calculate the individual phase for EVERY student in the list
    const studentListWithPhases = useMemo(() => {
        return students.map((student) => {
            const history = (assessments || []).filter((a) => (a.student_id || a.studentId) === student.id);
            const hasFirst = history.some((a) => (a.assessment_type || a.type) === '1st Assessment');
            const hasSecond = history.some((a) => (a.assessment_type || a.type) === '2nd Assessment');
            const hasThird = history.some((a) => (a.assessment_type || a.type) === '3rd Assessment');

            let nextPhase = '1st Assessment';
            let alert = null;
            let isComplete = false;

            if (hasFirst && hasSecond && hasThird) {
                isComplete = true;
                nextPhase = 'Completed';
            } else if (hasFirst && hasSecond) {
                nextPhase = '3rd Assessment';
                alert = history.find((a) => (a.assessment_type || a.type) === '2nd Assessment')?.areas_for_improvement;
            } else if (hasFirst) {
                nextPhase = '2nd Assessment';
                alert = history.find((a) => (a.assessment_type || a.type) === '1st Assessment')?.areas_for_improvement;
            }

            return {
                ...student,
                nextPhase,
                alert,
                isLocked: student.isDisabled || isComplete,
            };
        });
    }, [students, assessments]);

    const handleToggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSelectAllEligible = () => {
        const eligible = studentListWithPhases.filter((s) => !s.isLocked);
        if (selectedIds.size === eligible.length) {
            setSelectedIds(new Set()); // Deselect all
        } else {
            setSelectedIds(new Set(eligible.map((s) => s.id))); // Select all
        }
    };

    const handleSave = () => {
        if (selectedIds.size === 0) return;

        // Build the bulk payload matching each student to their correct next phase
        const payload = Array.from(selectedIds).map((id) => {
            const student = studentListWithPhases.find((s) => s.id === id);
            return {
                student_id: id,
                assessment_type: student!.nextPhase,
            };
        });

        const allDomainIds = domains.map((d) => d.id);
        onSave(payload, allDomainIds); // Pass array instead of single ID
    };

    // Grab warnings for currently selected students
    const activeWarnings = studentListWithPhases.filter((s) => selectedIds.has(s.id) && s.alert);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideClose className="sm:max-w-[650px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col max-h-[90vh]">

                {/* --- PREMIUM HEADER --- */}
                <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors shrink-0">
                    <DialogHeader className="text-left">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                                <Users className="size-6" strokeWidth={2.5} />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                Create Assessments
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                            Select students to generate drafts for. The system automatically detects their next phase.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* --- SCROLLABLE BODY --- */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 transition-colors">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                            Eligible Students
                        </span>
                        <Button
                            variant="ghost"
                            onClick={handleSelectAllEligible}
                            className="h-10 px-4 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-bold rounded-xl transition-colors"
                        >
                            {selectedIds.size > 0 && selectedIds.size === studentListWithPhases.filter(s => !s.isLocked).length ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>

                    {/* List */}
                    <div className="space-y-3">
                        {studentListWithPhases.map((student) => (
                            <div
                                key={student.id}
                                onClick={() => {
                                    if (!student.isLocked) {
                                        handleToggleSelect(student.id);
                                    }
                                }}
                                className={`flex items-center justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                                    student.isLocked
                                        ? 'cursor-not-allowed bg-slate-50/50 dark:bg-zinc-900/50 border-slate-100 dark:border-slate-800 opacity-60'
                                        : selectedIds.has(student.id)
                                          ? 'cursor-pointer border-indigo-300 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm'
                                          : 'cursor-pointer border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-zinc-900'
                                }`}
                            >
                                <div className="flex w-full items-center gap-4">
                                    <Checkbox
                                        checked={selectedIds.has(student.id)}
                                        disabled={student.isLocked}
                                        onCheckedChange={() => handleToggleSelect(student.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="size-5 rounded-md border-slate-300 dark:border-slate-600 data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-600 dark:data-[state=checked]:border-indigo-500 transition-colors"
                                    />
                                    <div className="flex-1 select-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                                        <p className="text-base font-bold text-slate-900 dark:text-white transition-colors truncate">
                                            {student.name} <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">({student.age}y)</span>
                                        </p>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors shrink-0 mt-0.5 sm:mt-0">
                                            {student.statusLabel || `Ready for: ${student.nextPhase}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Small icon if they have a previous warning */}
                                {!student.isLocked && student.alert && (
                                    <span title="Has previous warnings" className="ml-4 flex items-center shrink-0">
                                        <AlertTriangle className="size-5 text-amber-500 dark:text-amber-400 transition-colors" />
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Show a summary if any selected students have warnings */}
                    {activeWarnings.length > 0 && (
                        <div className="mt-8 flex items-start gap-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-5 sm:p-6 border border-amber-200 dark:border-amber-900/50 shadow-sm transition-colors animate-in fade-in slide-in-from-bottom-2">
                            <AlertTriangle className="size-6 shrink-0 text-amber-500 dark:text-amber-400" />
                            <div className="font-medium text-amber-800 dark:text-amber-300">
                                <p className="font-extrabold uppercase tracking-widest text-[11px] mb-1.5">Heads Up</p>
                                <p className="text-base leading-relaxed">
                                    <strong className="text-amber-900 dark:text-amber-100 font-black">{activeWarnings.length}</strong> selected student(s) have previous flags that need monitoring during this evaluation.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- PREMIUM FOOTER --- */}
                <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="mr-2 size-5" /> Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting || selectedIds.size === 0}
                        className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors"
                    >
                        {isSubmitting ? 'Generating...' : `Generate ${selectedIds.size} Draft${selectedIds.size === 1 ? '' : 's'}`}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
