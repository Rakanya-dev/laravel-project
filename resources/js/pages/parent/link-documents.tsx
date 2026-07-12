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

    const labelClass = "mb-2.5 flex items-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors";

    return (
        <AppLayout>
            <Head title="Verify Identity" />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 transition-colors duration-200 animate-in fade-in slide-in-from-bottom-4">

                {/* Header Section */}
                <div className="mb-10 text-center sm:mb-12">
                    <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/20 shadow-sm border border-indigo-100 dark:border-indigo-500/30 transition-colors">
                        <ShieldCheck className="size-10 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                        Final Security Step
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-base sm:text-lg font-medium leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                        We found the record for <strong className="font-black text-slate-900 dark:text-white">{studentName}</strong>!
                        To protect student privacy, please verify your relationship by uploading the required documents below.
                    </p>
                </div>

                <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl rounded-[2rem] bg-white dark:bg-zinc-950 transition-colors">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 px-6 py-8 sm:px-10 transition-colors text-center sm:text-left">
                        <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                            Secure Document Upload
                        </CardTitle>
                        <CardDescription className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
                            Documents are strictly encrypted and automatically deleted after Admin review. Max size: 5MB per file.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="bg-slate-50 dark:bg-zinc-950/30 px-6 py-8 sm:p-10 transition-colors">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Input Fields Grid */}
                            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">

                                {/* 1. Birth Certificate Field */}
                                <div className="group flex flex-col">
                                    <label className={labelClass}>
                                        <FileText className="mr-2 size-4 text-slate-400 dark:text-slate-500" />
                                        Child's Birth Certificate <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <div className={`relative flex min-h-[14rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 ${
                                        data.birth_cert
                                            ? 'border-emerald-500 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 hover:border-emerald-600 dark:hover:border-emerald-400'
                                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-950 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10'
                                    }`}>
                                        {data.birth_cert ? (
                                            <div className="flex flex-col items-center space-y-2">
                                                <FileCheck className="size-10 text-emerald-600 dark:text-emerald-500" />
                                                <span className="w-48 truncate px-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 sm:w-64 transition-colors">{data.birth_cert.name}</span>
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80 transition-colors">{formatFileSize(data.birth_cert.size)}</span>
                                                <span className="mt-3 text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">Click to change</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-2.5">
                                                <UploadCloud className="size-10 text-slate-400 transition-colors group-hover:text-indigo-500" />
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">Click or drag to upload</span>
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">PDF, JPG, or PNG</span>
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
                                    {errors.birth_cert && <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">{errors.birth_cert}</p>}
                                </div>

                                {/* 2. Parent ID Field */}
                                <div className="group flex flex-col">
                                    <label className={labelClass}>
                                        <UserSquare2 className="mr-2 size-4 text-slate-400 dark:text-slate-500" />
                                        Valid Parent/Guardian ID <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <div className={`relative flex min-h-[14rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ease-in-out focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 ${
                                        data.parent_id_doc
                                            ? 'border-emerald-500 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 hover:border-emerald-600 dark:hover:border-emerald-400'
                                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-950 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10'
                                    }`}>
                                        {data.parent_id_doc ? (
                                            <div className="flex flex-col items-center space-y-2">
                                                <FileCheck className="size-10 text-emerald-600 dark:text-emerald-500" />
                                                <span className="w-48 truncate px-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 sm:w-64 transition-colors">{data.parent_id_doc.name}</span>
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80 transition-colors">{formatFileSize(data.parent_id_doc.size)}</span>
                                                <span className="mt-3 text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">Click to change</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-2.5">
                                                <UploadCloud className="size-10 text-slate-400 transition-colors group-hover:text-indigo-500" />
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">Click or drag to upload</span>
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">PDF, JPG, or PNG</span>
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
                                    {errors.parent_id_doc && <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">{errors.parent_id_doc}</p>}
                                </div>

                            </div>

                            {/* Upload Progress Indicator */}
                            {progress && (
                                <div className="pt-3 transition-colors">
                                    <div className="mb-2.5 flex justify-between text-[11px] font-bold uppercase tracking-widest">
                                        <span className="text-indigo-600 dark:text-indigo-400 transition-colors">Encrypting & Uploading...</span>
                                        <span className="text-slate-500 dark:text-slate-400 transition-colors">{progress.percentage}%</span>
                                    </div>
                                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800 transition-colors">
                                        <div
                                            className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Submit Action */}
                            <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-8 transition-colors">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-14 w-full bg-indigo-600 dark:bg-indigo-600 text-lg font-bold text-white rounded-xl shadow-md transition-all hover:bg-indigo-700 dark:hover:bg-indigo-500"
                                >
                                    {processing ? 'Processing Request...' : 'Submit Documents for Review'}
                                </Button>
                                <p className="mt-5 text-center text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">
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
