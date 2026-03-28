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
            <div className="m-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center transition-colors hover:bg-slate-50">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 ring-8 ring-indigo-50/50">
                    <FileText className="h-10 w-10 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Official Reports Yet</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    A consolidated report card will be automatically generated and appear here once your child completes their first official assessment period.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
                <div
                    key={report.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50"
                >
                    {/* --- Card Header & Body --- */}
                    <div>
                        <div className="flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200">
                                <Award className="h-6 w-6" />
                            </div>
                            <Badge className="border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 hover:bg-emerald-100 shadow-none">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Official
                            </Badge>
                        </div>

                        <div className="mt-5">
                            <Badge variant="secondary" className="mb-3 border-none bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                                {report.type}
                            </Badge>

                            <h4 className="text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-indigo-700">
                                {report.title}
                            </h4>

                            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {new Date(report.date).toLocaleDateString('en-US', {
                                    month: 'long', day: 'numeric', year: 'numeric'
                                })}
                            </div>

                            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
                                {report.summary}
                            </p>
                        </div>
                    </div>

                    {/* --- Card Footer & Actions --- */}
                    <div className="mt-6 border-t border-slate-100 pt-5">
                        <div className="flex items-center gap-3">
                            <Button
                                className="flex-1 bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700"
                                onClick={() => onDownload(report.id)}
                            >
                                <Download className="mr-2 h-4 w-4" /> Download PDF
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 shrink-0 border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                                onClick={() => onPrint(report.id)}
                                title="Print Document"
                            >
                                <Printer className="h-4 w-4" />
                            </Button>
                        </div>

                        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {/* Evaluated by {report.evaluator} */}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
