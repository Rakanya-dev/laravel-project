import { useForm, Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, UploadCloud, ShieldCheck, FileText, UserSquare2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function LinkDocuments({ studentName }: { studentName: string }) {
    const { data, setData, post, processing, progress, errors } = useForm({
        birth_cert: null as File | null,
        parent_id_doc: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('parent.link.store'));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <AppLayout>
            <Head title="Verify Identity" />

            {/* Generous vertical padding for a modern, airy feel */}
            <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">

                {/* Header Section */}
                <div className="mb-10 text-center sm:mb-12">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 ring-8 ring-indigo-50/50">
                        <ShieldCheck className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Final Security Step
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                        We found the record for <strong className="font-semibold text-indigo-600">{studentName}</strong>!
                        To protect student privacy, please verify your relationship by uploading the required documents below.
                    </p>
                </div>

                <Card className="overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/40 sm:rounded-2xl">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-6 sm:px-10">
                        <CardTitle className="text-xl font-bold text-slate-800">
                            Secure Document Upload
                        </CardTitle>
                        <CardDescription className="mt-1.5 text-sm text-slate-500">
                            Documents are strictly encrypted and automatically deleted after Admin review. Max size: 5MB per file.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 py-8 sm:p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Input Fields Grid */}
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

                                {/* 1. Birth Certificate Field */}
                                <div className="group flex flex-col">
                                    <label className="mb-2.5 flex items-center text-sm font-semibold text-slate-700">
                                        <FileText className="mr-2 h-4 w-4 text-slate-400" />
                                        Child's Birth Certificate
                                    </label>

                                    <div className={`relative flex min-h-[12rem] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${
                                        data.birth_cert
                                            ? 'border-emerald-500 bg-emerald-50/50 hover:border-emerald-600 hover:bg-emerald-50'
                                            : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                                    }`}>
                                        {data.birth_cert ? (
                                            <div className="flex flex-col items-center space-y-2">
                                                <div className="rounded-full bg-emerald-100 p-3">
                                                    <FileCheck className="h-8 w-8 text-emerald-600" />
                                                </div>
                                                <span className="w-48 truncate px-2 text-sm font-bold text-emerald-800 sm:w-64">{data.birth_cert.name}</span>
                                                <span className="text-xs font-medium text-emerald-600/80">{formatFileSize(data.birth_cert.size)}</span>
                                                <span className="mt-2 text-xs font-semibold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">Click to change file</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-2">
                                                <div className="rounded-full bg-indigo-100/50 p-3 text-indigo-500 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                                                    <UploadCloud className="h-8 w-8" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">Click or drag to upload</span>
                                                <span className="text-xs font-medium text-slate-500">PDF, JPG, or PNG</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            required={!data.birth_cert}
                                            accept=".pdf,image/jpeg,image/png,image/jpg"
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            onChange={(e) => setData('birth_cert', e.target.files ? e.target.files[0] : null)}
                                        />
                                    </div>
                                    {errors.birth_cert && <p className="mt-2.5 text-sm font-medium text-red-500">{errors.birth_cert}</p>}
                                </div>

                                {/* 2. Parent ID Field */}
                                <div className="group flex flex-col">
                                    <label className="mb-2.5 flex items-center text-sm font-semibold text-slate-700">
                                        <UserSquare2 className="mr-2 h-4 w-4 text-slate-400" />
                                        Valid Parent/Guardian ID
                                    </label>

                                    <div className={`relative flex min-h-[12rem] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 ${
                                        data.parent_id_doc
                                            ? 'border-emerald-500 bg-emerald-50/50 hover:border-emerald-600 hover:bg-emerald-50'
                                            : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                                    }`}>
                                        {data.parent_id_doc ? (
                                            <div className="flex flex-col items-center space-y-2">
                                                <div className="rounded-full bg-emerald-100 p-3">
                                                    <FileCheck className="h-8 w-8 text-emerald-600" />
                                                </div>
                                                <span className="w-48 truncate px-2 text-sm font-bold text-emerald-800 sm:w-64">{data.parent_id_doc.name}</span>
                                                <span className="text-xs font-medium text-emerald-600/80">{formatFileSize(data.parent_id_doc.size)}</span>
                                                <span className="mt-2 text-xs font-semibold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">Click to change file</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-2">
                                                <div className="rounded-full bg-indigo-100/50 p-3 text-indigo-500 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600">
                                                    <UploadCloud className="h-8 w-8" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">Click or drag to upload</span>
                                                <span className="text-xs font-medium text-slate-500">PDF, JPG, or PNG</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            required={!data.parent_id_doc}
                                            accept=".pdf,image/jpeg,image/png,image/jpg"
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            onChange={(e) => setData('parent_id_doc', e.target.files ? e.target.files[0] : null)}
                                        />
                                    </div>
                                    {errors.parent_id_doc && <p className="mt-2.5 text-sm font-medium text-red-500">{errors.parent_id_doc}</p>}
                                </div>

                            </div>

                            {/* Upload Progress Indicator */}
                            {progress && (
                                <div className="pt-2">
                                    <div className="mb-2 flex justify-between text-sm font-medium">
                                        <span className="text-indigo-700">Encrypting & Uploading...</span>
                                        <span className="text-slate-600">{progress.percentage}%</span>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Submit Action */}
                            <div className="pt-4 sm:pt-6">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-14 w-full bg-indigo-600 text-base font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-[0.99] sm:text-lg"
                                >
                                    {processing ? 'Processing Request...' : 'Submit Documents for Review'}
                                </Button>
                                <p className="mt-4 text-center text-xs text-slate-500">
                                    By submitting, you agree to our data privacy policy regarding student records.
                                </p>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
