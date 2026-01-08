import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  evaluator: string;
  date: string;
  summary: string;
  standardScore?: number;
  badge: string;
}

export function ChildReportsList({ reports }: { reports: GeneratedReport[] }) {
    const handleAction = (action: string, title: string) => {
        toast.success(`${action} ${title}...`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <CardTitle>Reports</CardTitle>
                <Badge variant="secondary">{reports.length} Available</Badge>
            </div>

            {reports.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center text-neutral-500">
                        <FileText className="mx-auto mb-3 size-10 text-neutral-300" />
                        No reports generated yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {reports.map((report) => (
                        <Card key={report.id} className="group hover:border-blue-300 transition-colors">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                        <FileText className="size-6" />
                                    </div>
                                    <Badge className={report.badge}>{report.type}</Badge>
                                </div>
                                <CardTitle className="mt-4">{report.title}</CardTitle>
                                <CardDescription>{new Date(report.date).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-neutral-600 line-clamp-2">{report.summary}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => handleAction('Downloading', report.title)}>
                                        <Download className="size-3.5" /> Download
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => handleAction('Printing', report.title)}>
                                        <Printer className="size-3.5" /> Print
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
