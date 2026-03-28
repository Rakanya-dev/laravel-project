import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, FileText, User } from 'lucide-react';

interface StudentHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    historyData: any | null;
    onAssessmentClick: (assessment: any) => void;
    onCreateNew: () => void;
}

export function StudentHistoryDialog({ open, onOpenChange, historyData, onAssessmentClick, onCreateNew }: StudentHistoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <User className="h-5 w-5 text-blue-600" />
                        {historyData?.childName}'s Assessments
                    </DialogTitle>
                    <DialogDescription>Select an evaluation below to view scores or continue grading.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="mt-2 h-[400px] pr-4">
                    {historyData?.assessments && historyData.assessments.length > 0 ? (
                        <div className="space-y-3">
                            {historyData.assessments.map((assessment: any) => (
                                <div
                                    key={assessment.id}
                                    onClick={() => onAssessmentClick(assessment)}
                                    className="group flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-blue-200 hover:bg-blue-50"
                                >
                                    <div className="flex w-full items-start gap-3">
                                        <div className="rounded-md bg-blue-100 p-2 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="w-full">
                                            <div className="flex items-start justify-between">
                                                <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                                                    {assessment.type}
                                                    {assessment.category && (
                                                        <span className="rounded-full border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 uppercase">
                                                            {assessment.category}
                                                        </span>
                                                    )}
                                                </h4>
                                                <Badge
                                                    className={`${
                                                        assessment.status === 'Completed'
                                                            ? 'bg-green-500'
                                                            : assessment.status === 'In Progress'
                                                              ? 'bg-blue-500'
                                                              : 'bg-slate-400'
                                                    }`}
                                                >
                                                    {assessment.status}
                                                </Badge>
                                            </div>
                                            <div className="mt-2 w-full">
                                                {assessment.status === 'In Progress' && (
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <Progress value={assessment.progressPercent} className="h-1.5 w-32" />
                                                        <span className="text-[10px] text-gray-500">
                                                            {assessment.filledCount}/{assessment.totalCount} completed
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {assessment.dateCreated}
                                                    </span>
                                                    <span>•</span>
                                                    <span>Score: {assessment.standardScore > 0 ? assessment.standardScore : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center text-gray-400">
                            <p>No assessments recorded for this student yet.</p>
                            <Button variant="link" className="mt-2 text-blue-600" onClick={onCreateNew}>
                                Create New Evaluation
                            </Button>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
