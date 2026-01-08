import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, FileText, User, Check, BarChart3, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { ReportTemplate } from '@/constants/report-types';
import axios from 'axios';

// --- Imports for Charts ---
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Student {
    id: number;
    name: string;
    daycare: string;
}

interface ReportGeneratorProps {
    open: boolean;
    onClose: () => void;
    templates: ReportTemplate[];
    students: Student[];
    initialTemplateId?: string;
}

export function ReportGenerator({ open, onClose, templates, students, initialTemplateId }: ReportGeneratorProps) {
    const [step, setStep] = useState<'select' | 'fill'>('select');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        if (open) {
            setStep('select');
            setFormData({});
            if (initialTemplateId) {
                setSelectedTemplateId(String(initialTemplateId));
            }
        }
    }, [open, initialTemplateId]);

    const selectedTemplate = templates.find(t => String(t.id) === selectedTemplateId);

    const handleFileChange = (fieldId: string, file: File | undefined) => {
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File is too large. Max 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, [fieldId]: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleStart = async () => {
        if (!selectedTemplateId || !selectedStudentId) {
            toast.error("Please select both a template and a student.");
            return;
        }

        setIsLoadingData(true);

        try {
            const response = await axios.get(route('admin.reports.data'), {
                params: {
                    student_id: selectedStudentId,
                    template_id: selectedTemplateId
                }
            });

            const autoFilledData = response.data.formData || {};
            const message = response.data.message;

            const initialData: Record<string, any> = {};
            selectedTemplate?.sections.forEach(section => {
                section.fields.forEach(field => {
                    if (autoFilledData[field.id]) {
                        if (field.type === 'number') {
                            initialData[field.id] = Math.round(Number(autoFilledData[field.id]));
                        }
                        else if (field.type === 'chart' && Array.isArray(autoFilledData[field.id])) {
                            initialData[field.id] = autoFilledData[field.id].map((item: any) => ({
                                ...item,
                                score: Math.round(Number(item.score))
                            }));
                        }
                        else {
                            initialData[field.id] = autoFilledData[field.id];
                        }
                    } else if (field.defaultValue) {
                        initialData[field.id] = field.defaultValue;
                    }
                });
            });

            setFormData(initialData);
            setStep('fill');
            toast.success(message);
        } catch (error) {
            console.error("Auto-fill error:", error);
            toast.error("Could not auto-fill data. Starting with empty form.");
            setStep('fill');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleFieldChange = (fieldId: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = () => {
        let isValid = true;
        selectedTemplate?.sections.forEach(section => {
            section.fields.forEach(field => {
                if (field.required && !formData[field.id]) {
                    if (field.type !== 'chart' && field.type !== 'image') {
                        isValid = false;
                    }
                }
            });
        });

        if (!isValid) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);

        router.post(route('admin.reports.store'), {
            student_id: selectedStudentId,
            template_id: selectedTemplateId,
            report_date: reportDate,
            content: formData
        }, {
            onSuccess: () => {
                toast.success("Report generated successfully!");
                onClose();
                setIsSubmitting(false);
                router.reload({ only: ['generatedReports', 'recentReports', 'overviewStats'] });
            },
            onError: () => {
                toast.error("Failed to generate report.");
                setIsSubmitting(false);
            }
        });
    };

    const renderField = (field: any) => {
        switch (field.type) {
            case 'image':
                const hasImage = !!formData[field.id];
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id={`file-${field.id}`}
                                    onChange={(e) => {
                                        handleFieldChange(field.id, null);
                                        handleFileChange(field.id, e.target.files?.[0]);
                                    }}
                                />
                                <Label
                                    htmlFor={`file-${field.id}`}
                                    className="flex items-center justify-center gap-2 cursor-pointer h-10 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    <Upload className="size-4" />
                                    {hasImage ? 'Change Image' : 'Upload Image'}
                                </Label>
                            </div>
                            {hasImage && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                    <Check className="size-3" /> Image Loaded
                                </span>
                            )}
                        </div>

                        {/* Image Preview */}
                        {formData[field.id] && (
                            <div className="mt-2 relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={formData[field.id]}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                    </div>
                );

            case 'chart':
                const data = formData[field.id];
                const hasData = Array.isArray(data) && data.length > 0;

                return (
                    <div className="border rounded-md p-4 bg-white shadow-sm flex flex-col h-[350px]">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold uppercase text-gray-500">Live Data Preview</span>
                            {hasData ? (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                    <Check className="size-3" /> Data Loaded
                                </span>
                            ) : (
                                <span className="text-xs text-amber-600">No Data Available</span>
                            )}
                        </div>

                        {hasData ? (
                            <div className="flex-1 w-full relative min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {field.label.toLowerCase().includes('trend') ? (
                                        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                            <XAxis dataKey="name" fontSize={11} stroke="#888" />
                                            <YAxis fontSize={11} stroke="#888" domain={[0, 100]} allowDecimals={false} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Score" />
                                        </LineChart>
                                    ) : (
                                        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                            <XAxis dataKey="name" fontSize={11} stroke="#888" interval={0} />
                                            <YAxis fontSize={11} stroke="#888" domain={[0, 20]} allowDecimals={false} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend />
                                            <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Score" />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 bg-gray-50 rounded-md border-2 border-dashed border-gray-200 m-2">
                                <BarChart3 className="size-8 mb-2 opacity-50" />
                                <span className="text-sm">No assessment data found for this period.</span>
                            </div>
                        )}
                        <input type="hidden" name={field.id} value={JSON.stringify(data || [])} />
                    </div>
                );

            case 'textarea':
                return <Textarea placeholder={field.placeholder} value={formData[field.id] || ''} onChange={e => handleFieldChange(field.id, e.target.value)} className="min-h-[100px]" />;
            case 'select':
                return (
                    <Select value={formData[field.id] || ''} onValueChange={val => handleFieldChange(field.id, val)}>
                        <SelectTrigger><SelectValue placeholder={field.placeholder || "Select option"} /></SelectTrigger>
                        <SelectContent>
                            {field.options?.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>) || <SelectItem value="default">No options defined</SelectItem>}
                        </SelectContent>
                    </Select>
                );
            case 'date':
                return <Input type="date" value={formData[field.id] || ''} onChange={e => handleFieldChange(field.id, e.target.value)} />;
            case 'number':
                return <Input type="number" placeholder={field.placeholder} value={formData[field.id] || ''} onChange={e => handleFieldChange(field.id, e.target.value)} />;
            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2 py-2">
                        <Checkbox id={field.id} checked={!!formData[field.id]} onCheckedChange={checked => handleFieldChange(field.id, checked)} />
                        <label htmlFor={field.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">{field.placeholder || field.label}</label>
                    </div>
                );
            default:
                return <Input type="text" placeholder={field.placeholder} value={formData[field.id] || ''} onChange={e => handleFieldChange(field.id, e.target.value)} />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <DialogTitle>Generate Report</DialogTitle>
                    <DialogDescription>
                        {step === 'select' ? "Select a template and student to get started." : `Creating ${selectedTemplate?.name}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full">
                        <div className="p-6">
                            {step === 'select' ? (
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label>Report Template</Label>
                                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                            <SelectTrigger className="h-12"><SelectValue placeholder="Select a template..." /></SelectTrigger>
                                            <SelectContent>
                                                {templates.map(t => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        <div className="flex flex-col items-start"><span className="font-medium">{t.name}</span><span className="text-xs text-muted-foreground">{t.category} • {t.frequency}</span></div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Student</Label>
                                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                            <SelectTrigger className="h-12"><SelectValue placeholder="Select a student..." /></SelectTrigger>
                                            <SelectContent>
                                                {students.map(s => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        <div className="flex items-center gap-2"><User className="size-4 text-muted-foreground" /><span>{s.name}</span><span className="text-xs text-muted-foreground ml-2">({s.daycare})</span></div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Report Date</Label>
                                        <Input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="h-12" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {isLoadingData ? (
                                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                            <span className="text-sm text-gray-500">Retrieving assessment data...</span>
                                        </div>
                                    ) : (
                                        selectedTemplate?.sections.map((section, idx) => (
                                            <Card key={section.id || idx}>
                                                <CardHeader className="pb-3 bg-gray-50/50 border-b">
                                                    <CardTitle className="text-base font-semibold text-gray-800">{section.title}</CardTitle>
                                                    {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
                                                </CardHeader>
                                                <CardContent className="grid gap-6 p-6">
                                                    {section.fields.map(field => (
                                                        <div key={field.id} className="space-y-2">
                                                            <Label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                                                {field.label}
                                                                {field.required && <span className="text-red-500">*</span>}
                                                            </Label>
                                                            {renderField(field)}
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter className="px-6 py-4 border-t shrink-0 bg-gray-50/50">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting || isLoadingData}>Cancel</Button>
                    {step === 'select' ? (
                        <Button onClick={handleStart} disabled={!selectedTemplateId || !selectedStudentId || isLoadingData} className="bg-indigo-600 hover:bg-indigo-700">
                            {isLoadingData ? 'Loading...' : 'Continue'} <Check className="ml-2 size-4" />
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setStep('select')} disabled={isSubmitting}>Back</Button>
                            <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving Report...' : 'Save & Generate'} <FileText className="ml-2 size-4" />
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
