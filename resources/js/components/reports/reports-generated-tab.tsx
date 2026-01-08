import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, BarChart3, Calendar, Check, ChevronLeft, ChevronRight, Eye, FileText, Printer, User, X } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

interface Report {
    id: number;
    title: string;
    student: string;
    type: string;
    date: string;
    generated_by: string;
    content: any;
}

// ... (FIELD_MAP and HELPER functions remain exactly the same as your code) ...
const FIELD_MAP: Record<string, string> = {
    f1: 'Child Name',
    f2: 'Report Date',
    f3: 'Age',
    f4: 'Daycare Center/Quarter',
    f5: 'Teacher Name',
    f6: 'Cognitive Score',
    f7: 'Cognitive Obs.',
    f8: 'Physical Score',
    f9: 'Physical Obs.',
    f10: 'Social Score',
    f11: 'Social Obs.',
    f12: 'Monthly Trend',
    f13: 'Strengths',
    f14: 'Areas for Growth',
    f15: 'Recommendations',
    f16: 'Expressive Lang.',
    f17: 'Receptive Lang.',
    f18: 'Language Obs.',
    f19: 'Next Goals',
    f20: 'Activities',
    f21: 'Next Due Date',
    i1: 'Incident Date',
    i2: 'Time',
    i3: 'Location',
    i4: 'Description',
    i5: 'Action Taken',
    i6: 'Parents Notified',
    i7: 'Incident Type',
    i8: 'Circumstances',
    i9: 'No Injury',
    i10: 'Minor Injury',
    i11: 'Medical Attention',
    i12: 'Injury Desc',
    i13: 'Immediate Response',
    i14: 'First Aid',
    i15: 'Parent Notified',
    i16: 'Contact Time',
    i17: 'Prevention',
    i18: 'Reported By',
    i19: 'Supervisor',
};

