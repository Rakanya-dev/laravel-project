import { Button } from '@/components/ui/button';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useForm } from '@inertiajs/react';
import { Download, FileUp, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImportStudentsDialogProps {
    onClose: () => void;
    currentDaycare: string;
    sections: { id: number; name: string }[]; // 👈 NEW: Pass the sections here!
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
        <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
                <DialogTitle>Import Class Roster</DialogTitle>
                <DialogDescription>
                    Quickly add multiple students to <strong>{currentDaycare}</strong> by uploading a CSV file.
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-6 pt-4">
                {/* Step 1: Download Template */}
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-blue-900">Step 1: Download the Template</h4>
                    <p className="mb-3 text-sm text-blue-800/80">
                        Use our formatted template. Under the <strong>Session Name</strong> column, you must type one of the following exact session names:
                    </p>

                    {/* 👇 Shows the exact names they need to type in Excel */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {sections && sections.length > 0 ? (
                            sections.map(sec => (
                                <Badge key={sec.id} variant="secondary" className="bg-white border-blue-200 text-blue-700">
                                    {sec.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-red-500 flex items-center"><AlertCircle className="size-3 mr-1"/> No sessions found. Create a session first.</span>
                        )}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        onClick={() => window.location.href = '/teacher/students/import-template'}
                    >
                        <Download className="mr-2 size-4" /> Download Blank CSV Template
                    </Button>
                </div>

                {/* Step 2: Upload File */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900">Step 2: Upload Completed File</h4>
                    <Label htmlFor="file" className="sr-only">Choose File</Label>
                    <Input
                        id="file"
                        type="file"
                        accept=".csv"
                        className="cursor-pointer file:text-blue-600"
                        onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                        disabled={processing}
                    />
                    {errors.file && <p className="text-sm text-red-600">{errors.file}</p>}
                </div>

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={processing || !data.file}>
                        {processing ? (
                            <><Loader2 className="mr-2 size-4 animate-spin" /> Importing...</>
                        ) : (
                            <><FileUp className="mr-2 size-4" /> Upload & Import</>
                        )}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
