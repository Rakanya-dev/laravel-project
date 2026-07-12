import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useForm } from '@inertiajs/react';
import { Download, FileUp, Loader2, AlertCircle, FileSpreadsheet, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImportStudentsDialogProps {
    onClose: () => void;
    currentDaycare: string;
    sections: { id: number; name: string }[];
}

export function ImportStudentsDialog({ onClose, currentDaycare, sections }: ImportStudentsDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.file) {
            toast.error('Please select a CSV file first.');
            return;
        }

        post('/teacher/students/import', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Students imported successfully!');
                reset();
                onClose();
            },
            onError: () => toast.error('Failed to import students. Please check your file format.'),
        });
    };

    return (
        <DialogContent hideClose className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col max-h-[90vh]">

            {/* --- PREMIUM HEADER --- */}
            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors shrink-0">
                <DialogHeader className="text-left">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                            <FileSpreadsheet className="size-6" strokeWidth={2.5} />
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Import Class Roster
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                        Quickly add multiple students to <strong className="text-slate-900 dark:text-white">{currentDaycare}</strong> by uploading a CSV file.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <form onSubmit={submit} className="flex flex-col flex-1 overflow-hidden">
                {/* --- SCROLLABLE BODY --- */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

                    {/* Step 1: Download Template */}
                    <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-500/10 p-5 sm:p-6 shadow-sm transition-colors">
                        <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-indigo-800 dark:text-indigo-400 transition-colors">
                            Step 1: Download the Template
                        </h4>
                        <p className="mb-5 text-base font-medium text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed transition-colors">
                            Use our formatted template. Under the <strong className="text-indigo-900 dark:text-indigo-100 font-black">Session Name</strong> column, you must type one of the following exact session names:
                        </p>

                        <div className="flex flex-wrap gap-2.5 mb-6">
                            {sections && sections.length > 0 ? (
                                sections.map(sec => (
                                    <Badge key={sec.id} variant="outline" className="bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 text-[11px] uppercase tracking-widest font-bold shadow-sm transition-colors">
                                        {sec.name}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-[11px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400 flex items-center bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 transition-colors">
                                    <AlertCircle className="size-4 mr-2 shrink-0" /> No sessions found. Create a session first.
                                </span>
                            )}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 w-full rounded-xl bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-base font-bold shadow-sm transition-colors"
                            onClick={() => window.location.href = '/teacher/students/import-template'}
                        >
                            <Download className="mr-2 size-5" /> Download Blank CSV Template
                        </Button>
                    </div>

                    {/* Step 2: Upload File */}
                    <div className="space-y-2.5">
                        <Label htmlFor="file" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block transition-colors">
                            Step 2: Upload Completed File <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".csv"
                            className="cursor-pointer h-14 text-base rounded-xl font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/20 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/30 pt-2.5"
                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                            disabled={processing}
                        />
                        {errors.file && <p className="text-sm font-bold text-red-500 dark:text-red-400 mt-2 transition-colors">{errors.file}</p>}
                    </div>

                </div>

                {/* --- PREMIUM FOOTER --- */}
                <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={processing}
                        className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="mr-2 size-5" /> Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing || !data.file}
                        className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors"
                    >
                        {processing ? (
                            <><Loader2 className="mr-2 size-5 animate-spin" /> Importing...</>
                        ) : (
                            <><FileUp className="mr-2 size-5" /> Upload & Import</>
                        )}
                    </Button>
                </DialogFooter>
            </form>

        </DialogContent>
    );
}
