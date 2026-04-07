import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Users } from 'lucide-react';
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
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl transition-colors duration-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
                        <Users className="size-5 text-indigo-600 dark:text-indigo-400 transition-colors" />
                        Create Assessments
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                        Select students to generate drafts for. The system automatically detects their next phase.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">Eligible Students</span>
                        <Button variant="ghost" size="sm" onClick={handleSelectAllEligible} className="h-8 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-bold transition-colors">
                            Select All
                        </Button>
                    </div>

                    {/* Scrollable List of Checkboxes */}
                    <ScrollArea className="h-[250px] pr-4 rounded-md">
                        <div className="space-y-2 pb-2">
                            {studentListWithPhases.map((student) => (
                                <div
                                    key={student.id}
                                    onClick={() => {
                                        if (!student.isLocked) {
                                            handleToggleSelect(student.id);
                                        }
                                    }}
                                    className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-200 ${
                                        student.isLocked
                                            ? 'cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-100 dark:border-slate-800 opacity-60'
                                            : selectedIds.has(student.id)
                                              ? 'cursor-pointer border-indigo-300 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm'
                                              : 'cursor-pointer border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-zinc-900'
                                    }`}
                                >
                                    <div className="flex w-full items-center gap-3">
                                        <Checkbox
                                            checked={selectedIds.has(student.id)}
                                            disabled={student.isLocked}
                                            onCheckedChange={() => handleToggleSelect(student.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-600 dark:data-[state=checked]:border-indigo-500 transition-colors"
                                        />
                                        <div className="flex-1 select-none">
                                            <p className="mb-0.5 text-[15px] leading-none font-bold text-slate-900 dark:text-white transition-colors">
                                                {student.name} <span className="text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">({student.age}y)</span>
                                            </p>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">{student.statusLabel || `Ready for: ${student.nextPhase}`}</p>
                                        </div>
                                    </div>

                                    {/* Small icon if they have a previous warning */}
                                    {!student.isLocked && student.alert && (
                                        <span title="Has previous warnings" className="ml-2 flex items-center shrink-0">
                                            <AlertTriangle className="size-4 text-amber-500 dark:text-amber-400 transition-colors" />
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Show a summary if any selected students have warnings */}
                    {activeWarnings.length > 0 && (
                        <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 p-3.5 text-sm text-amber-800 dark:text-amber-400 shadow-sm transition-colors">
                            <p className="mb-1 flex items-center gap-2 font-bold">
                                <AlertTriangle className="size-4" /> Heads up!
                            </p>
                            <p className="font-medium text-amber-700/90 dark:text-amber-400/80 leading-relaxed">
                                <strong className="text-amber-900 dark:text-amber-300">{activeWarnings.length}</strong> selected student(s) have previous flags that need monitoring during this evaluation.
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-2 border-t border-slate-100 dark:border-slate-800 pt-4 transition-colors">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto font-bold h-11 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting || selectedIds.size === 0} className="w-full sm:w-auto font-bold h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-sm transition-colors">
                        {isSubmitting ? 'Generating...' : `Generate ${selectedIds.size} Draft${selectedIds.size === 1 ? '' : 's'}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
