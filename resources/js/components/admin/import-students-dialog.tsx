import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, AlertCircle } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export function ImportStudentsDialog({ onClose }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    const [dragActive, setDragActive] = useState(false);

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
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Bulk Import Students</DialogTitle>
                <DialogDescription>
                    Upload a CSV file to add multiple students at once.
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-6 py-4">

                {/* Step 1: Download Template */}
                <div className="rounded-md bg-blue-50 p-4 border border-blue-100 flex items-center justify-between">
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold">Need the format?</p>
                        <p>Download the CSV template to get started.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} className="gap-2 bg-white text-blue-700 hover:text-blue-800">
                        <Download className="h-4 w-4" /> Template
                    </Button>
                </div>

                {/* Step 2: Upload File */}
                <div className="space-y-2">
                    <Label htmlFor="file">Select CSV File</Label>
                    <Input
                        id="file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                        className="cursor-pointer"
                    />
                    {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
                </div>

                {/* Warning/Tip */}
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
                    <p>
                        Ensure dates are strictly in <strong>YYYY-MM-DD</strong> format. <br/>
                        Daycare names must match exactly what is in the system.
                    </p>
                </div>

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={processing || !data.file} className="bg-black text-white gap-2">
                        <Upload className="h-4 w-4" />
                        {processing ? 'Importing...' : 'Start Import'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
