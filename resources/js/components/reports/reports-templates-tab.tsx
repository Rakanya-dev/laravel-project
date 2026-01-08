import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, FileBarChart, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { ReportTemplate } from '@/constants/report-types';

import { ReportTemplateBuilder } from '@/components/reports/report-template-builder';

interface TemplatesProps {
    initialTemplates: ReportTemplate[];
    onUseTemplate: (template: ReportTemplate) => void;
}

export function ReportsTemplatesTab({ initialTemplates, onUseTemplate }: TemplatesProps) {
    const [templates, setTemplates] = useState<ReportTemplate[]>(initialTemplates || []);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | undefined>(undefined);

    useEffect(() => {
        setTemplates(initialTemplates || []);
    }, [initialTemplates]);

    const handleDelete = (id: string | number) => {
        if(confirm("Are you sure you want to delete this template?")) {
            router.delete(route('admin.reports.templates.destroy', id), {
                onSuccess: () => toast.success("Template deleted"),
                onError: () => toast.error("Failed to delete template")
            });
        }
    };

    const handleCreate = () => {
        setEditingTemplate(undefined);
        setIsBuilderOpen(true);
    };

    const handleEdit = (template: ReportTemplate) => {
        setEditingTemplate(template);
        setIsBuilderOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h3 className="text-lg font-medium">Report Templates</h3>
                    <span className="text-sm text-neutral-500">{templates.length} available</span>
                </div>
                {/* Always show New Template button */}
                <Button onClick={handleCreate} size="sm" className="bg-[#6366f1] hover:bg-[#4f46e5]">
                    <Plus className="size-4 mr-2" />
                    New Template
                </Button>
            </div>

            {templates.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileBarChart className="mx-auto h-12 w-12 text-neutral-300 mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900">No Templates Found</h3>
                        <p className="text-neutral-500 mb-6">Get started by creating a new report template.</p>
                        <Button onClick={handleCreate}>
                            <Plus className="size-4 mr-2" />
                            Create First Template
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <Card key={template.id} className="hover:border-blue-500 transition-all group">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-medium text-sm">{template.name}</h4>
                                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{template.description}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(template)}>
                                            <Edit2 className="h-4 w-4 text-neutral-500" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-red-50"
                                            onClick={() => template.id && handleDelete(template.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                                    <Badge variant="outline" className="text-[10px]">{template.frequency}</Badge>
                                </div>
                                <div className="mt-4 pt-4 border-t text-xs text-neutral-400 flex justify-between items-center">
                                    <span>Last used: {template.lastUsed || 'Never'}</span>
                                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onUseTemplate(template)}>Use Template</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ReportTemplateBuilder
                open={isBuilderOpen}
                onClose={() => setIsBuilderOpen(false)}
                template={editingTemplate}
            />
        </div>
    );
}
