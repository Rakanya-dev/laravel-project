import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Download, Database, Users, BarChart3, ShieldCheck, FileText, Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportItem {
    id: string;
    title: string;
    description: string;
    count: number;
    icon: any;
}

interface ExportSection {
    title: string;
    items: ExportItem[];
}

interface ReportsExportsTabProps {
    counts?: Record<string, number>;
}

export function ReportsExportsTab({ counts = {} }: ReportsExportsTabProps) {
    const [format, setFormat] = useState('csv');
    const [range, setRange] = useState('last-month');
    const [selectedExports, setSelectedExports] = useState<Set<string>>(new Set());

    // Define icon alias before usage in array to fix ReferenceError
    const FileBarChart = BarChart3;

    const exportSections: ExportSection[] = [
        {
            title: 'Assessments',
            items: [
                {
                    id: 'assessment_data',
                    title: 'Assessment Data',
                    description: 'Individual assessment scores and progress tracking',
                    count: 0,
                    icon: BarChart3
                },
                {
                    id: 'development_domains',
                    title: 'Development Domains',
                    description: 'Cognitive, physical, social-emotional scores',
                    count: 0,
                    icon: Database
                }
            ]
        },
        {
            title: 'Demographics',
            items: [
                {
                    id: 'children_information',
                    title: 'Children Information',
                    description: 'Basic demographics',
                    count: 0,
                    icon: Users
                }
            ]
        },
        {
            title: 'Analytics',
            items: [
                {
                    id: 'class_performance',
                    title: 'Class Performance',
                    description: 'Aggregated class-level statistics and trends',
                    count: 0,
                    icon: FileBarChart
                }
            ]
        },
        {
            title: 'Reports',
            items: [
                {
                    id: 'teacher_reports',
                    title: 'Teacher Reports',
                    description: 'Assessment submissions and teacher evaluations',
                    count: 0,
                    icon: FileText
                }
            ]
        },
        {
            title: 'Compliance',
            items: [
                {
                    id: 'compliance_reports',
                    title: 'Compliance Reports',
                    description: 'Regulatory compliance and audit trails',
                    count: 0,
                    icon: ShieldCheck
                }
            ]
        }
    ];

    const allExportIds = exportSections.flatMap(s => s.items.map(i => i.id));

    const handleToggle = (id: string) => {
        const newSelected = new Set(selectedExports);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedExports(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedExports.size === allExportIds.length) {
            setSelectedExports(new Set());
        } else {
            setSelectedExports(new Set(allExportIds));
        }
    };

    const handleExport = (type: string) => {
        toast.info(`Starting export for ${type}...`);

        try {
            // FIX: Use route() helper to ensure correct URL generation
            // Requires route name 'admin.reports.export'
            const url = route('admin.reports.export', {
                type: type,
                format: format,
                range: range
            });

            // Use hidden iframe for background download
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);

            // Clean up iframe after a delay
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 60000);

        } catch (error) {
            console.error("Export Error:", error);
            toast.error("Export route not found. Please check backend routes.");
        }
    };

    const handleBulkExport = () => {
        if (selectedExports.size === 0) return;

        toast.info(`Exporting ${selectedExports.size} files...`);

        // Loop and trigger downloads with a small delay to ensure browser handles them
        Array.from(selectedExports).forEach((type, index) => {
            setTimeout(() => {
                handleExport(type);
            }, index * 1500);
        });

        setSelectedExports(new Set());
    };

    return (
        <div className="space-y-6 pb-20 relative">
            {/* Configuration Header */}
            <Card className="bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-neutral-900">
                        <Settings className="size-4" />
                        Export Configuration
                    </div>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-2 w-full md:w-64">
                            <label className="text-xs font-medium text-neutral-500">Export Format</label>
                            <Select value={format} onValueChange={setFormat}>
                                <SelectTrigger className="bg-gray-50 border-gray-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                                    <SelectItem value="json">JSON (Structured Data)</SelectItem>
                                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 w-full md:w-64">
                            <label className="text-xs font-medium text-neutral-500">Date Range</label>
                            <Select value={range} onValueChange={setRange}>
                                <SelectTrigger className="bg-gray-50 border-gray-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="last-month">Last Month</SelectItem>
                                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                                    <SelectItem value="ytd">Year to Date</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-neutral-500">Quick Actions</label>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                    {selectedExports.size === allExportIds.length ? 'Deselect All' : 'Select All'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setSelectedExports(new Set())} disabled={selectedExports.size === 0}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sections */}
            <div className="space-y-8">
                {exportSections.map((section) => (
                    <div key={section.title} className="space-y-3">
                        <h3 className="text-sm font-semibold text-neutral-900">{section.title}</h3>
                        <div className="grid gap-3">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                // Use real count from props, fallback to item.count (which is 0)
                                const realCount = counts[item.id] !== undefined ? counts[item.id] : item.count;

                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-center p-4 rounded-xl border transition-all ${
                                            selectedExports.has(item.id)
                                                ? 'border-blue-500 bg-blue-50/30 shadow-sm'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="mr-4">
                                            <Checkbox
                                                checked={selectedExports.has(item.id)}
                                                onCheckedChange={() => handleToggle(item.id)}
                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                        </div>
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4 text-gray-500">
                                            <Icon className="size-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal text-gray-500 bg-gray-100">
                                                    {realCount} records
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">{item.description}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900" onClick={() => handleExport(item.id)}>
                                            <Download className="size-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Bottom Bar */}
            {selectedExports.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-gray-900 text-white p-3 rounded-full shadow-xl flex items-center justify-between pl-6 pr-2 z-50 animate-in slide-in-from-bottom-4">
                    <div className="text-sm font-medium">
                        {selectedExports.size} export{selectedExports.size !== 1 ? 's' : ''} selected
                    </div>
                    <Button
                        size="sm"
                        className="rounded-full bg-white text-black hover:bg-gray-100 border-0"
                        onClick={handleBulkExport}
                    >
                        <Download className="size-3.5 mr-2" />
                        Export Selected Data
                    </Button>
                </div>
            )}
        </div>
    );
}
