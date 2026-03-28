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
                // Inherit the disabled state from parent (protects against duplicate drafts!)
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="size-5 text-blue-600" />
                        Create Assessments
                    </DialogTitle>
                    <DialogDescription>Select students to generate drafts for. The system automatically detects their next phase.</DialogDescription>
                </DialogHeader>
                <div className="py-2">
                    <div className="mb-2 flex items-center justify-between border-b pb-2">
                        <span className="text-sm font-semibold text-slate-700">Eligible Students</span>
                        <Button variant="ghost" size="sm" onClick={handleSelectAllEligible} className="h-8 text-blue-600">
                            Select All
                        </Button>
                    </div>

                    {/* Scrollable List of Checkboxes */}
                    <ScrollArea className="h-[250px] pr-4">
                        <div className="space-y-2">
                            {studentListWithPhases.map((student) => (
                                <div
                                    key={student.id}
                                    // 👇 1. ADD ONCLICK TO THE ENTIRE ROW
                                    onClick={() => {
                                        if (!student.isLocked) {
                                            handleToggleSelect(student.id);
                                        }
                                    }}
                                    // 👇 2. ADD CURSOR-POINTER AND BETTER PADDING
                                    className={`flex items-center justify-between rounded-md border p-3 transition-all ${
                                        student.isLocked
                                            ? 'cursor-not-allowed bg-slate-50 opacity-60'
                                            : selectedIds.has(student.id)
                                              ? 'cursor-pointer border-blue-300 bg-blue-50 shadow-sm'
                                              : 'cursor-pointer border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex w-full items-center gap-3">
                                        <Checkbox
                                            checked={selectedIds.has(student.id)}
                                            disabled={student.isLocked}
                                            onCheckedChange={() => handleToggleSelect(student.id)}
                                            // 👇 3. STOP DOUBLE-CLICKS
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1 select-none">
                                            <p className="mb-1 text-sm leading-none font-medium text-slate-900">
                                                {student.name} <span className="text-xs font-normal text-slate-500">({student.age}y)</span>
                                            </p>
                                            <p className="text-xs text-slate-500">{student.statusLabel || `Ready for: ${student.nextPhase}`}</p>
                                        </div>
                                    </div>

                                    {/* Small icon if they have a previous warning */}
                                    {!student.isLocked && student.alert && (
                                        <span title="Has previous warnings" className="ml-2 flex items-center">
                                            <AlertTriangle className="size-4 text-amber-500" />
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Show a summary if any selected students have warnings */}
                    {activeWarnings.length > 0 && (
                        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            <p className="mb-1 flex items-center gap-2 font-bold">
                                <AlertTriangle className="size-4" /> Heads up!
                            </p>
                            <p>
                                <strong>{activeWarnings.length}</strong> selected student(s) have previous flags that need monitoring during this
                                evaluation.
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting || selectedIds.size === 0} className="bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? 'Generating...' : `Generate ${selectedIds.size} Draft(s)`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
