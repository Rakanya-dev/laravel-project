import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, Info, Users, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface StudentForDropdown {
    id: number;
    name: string;
    age: number;
    isDisabled?: boolean;
}

interface NewAssessmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    students: StudentForDropdown[];
    onSave: (studentId: string, assessmentType: string) => void;
    isSubmitting: boolean;
}

export function NewAssessmentDialog({ open, onOpenChange, students, onSave, isSubmitting }: NewAssessmentDialogProps) {
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [assessmentType, setAssessmentType] = useState<string>('regular');

    const handleCreate = async () => {
        if (!selectedStudent) {
            toast.error('Please select a student');
            return;
        }
        onSave(selectedStudent, assessmentType);
    };

    const handleCancel = () => {
        setSelectedStudent('');
        setAssessmentType('regular');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[600px] [&>button]:hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>Create New Assessment</DialogTitle>
                </DialogHeader>

                <div className="relative bg-slate-900 p-6 pb-8 text-white">
                    <button onClick={handleCancel} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <X className="size-5" />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                            <FileText className="size-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="mb-1 text-2xl font-semibold text-white">Create New Assessment</h2>
                            <p className="text-sm text-gray-300">Select a student and create a new developmental assessment</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 bg-gray-50 px-6 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="student" className="flex items-center gap-2 text-sm text-gray-700">
                            <Users className="size-4 text-blue-600" />
                            Select Student
                        </Label>
                        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                            <SelectTrigger id="student" className="h-11 border-gray-300 bg-white">
                                <SelectValue placeholder="Choose a student..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {students.map((student) => (
                                    <SelectItem
                                        key={student.id}
                                        value={student.id.toString()}
                                        // --- FIX: Disable the item based on prop ---
                                        disabled={student.isDisabled}
                                        className="cursor-pointer py-2"
                                    >
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className={student.isDisabled ? 'text-gray-400' : 'font-medium'}>{student.name}</span>
                                                {/* --- FIX: Visual feedback for why it's disabled --- */}
                                                {student.isDisabled && (
                                                    <span className="flex items-center gap-1 rounded border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 uppercase">
                                                        In Progress
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400">({student.age} years)</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type" className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="size-4 text-blue-600" />
                            Assessment Type
                        </Label>
                        <Select value={assessmentType} onValueChange={setAssessmentType}>
                            <SelectTrigger id="type" className="h-11 border-gray-300 bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="regular">Regular Assessment</SelectItem>
                                <SelectItem value="followup">Follow-up Assessment</SelectItem>
                                <SelectItem value="initial">Initial Assessment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                        <Info className="mt-0.5 size-5 shrink-0 text-blue-500" />
                        <p className="text-sm text-blue-700">
                            A draft assessment will be created. You can fill in the domain scores and complete it later.
                        </p>
                    </div>
                </div>

                <DialogFooter className="border-t border-gray-100 bg-white px-6 py-4">
                    <div className="flex w-full justify-end gap-3">
                        <Button variant="outline" onClick={handleCancel} disabled={isSubmitting} className="h-10">
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isSubmitting} className="h-10 bg-blue-600 text-white hover:bg-blue-700">
                            {isSubmitting ? 'Creating...' : 'Create Assessment'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
