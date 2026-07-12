import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Calendar, FileText, User, Plus, X, ClipboardList, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            <DialogContent hideClose className="sm:max-w-[700px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col max-h-[90vh]">

                {/* --- PREMIUM HEADER --- */}
                <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors shrink-0">
                    <DialogHeader className="text-left">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                                <User className="size-6" strokeWidth={2.5} />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {historyData?.childName}'s Assessments
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                            Select an evaluation below to view scores or continue grading.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* --- SCROLLABLE BODY --- */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">
                    {historyData?.assessments && historyData.assessments.length > 0 ? (
                        <div className="space-y-4">
                            {historyData.assessments.map((assessment: any) => (
                                <button
                                    key={assessment.id}
                                    onClick={() => onAssessmentClick(assessment)}
                                    className="group w-full flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:-translate-y-0.5 text-left"
                                >
                                    <div className="flex w-full items-start gap-4 sm:gap-5">
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-105 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20">
                                            <FileText className="size-6" strokeWidth={2.5} />
                                        </div>
                                        <div className="flex-1 min-w-0 mt-0.5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2">
                                                <h4 className="flex items-center gap-3 text-lg font-black text-slate-900 dark:text-white truncate transition-colors">
                                                    {assessment.type}
                                                    {assessment.category && (
                                                        <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0 transition-colors shadow-none">
                                                            {assessment.category}
                                                        </span>
                                                    )}
                                                </h4>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "px-2.5 py-0.5 text-[11px] uppercase tracking-widest font-bold shadow-none shrink-0 transition-colors w-fit border",
                                                        assessment.status === 'Completed'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50'
                                                            : assessment.status === 'In Progress'
                                                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/50'
                                                              : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-slate-700'
                                                    )}
                                                >
                                                    {assessment.status}
                                                </Badge>
                                            </div>

                                            <div className="mt-3 w-full">
                                                {assessment.status === 'In Progress' && (
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <Progress value={assessment.progressPercent} className="h-2.5 w-32 bg-slate-100 dark:bg-slate-800" />
                                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                                            {assessment.filledCount}/{assessment.totalCount} Done
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="size-4" /> {assessment.dateCreated}
                                                    </span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="text-indigo-600 dark:text-indigo-400">Score: <strong className="font-black text-indigo-700 dark:text-indigo-300">{assessment.standardScore > 0 ? assessment.standardScore : 'N/A'}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="size-6 shrink-0 text-slate-300 dark:text-slate-600 ml-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-500 dark:group-hover:text-slate-400" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm text-center transition-colors">
                            <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                                <ClipboardList className="size-10 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No Assessments Found</h3>
                            <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">This student has not been evaluated yet.</p>
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
                        <X className="mr-2 size-5" /> Close
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            onCreateNew();
                        }}
                        className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors"
                    >
                        <Plus className="mr-2 size-5" /> New Evaluation
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
