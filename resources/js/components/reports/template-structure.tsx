import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FIELD_TYPES, ReportTemplate, TemplateField, TemplateSection } from '@/constants/report-types';
import { Circle, Copy, GripHorizontal, GripVertical, ImageIcon, Plus, Square, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface TemplateStructureProps {
    template: ReportTemplate;
    setTemplate: React.Dispatch<React.SetStateAction<ReportTemplate>>;
}

export function TemplateStructure({ template, setTemplate }: TemplateStructureProps) {
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<{ sectionId: string; fieldId: string } | null>(null);

    // --- Section Handlers ---
    const handleAddSection = () => {
        const newSection: TemplateSection = {
            id: `section-${Date.now()}`,
            title: 'Untitled Section',
            description: '',
            fields: [],
            collapsible: false,
        };
        setTemplate((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
        setEditingSection(newSection.id);
    };

    const handleUpdateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
        setTemplate((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
        }));
    };

    const handleDeleteSection = (sectionId: string) => {
        if (!confirm('Delete this section and all its questions?')) return;
        setTemplate((prev) => ({
            ...prev,
            sections: prev.sections.filter((s) => s.id !== sectionId),
        }));
        toast.success('Section deleted');
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...template.sections];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newSections.length) return;
        [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
        setTemplate((prev) => ({ ...prev, sections: newSections }));
    };

    // --- Field Handlers ---
    const handleAddField = (sectionId: string) => {
        const newField: TemplateField = {
            id: `field-${Date.now()}`,
            type: 'text',
            label: 'Untitled Question',
            required: false,
            options: [],
        };
        setTemplate((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s)),
        }));
        setEditingField({ sectionId, fieldId: newField.id });
    };

    const handleDuplicateField = (sectionId: string, field: TemplateField) => {
        const newField = {
            ...field,
            id: `field-${Date.now()}`,
            label: `${field.label} (Copy)`,
        };

        setTemplate((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s)),
        }));
        setEditingField({ sectionId, fieldId: newField.id });
        toast.success('Question duplicated');
    };

    const handleUpdateField = (sectionId: string, fieldId: string, updates: Partial<TemplateField>) => {
        setTemplate((prev) => ({
            ...prev,
            sections: prev.sections.map((s) =>
                s.id === sectionId
                    ? {
                          ...s,
                          fields: s.fields.map((f) => {
                              if (f.id !== fieldId) return f;

                              // Logic for switching types
                              const updatedField = { ...f, ...updates };
                              if (
                                  (updates.type === 'select' || updates.type === 'checkbox') &&
                                  (!updatedField.options || updatedField.options.length === 0)
                              ) {
                                  updatedField.options = ['Option 1'];
                              }
                              return updatedField;
                          }),
                      }
                    : s,
            ),
        }));
    };

    const handleDeleteField = (sectionId: string, fieldId: string) => {
        setTemplate((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) } : s)),
        }));
        // Clear editing state if we deleted the active field
        if (editingField?.fieldId === fieldId) setEditingField(null);
    };

    // --- Option Handlers ---
    const handleAddOption = (sectionId: string, fieldId: string, currentOptions: string[] = []) => {
        const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
        handleUpdateField(sectionId, fieldId, { options: newOptions });
    };

    const handleOptionChange = (sectionId: string, fieldId: string, currentOptions: string[], index: number, value: string) => {
        const newOptions = [...currentOptions];
        newOptions[index] = value;
        handleUpdateField(sectionId, fieldId, { options: newOptions });
    };

    const handleRemoveOption = (sectionId: string, fieldId: string, currentOptions: string[], index: number) => {
        const newOptions = currentOptions.filter((_, i) => i !== index);
        handleUpdateField(sectionId, fieldId, { options: newOptions });
    };

    const getFieldIcon = (type: string) => {
        const fieldType = FIELD_TYPES.find((ft) => ft.value === type);
        return fieldType ? fieldType.icon : GripHorizontal;
    };

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
            {/* Title Card */}
            <Card className="border-t-4 border-t-blue-600 shadow-sm">
                <CardContent className="space-y-4 pt-6">
                    <Input
                        value={template.name}
                        onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Form Title"
                        className="h-auto border-none px-0 text-2xl font-normal placeholder:text-gray-400 focus-visible:ring-0"
                    />
                    <Textarea
                        value={template.description}
                        onChange={(e) => setTemplate((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Form Description"
                        className="min-h-[40px] resize-none border-none px-0 text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-0"
                        rows={1}
                    />
                </CardContent>
            </Card>

            {/* Sections List */}
            <div className="space-y-4">
                {template.sections.map((section, sectionIndex) => (
                    <div key={section.id} className="space-y-4">
                        {/* Section Header */}
                        <div className="group relative rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm">
                            {/* Section Drag Handle (Left) */}
                            <div className="absolute top-0 bottom-0 left-0 flex w-1 cursor-move items-center justify-center rounded-l-lg bg-transparent transition-colors group-hover:bg-gray-200">
                                {/* Optional Drag indicator */}
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        value={section.title}
                                        onChange={(e) => handleUpdateSection(section.id, { title: e.target.value })}
                                        placeholder="Section Title"
                                        className="-ml-2 border-transparent px-2 text-lg font-medium transition-all hover:border-gray-200 focus:border-blue-500"
                                    />
                                    <Input
                                        value={section.description || ''}
                                        onChange={(e) => handleUpdateSection(section.id, { description: e.target.value })}
                                        placeholder="Description (optional)"
                                        className="-ml-2 h-8 border-transparent px-2 text-sm text-gray-500 transition-all hover:border-gray-200 focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button variant="ghost" size="icon" onClick={() => moveSection(sectionIndex, 'up')} disabled={sectionIndex === 0}>
                                        <GripVertical className="size-4 text-gray-400" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Fields List */}
                        <div className="space-y-4 pl-0 md:pl-4">
                            {section.fields.map((field) => {
                                const isEditing = editingField?.fieldId === field.id;

                                return (
                                    <Card
                                        key={field.id}
                                        className={`group border-l-4 transition-all duration-200 ${isEditing ? 'scale-[1.01] border-l-blue-600 shadow-md' : 'border-l-transparent hover:border-l-gray-300'}`}
                                        onClick={() => !isEditing && setEditingField({ sectionId: section.id, fieldId: field.id })}
                                    >
                                        <CardContent className="p-6">
                                            {isEditing ? (
                                                // --- EDIT MODE ---
                                                <div className="space-y-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-1">
                                                            <Input
                                                                value={field.label}
                                                                onChange={(e) => handleUpdateField(section.id, field.id, { label: e.target.value })}
                                                                placeholder="Question"
                                                                className="h-12 rounded-t-sm border-x-0 border-t-0 border-b-2 border-gray-200 bg-gray-50 px-3 text-base focus:border-blue-600"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="w-[220px]">
                                                            <Select
                                                                value={field.type}
                                                                onValueChange={(val: any) => handleUpdateField(section.id, field.id, { type: val })}
                                                            >
                                                                <SelectTrigger className="h-12 border-gray-200 bg-white">
                                                                    <div className="flex items-center gap-2">
                                                                        <SelectValue />
                                                                    </div>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {FIELD_TYPES.map((ft) => (
                                                                        <SelectItem key={ft.value} value={ft.value}>
                                                                            <div className="flex items-center gap-2">
                                                                                <ft.icon className="size-4" />
                                                                                {ft.label}
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    {/* Dynamic Content Area based on Type */}
                                                    <div className="pl-1">
                                                        {/* Text Types */}
                                                        {['text', 'number', 'textarea'].includes(field.type) && (
                                                            <div className="w-1/2 border-b border-dotted border-gray-300 py-2 text-sm text-gray-400">
                                                                {field.type === 'number' ? 'Number answer' : 'Short answer text'}
                                                            </div>
                                                        )}

                                                        {/* Options Types (Checkbox, Select) */}
                                                        {(field.type === 'select' || field.type === 'checkbox') && (
                                                            <div className="space-y-3">
                                                                {(field.options || []).map((option, idx) => (
                                                                    <div key={idx} className="group/opt flex items-center gap-3">
                                                                        {field.type === 'select' ? (
                                                                            <Circle className="size-4 text-gray-300" />
                                                                        ) : (
                                                                            <Square className="size-4 rounded-sm text-gray-300" />
                                                                        )}
                                                                        <Input
                                                                            value={option}
                                                                            onChange={(e) =>
                                                                                handleOptionChange(
                                                                                    section.id,
                                                                                    field.id,
                                                                                    field.options || [],
                                                                                    idx,
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                            className="h-8 border-transparent px-0 shadow-none transition-all hover:border-gray-200 focus:border-blue-500"
                                                                        />
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="size-8 opacity-0 group-hover/opt:opacity-100"
                                                                            onClick={() =>
                                                                                handleRemoveOption(section.id, field.id, field.options || [], idx)
                                                                            }
                                                                        >
                                                                            <X className="size-4 text-gray-400" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                                <div className="flex items-center gap-3">
                                                                    {field.type === 'select' ? (
                                                                        <Circle className="size-4 text-gray-300" />
                                                                    ) : (
                                                                        <Square className="size-4 rounded-sm text-gray-300" />
                                                                    )}
                                                                    <div
                                                                        className="cursor-pointer py-1 text-sm text-gray-500 hover:text-gray-700"
                                                                        onClick={() => handleAddOption(section.id, field.id, field.options || [])}
                                                                    >
                                                                        Add option
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Specialized Types */}
                                                        {field.type === 'chart' && (
                                                            <div className="rounded border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-400">
                                                                Chart Visualization Placeholder
                                                            </div>
                                                        )}
                                                    </div>
                                                    {field.type === 'image' && (
                                                        <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-400">
                                                            <div className="rounded-full border border-gray-200 bg-white p-2">
                                                                <ImageIcon className="size-6 text-gray-400" />
                                                            </div>
                                                            <div className="text-sm">Image Upload Field Placeholder</div>
                                                            <div className="text-xs text-gray-400">
                                                                Users will be able to upload images (up to 2MB) here.
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Action Footer */}
                                                    <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-4">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDuplicateField(section.id, field);
                                                            }}
                                                            title="Duplicate"
                                                        >
                                                            <Copy className="size-5 text-gray-500" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteField(section.id, field.id);
                                                            }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="size-5 text-gray-500" />
                                                        </Button>
                                                        <div className="mx-2 h-6 w-px bg-gray-200"></div>
                                                        <div className="flex items-center gap-2">
                                                            <Label htmlFor={`req-${field.id}`} className="text-sm font-normal text-gray-600">
                                                                Required
                                                            </Label>
                                                            <Switch
                                                                id={`req-${field.id}`}
                                                                checked={field.required}
                                                                onCheckedChange={(c) => handleUpdateField(section.id, field.id, { required: c })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // --- VIEW MODE (Collapsed) ---
                                                <div className="flex items-center gap-4">
                                                    {/* Drag Handle */}
                                                    <div className="flex h-full cursor-grab items-center justify-center text-gray-300 hover:text-gray-500 active:cursor-grabbing">
                                                        <GripVertical className="size-5" />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="mb-1 text-[15px] font-medium text-gray-900">
                                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                                        </div>
                                                        {field.type === 'text' && (
                                                            <div className="w-1/2 border-b border-dotted border-gray-300 pb-1 text-sm text-gray-400">
                                                                Short answer text
                                                            </div>
                                                        )}
                                                        {field.type === 'select' && (
                                                            <div className="flex gap-2 text-sm text-gray-400">
                                                                <Circle className="size-4" /> Option 1
                                                            </div>
                                                        )}
                                                        {field.type === 'checkbox' && (
                                                            <div className="flex gap-2 text-sm text-gray-400">
                                                                <Square className="size-4" /> Option 1
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            <div className="flex justify-center pt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddField(section.id)}
                                    className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    <Plus className="mr-2 size-4" /> Add Question
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="flex justify-center pt-8 pb-12">
                    <Button onClick={handleAddSection} variant="secondary" className="border shadow-sm">
                        <Plus className="mr-2 size-4" /> Add New Section
                    </Button>
                </div>
            </div>
        </div>
    );
}
