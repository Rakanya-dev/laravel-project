import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer, Award, Calendar, CheckCircle2 } from 'lucide-react';

interface GeneratedReport {
    id: number;
    title: string;
    type: string;
    evaluator: string;
    date: string;
    summary: string;
    badge: string;
}

export function ChildReportsList({
    reports,
    onDownload,
    onPrint
}: {
    reports: GeneratedReport[],
    onDownload: (id: number) => void,
    onPrint: (id: number) => void
}) {

    if (reports.length === 0) {
        return (
            <div className="m-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 p-12 text-center transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 ring-8 ring-indigo-50/50 dark:ring-indigo-500/20 transition-colors">
                    <FileText className="h-10 w-10 text-indigo-400 dark:text-indigo-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 transition-colors">No Official Reports Yet</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                    A consolidated report card will be automatically generated and appear here once your child completes their first official assessment period.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 transition-colors duration-200">
            {reports.map((report) => (
                <div
                    key={report.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20"
                >
                    {/* --- Card Header & Body --- */}
                    <div>
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none transition-colors">
                                <Award className="h-6 w-6" />
                            </div>
                            <Badge className="border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 shadow-none transition-colors">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Official
                            </Badge>
                        </div>

                        <div className="mt-5">
                            <Badge variant="secondary" className="mb-3 border-none bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                                {report.type}
                            </Badge>

                            <h4 className="text-lg font-bold leading-tight text-slate-900 dark:text-white transition-colors group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                                {report.title}
                            </h4>

                            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors" />
                                {new Date(report.date).toLocaleDateString('en-US', {
                                    month: 'long', day: 'numeric', year: 'numeric'
                                })}
                            </div>

                            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 transition-colors">
                                {report.summary}
                            </p>
                        </div>
                    </div>

                    {/* --- Card Footer & Actions --- */}
                    <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5 transition-colors">
                        <div className="flex items-center gap-3">
                            <Button
                                className="flex-1 bg-indigo-600 dark:bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 dark:hover:bg-indigo-500"
                                onClick={() => onDownload(report.id)}
                            >
                                <Download className="mr-2 h-4 w-4" /> Download PDF
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 shrink-0 border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                                onClick={() => onPrint(report.id)}
                                title="Print Document"
                            >
                                <Printer className="h-4 w-4" />
                            </Button>
                        </div>

                        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">
                            {/* Evaluated by {report.evaluator} */}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
