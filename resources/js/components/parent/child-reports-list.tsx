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
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50 dark:bg-zinc-950/50 rounded-b-2xl border-t border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                    <FileText className="size-10 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">No Official Reports Yet</h3>
                <p className="mt-2 max-w-md text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400 transition-colors">
                    A consolidated report card will be automatically generated and appear here once your child completes their first official assessment period.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-5 sm:gap-6 p-4 sm:p-0 md:grid-cols-2 xl:grid-cols-3 transition-colors duration-200 print:grid-cols-3 print:gap-4">
            {reports.map((report) => (
                <div
                    key={report.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md hover:-translate-y-1 print:break-inside-avoid print:shadow-none print:border-slate-300 print:hover:translate-y-0"
                >
                    {/* --- Card Header & Body --- */}
                    <div>
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 text-white shadow-sm transition-colors">
                                <Award className="size-6" />
                            </div>
                            <Badge className="border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 shadow-none transition-colors mt-0.5">
                                <CheckCircle2 className="mr-1.5 size-4" /> Official
                            </Badge>
                        </div>

                        <div>
                            <Badge variant="secondary" className="mb-3 border-none bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 shadow-none transition-colors">
                                {report.type}
                            </Badge>

                            <h4 className="text-2xl font-black tracking-tight leading-tight text-slate-900 dark:text-white transition-colors group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                                {report.title}
                            </h4>

                            <div className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                <Calendar className="size-4 text-slate-400 dark:text-slate-500 transition-colors" />
                                {new Date(report.date).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                })}
                            </div>

                            <p className="mt-4 line-clamp-2 text-base font-medium leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
                                {report.summary}
                            </p>
                        </div>
                    </div>

                    {/* --- Card Footer & Actions --- */}
                    <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5 transition-colors">
                        <div className="flex items-center gap-3 print:hidden">
                            <Button
                                className="h-12 flex-1 rounded-xl bg-indigo-600 dark:bg-indigo-600 text-base font-bold text-white shadow-sm transition-all hover:bg-indigo-700 dark:hover:bg-indigo-500"
                                onClick={() => onDownload(report.id)}
                            >
                                <Download className="mr-2 size-5" /> Download PDF
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="size-12 shrink-0 rounded-xl border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                                onClick={() => onPrint(report.id)}
                                title="Print Document"
                            >
                                <Printer className="size-5" />
                            </Button>
                        </div>

                        <p className="mt-5 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">
                            Evaluated by {report.evaluator}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
