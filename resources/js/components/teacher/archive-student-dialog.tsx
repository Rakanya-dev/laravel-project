import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Student } from '@/pages/teacher/my-students';
import { Collapsible, CollapsibleContent } from '@radix-ui/react-collapsible';
import { Archive, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ArchiveStudentDialogProps {
    student: Student | null;
    selectedStudents?: Student[]; // For bulk mode
    archiveStatus: string;
    onArchiveStatusChange: (value: any) => void;
    archiveReason: string;
    onArchiveReasonChange: (value: string) => void;
    onConfirm: (individualStatuses?: Record<number, string>) => void;
    onCancel: () => void;

    // --- FIX: New Props for Bulk Mode ---
    isBulk?: boolean;
    // ------------------------------------
}

export function ArchiveStudentDialog({
    student,
    selectedStudents = [],
    archiveStatus,
    onArchiveStatusChange,
    archiveReason,
    onArchiveReasonChange,
    onConfirm,
    onCancel,
    isBulk = false,
}: ArchiveStudentDialogProps) {
    // If single mode and no student is selected, don't render content
    const [isListOpen, setIsListOpen] = useState(false);
    // Map of student ID to their specific status
    const [studentStatuses, setStudentStatuses] = useState<Record<number, string>>({});

    // Initialize statuses when dialog opens or global status changes
    useEffect(() => {
        if (isBulk && selectedStudents.length > 0) {
            const newStatuses: Record<number, string> = {};
            selectedStudents.forEach((s) => {
                // --- FIX: Remove 'Graduated' fallback. Use empty string if no status. ---
                newStatuses[s.id] = studentStatuses[s.id] || archiveStatus || '';
                // -----------------------------------------------------------------------
            });
            setStudentStatuses(newStatuses);
        }
    }, [selectedStudents, isBulk, archiveStatus]);

    // When global status changes, update all (override)
    const handleGlobalStatusChange = (val: string) => {
        onArchiveStatusChange(val);
        if (isBulk) {
            const newStatuses: Record<number, string> = {};
            selectedStudents.forEach((s) => {
                newStatuses[s.id] = val;
            });
            setStudentStatuses(newStatuses);
        }
    };

    const handleIndividualStatusChange = (id: number, val: string) => {
        setStudentStatuses((prev) => ({
            ...prev,
            [id]: val,
        }));
    };

    const handleConfirm = () => {
        if (isBulk) {
            onConfirm(studentStatuses);
        } else {
            onConfirm();
        }
    };

    // Check if confirm should be disabled (if any student has no status)
    const isConfirmDisabled = isBulk
        ? Object.values(studentStatuses).some((s) => !s) // Disable if any value is empty string
        : !archiveStatus;

    if (!isBulk && !student) return null;

    const count = isBulk ? selectedStudents.length : 1;
    return (
        <DialogContent className="max-w-[550px]">
            <DialogHeader>
                <DialogTitle>{isBulk ? 'Bulk Archive Students' : 'Archive Student'}</DialogTitle>
                <DialogDescription>
                    {isBulk
                        ? `Update status for ${count} selected students and move them to the archive.`
                        : "Update the student's status and move them to the archive."}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {/* Bulk Mode Summary & Toggle */}
                {isBulk && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-2">
                                    <Users className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Archiving {count} Students</p>
                                    <p className="text-xs text-blue-700">All selected records will be updated.</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsListOpen(!isListOpen)}
                                className="h-8 text-blue-700 hover:bg-blue-100 hover:text-blue-900"
                            >
                                {isListOpen ? 'Hide List' : 'Review List'}
                                {isListOpen ? <ChevronUp className="ml-2 size-4" /> : <ChevronDown className="ml-2 size-4" />}
                            </Button>
                        </div>

                        <Collapsible open={isListOpen}>
                            <CollapsibleContent>
                                <div className="h-[200px] overflow-y-auto rounded-md border border-gray-200 bg-gray-50/50 p-2">
                                    <div className="space-y-2">
                                        {selectedStudents.map((s) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between rounded border border-gray-100 bg-white p-2 text-sm shadow-sm"
                                            >
                                                <span className="max-w-[180px] truncate font-medium text-gray-700">
                                                    {s.firstName} {s.lastName}
                                                </span>
                                                {/* --- FIX: Individual Select handles empty value --- */}
                                                <Select
                                                    value={studentStatuses[s.id] || ''}
                                                    onValueChange={(val) => handleIndividualStatusChange(s.id, val)}
                                                >
                                                    <SelectTrigger className="h-7 w-[130px] text-xs">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Graduated">Graduated</SelectItem>
                                                        <SelectItem value="Transferred">Transferred</SelectItem>
                                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {/* ----------------------------------------------- */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                )}

                {/* Single Mode Summary */}
                {!isBulk && student && (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <p className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">Current Age: {student.age} years old</p>
                    </div>
                )}

                {/* Global Status Selection */}
                <div className="space-y-2">
                    <Label>
                        {isBulk ? 'Set Status for All' : 'Reason for Archiving'} <span className="text-red-500">*</span>
                    </Label>

                    {/* --- FIX: Global Select handles empty value --- */}
                    <Select value={archiveStatus || ''} onValueChange={handleGlobalStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Graduated">
                                <div className="flex items-center gap-2">
                                    <Badge className="border-0 bg-purple-100 text-purple-700 hover:bg-purple-100">Graduated</Badge>
                                    <span className="text-xs text-gray-500">Completed program</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Transferred">
                                <div className="flex items-center gap-2">
                                    <Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">Transferred</Badge>
                                    <span className="text-xs text-gray-500">Moved to another school</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="Inactive">
                                <div className="flex items-center gap-2">
                                    <Badge className="border-0 bg-gray-100 text-gray-700 hover:bg-gray-100">Inactive</Badge>
                                    <span className="text-xs text-gray-500">Stopped attending</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {/* ------------------------------------------- */}

                    {isBulk && <p className="text-[10px] text-gray-500">* Changing this will reset any individual selections below.</p>}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label>Additional Notes (Optional)</Label>
                    <Input
                        value={archiveReason}
                        onChange={(e) => onArchiveReasonChange(e.target.value)}
                        placeholder={isBulk ? 'Notes for all selected students...' : 'e.g., Moving to elementary school...'}
                    />
                </div>

                <div className="flex gap-2 rounded-md border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                    <Archive className="mt-0.5 size-4 shrink-0" />
                    <p>
                        This action will remove {isBulk ? 'these students' : 'the student'} from your active list. You can view them later in the
                        "Archived" section.
                    </p>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    // --- FIX: Disable if validation fails ---
                    disabled={isConfirmDisabled}
                    className="gap-2 bg-black text-white hover:bg-gray-800"
                >
                    <Archive className="size-4" />
                    {isBulk ? `Archive ${count} Students` : 'Confirm Archive'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