export function ReportsGeneratedTab({ reports }: { reports: Report[] }) {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(reports.length / itemsPerPage);
    const paginatedReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
    };

    const getLabel = (key: string) => {
        if (key.length > 4 && key.includes(' ')) return key;
        return (
            FIELD_MAP[key] ||
            key
                .replace(/_/g, ' ')
                .replace(/^f(\d+)$/, 'Field $1')
                .toUpperCase()
        );
    };

    const renderScreenValue = (key: string, value: any) => {
        if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) return null;

        const label = getLabel(key);

        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && ('score' in value[0] || 'value' in value[0])) {
            const xKey = 'name' in value[0] ? 'name' : 'domain';
            const isTrend = label.toLowerCase().includes('trend') || xKey === 'name';

            return (
                <div key={key} className="col-span-1 mt-4 mb-8 rounded-xl border bg-white p-6 shadow-sm ring-1 ring-slate-100 md:col-span-2">
                    <h4 className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        <BarChart3 className="size-4" /> {label}
                    </h4>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {isTrend ? (
                                <LineChart data={value}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey={xKey} fontSize={12} tickLine={false} axisLine={false} dy={10} stroke="#64748b" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} stroke="#64748b" />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#3b82f6' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            ) : (
                                <BarChart data={value}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey={xKey} fontSize={11} tickLine={false} axisLine={false} interval={0} dy={5} stroke="#64748b" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 20]} stroke="#64748b" />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} name="Score" />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        }

        if (typeof value === 'boolean') {
            return (
                <div key={key} className="col-span-1 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    {value ? (
                        <Badge className="border-0 bg-green-100 px-3 py-1 text-green-700 shadow-none hover:bg-green-100">
                            <Check className="mr-1.5 h-3 w-3" /> Yes
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-white px-3 py-1 text-slate-500 shadow-none">
                            <X className="mr-1.5 h-3 w-3" /> No
                        </Badge>
                    )}
                </div>
            );
        }

        const isLongText = typeof value === 'string' && value.length > 80;
        return (
            <div
                key={key}
                className={`${isLongText ? 'col-span-1 bg-slate-50/50 md:col-span-2' : 'col-span-1'} rounded-lg border border-transparent p-5 transition-all hover:border-slate-100`}
            >
                <h4 className="mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">{label}</h4>
                <div className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap text-slate-900">{String(value)}</div>
            </div>
        );
    };

    const handleExportPDF = () => {
        if (!selectedReport) return;
        toast.info('Preparing document for print...');

        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        const content = typeof selectedReport.content === 'string' ? JSON.parse(selectedReport.content) : selectedReport.content;

        let bodyHtml = '';

        const generateGridHtml = (data: [string, any][]) => {
            let html = '<div class="grid-container">';
            data.forEach(([key, value]) => {
                if (value === null || value === '') return;
                const label = getLabel(key);

                if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && ('score' in value[0] || 'value' in value[0])) {
                    const headers = Object.keys(value[0]);
                    const rows = value.map((r: any) => `<tr>${headers.map((h) => `<td>${r[h]}</td>`).join('')}</tr>`).join('');

                    html += `
                        <div class="full-width card-like">
                            <div class="field-label-large">${label}</div>
                            <table class="data-table">
                                <thead><tr>${headers.map((h) => `<th>${getLabel(h)}</th>`).join('')}</tr></thead>
                                <tbody>${rows}</tbody>
                            </table>
                        </div>`;
                } else if (typeof value === 'boolean') {
                    html += `
                        <div class="grid-item card-item">
                            <div class="field-label">${label}</div>
                            <div class="badge ${value ? 'badge-yes' : 'badge-no'}">${value ? 'YES' : 'NO'}</div>
                        </div>`;
                } else {
                    const isLong = String(value).length > 80;
                    html += `
                        <div class="${isLong ? 'full-width' : 'grid-item'} card-item">
                            <div class="field-label">${label}</div>
                            <div class="field-value">${value}</div>
                        </div>`;
                }
            });
            html += '</div>';
            return html;
        };

        const isNested = Object.values(content).some((val) => typeof val === 'object' && val !== null && !Array.isArray(val));

        if (isNested) {
            Object.entries(content).forEach(([sectionTitle, sectionData]: [string, any]) => {
                if (!sectionData || Object.keys(sectionData).length === 0) return;
                bodyHtml += `
                    <div class="section">
                        <div class="section-header">${sectionTitle}</div>
                        <div class="section-body">${generateGridHtml(Object.entries(sectionData))}</div>
                    </div>`;
            });
        } else {
            bodyHtml += `
                <div class="section">
                    <div class="section-header">Report Details</div>
                    <div class="section-body">${generateGridHtml(Object.entries(content))}</div>
                </div>`;
        }

        const html = `
            <html>
            <head>
                <title>${selectedReport.title}</title>
                <style>
                    @page { margin: 15mm; size: A4; }
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 25px; background: white; -webkit-print-color-adjust: exact; }

                    .doc-header { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #0f172a; display: flex; justify-content: space-between; align-items: flex-end; }
                    .doc-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2; text-transform: uppercase; }
                    .doc-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 500; }
                    .brand { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }

                    .doc-meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
                    .meta-item { display: flex; flex-direction: column; }
                    .meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 3px; }
                    .meta-value { font-size: 12px; font-weight: 600; color: #0f172a; }

                    .section { margin-bottom: 20px; page-break-inside: avoid; }
                    .section-header { font-size: 14px; font-weight: 700; color: #3b82f6; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; }
                    .section-body { padding: 0; }

                    .grid-container { display: flex; flex-wrap: wrap; gap: 15px; }
                    .grid-item { flex: 1 1 45%; min-width: 200px; }
                    .full-width { flex: 1 1 100%; width: 100%; }

                    .card-item { background: #fff; border: 1px solid #f1f5f9; border-radius: 4px; padding: 10px; }
                    .field-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
                    .field-label-large { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; border-left: 3px solid #3b82f6; padding-left: 8px; }
                    .field-value { font-size: 12px; line-height: 1.5; color: #1e293b; white-space: pre-wrap; }

                    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid #e2e8f0; }
                    .badge-yes { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
                    .badge-no { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; }

                    .data-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 5px; border: 1px solid #e2e8f0; }
                    .data-table th { background: #f8fafc; padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600; text-transform: uppercase; }
                    .data-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
                    .data-table tr:last-child td { border-bottom: none; }

                    .card-like { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; background: #fff; margin-bottom: 10px; }

                    .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #cbd5e1; border-top: 1px solid #e2e8f0; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="doc-header">
                    <div>
                        <h1 class="doc-title">${selectedReport.title}</h1>
                        <div class="doc-subtitle">Official Assessment Record</div>
                    </div>
                    <div class="brand">KIDTRAK SYSTEM</div>
                </div>

                <div class="doc-meta-box">
                    <div class="meta-item"><div class="meta-label">Student Name</div><div class="meta-value">${selectedReport.student}</div></div>
                    <div class="meta-item"><div class="meta-label">Report Date</div><div class="meta-value">${selectedReport.date}</div></div>
                    <div class="meta-item"><div class="meta-label">Report Type</div><div class="meta-value">${selectedReport.type}</div></div>
                    <div class="meta-item"><div class="meta-label">Generated By</div><div class="meta-value">${selectedReport.generated_by}</div></div>
                </div>

                ${bodyHtml}

                <div class="footer">
                    Generated by KIDTRAK System • ${new Date().toLocaleDateString()} • Confidential Document
                </div>
            </body>
            </html>
        `;

        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 2000);
        }, 500);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Generated Reports History</CardTitle>
                            <p className="text-sm text-neutral-500">Archive of all reports created in the system</p>
                        </div>
                        <Badge variant="outline">{reports.length} Total</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Report Title</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Generated By</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!reports || reports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-neutral-500">
                                            No reports generated yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="size-4 text-blue-500" />
                                                    {report.title}
                                                </div>
                                            </TableCell>
                                            <TableCell>{report.student}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs font-normal">
                                                    {report.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{report.date}</TableCell>
                                            <TableCell className="text-xs text-neutral-600">{report.generated_by}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedReport(report)}>
                                                    <Eye className="size-4 text-neutral-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {reports.length > itemsPerPage && (
                        <div className="mt-4 flex items-center justify-between border-t py-4">
                            <div className="text-xs text-neutral-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, reports.length)} of{' '}
                                {reports.length}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1} className="h-8 w-8 p-0">
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <span className="text-xs text-neutral-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
                {/* 👇 FIXED: Changed max-w-[900px] to max-w-[980px] */}
                <DialogContent className="flex h-[90vh] flex-col gap-0 p-0 sm:max-w-3xl">
                    {' '}
                    <DialogHeader className="shrink-0 border-b bg-white px-8 pt-8 pb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-2xl font-bold text-slate-900">{selectedReport?.title}</DialogTitle>
                                <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="size-4" /> {selectedReport?.date}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <User className="size-4" /> {selectedReport?.student}
                                    </span>
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        {selectedReport?.type}
                                    </Badge>
                                </div>
                            </div>
                            <Button size="sm" onClick={handleExportPDF} className="bg-slate-900 text-white hover:bg-slate-800">
                                <Printer className="mr-2 size-4" /> Print / Export
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
                        {/* 👇 FIXED: Changed max-w-3xl to max-w-5xl to fill the wider dialog */}
                        <div className="mx-auto max-w-5xl space-y-8">
                            {selectedReport &&
                                (() => {
                                    const content =
                                        typeof selectedReport.content === 'string' ? JSON.parse(selectedReport.content) : selectedReport.content;
                                    const isNested = Object.values(content).some(
                                        (val) => typeof val === 'object' && val !== null && !Array.isArray(val),
                                    );

                                    if (isNested) {
                                        return Object.entries(content).map(([sectionTitle, sectionData]: [string, any]) => (
                                            <div key={sectionTitle} className="mb-10 last:mb-0">
                                                <div className="mb-6 flex items-center gap-3">
                                                    <div className="h-6 w-1.5 rounded-full bg-blue-600"></div>
                                                    <h3 className="text-lg font-bold tracking-wide text-slate-900 uppercase">{sectionTitle}</h3>
                                                </div>

                                                <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
                                                    {typeof sectionData === 'object' && sectionData !== null ? (
                                                        Object.entries(sectionData).map(([k, v]) => renderScreenValue(k, v))
                                                    ) : (
                                                        <p>{String(sectionData)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ));
                                    } else {
                                        return (
                                            <Card className="border-slate-200 shadow-sm">
                                                <CardHeader className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                                                    <CardTitle className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                                                        Report Data
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                                                        {Object.entries(content).map(([k, v]) => renderScreenValue(k, v))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                })()}

                            {selectedReport && (!selectedReport.content || Object.keys(selectedReport.content).length === 0) && (
                                <div className="py-12 text-center text-neutral-400">
                                    <AlertCircle className="mx-auto mb-2 size-10 opacity-50" />
                                    <p>No detailed content available for this report.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="shrink-0 border-t bg-white px-6 py-4">
                        <Button variant="outline" onClick={() => setSelectedReport(null)}>
                            Close Viewer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
