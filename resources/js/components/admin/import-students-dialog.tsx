import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, AlertCircle, FileSpreadsheet, X } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export function ImportStudentsDialog({ onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.students.bulk-import'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    // CSV Template Data
    const downloadTemplate = () => {
        const csvContent = "First Name,Middle Name,Last Name,Date of Birth (YYYY-MM-DD),Gender,Daycare Name\nJuan,Santos,Dela Cruz,2019-05-20,Male,Sto. Nino Child Development Center";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "student_import_template.csv";
        link.click();
    };

    return (
        <DialogContent hideClose className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200">

            {/* Header - Synced with premium modal layouts */}
            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <DialogHeader className="text-left">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                            <FileSpreadsheet className="size-6" strokeWidth={2.5} />
                        </div>
                        <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Bulk Import
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                        Upload a CSV file to add multiple students at once.
                    </DialogDescription>
                </DialogHeader>
            </div>

            <form onSubmit={submit} className="flex flex-col h-full">
                <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

                    {/* Step 1: Download Template */}
                    <div className="rounded-2xl bg-blue-50 dark:bg-blue-500/10 p-5 sm:p-6 border border-blue-100 dark:border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors shadow-sm">
                        <div className="text-blue-800 dark:text-blue-300">
                            <p className="font-extrabold uppercase tracking-widest text-[11px] mb-1.5">CSV Format Required</p>
                            <p className="font-medium text-base leading-relaxed">Download the exact template structure to get started.</p>
                        </div>
                        <Button type="button" variant="outline" onClick={downloadTemplate} className="h-12 px-6 w-full sm:w-auto rounded-xl font-bold bg-white dark:bg-zinc-900 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-zinc-800 transition-colors shadow-sm shrink-0">
                            <Download className="mr-2 size-5" /> Template
                        </Button>
                    </div>

                    {/* Step 2: Upload File */}
                    <div className="space-y-2.5">
                        <Label htmlFor="file" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Select CSV File <span className="text-red-500">*</span></Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".csv"
                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                            className="cursor-pointer h-14 text-base rounded-xl font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-500/20 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-500/30 pt-2.5"
                        />
                        {errors.file && <p className="text-sm font-bold text-red-500 dark:text-red-400 mt-2">{errors.file}</p>}
                    </div>

                    {/* Warning/Tip */}
                    <div className="flex items-start gap-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 p-5 sm:p-6 border border-amber-200 dark:border-amber-900/50 shadow-sm transition-colors">
                        <AlertCircle className="size-6 shrink-0 text-amber-500 dark:text-amber-400" />
                        <div className="font-medium text-amber-800 dark:text-amber-300">
                            <p className="font-extrabold uppercase tracking-widest text-[11px] mb-1.5">Import Rules</p>
                            <p className="text-base leading-relaxed">Dates must be strictly formatted as <strong className="font-black">YYYY-MM-DD</strong>.</p>
                            <p className="text-base leading-relaxed mt-1">Daycare names must perfectly match existing centers in the system.</p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                    <Button type="button" variant="ghost" className="h-12 w-full sm:w-auto px-6 text-base font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors" onClick={onClose}>
                        <X className="mr-2 size-5" /> Cancel
                    </Button>
                    <Button type="submit" disabled={processing || !data.file} className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors">
                        <Upload className="mr-2 size-5" /> {processing ? 'Importing...' : 'Start Import'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
