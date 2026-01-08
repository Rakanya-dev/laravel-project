import { useState, useEffect } from 'react';
import { X, Eye, Save, Copy, Layout, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ReportTemplate } from '@/constants/report-types';
import { TemplateStructure } from '@/components/reports/template-structure';
import { TemplateSettings } from '@/components/reports/template-settings';
import { TemplatePreview } from '@/components/reports/template-preview';
import { router } from '@inertiajs/react';

interface ReportTemplateBuilderProps {
  open: boolean;
  onClose: () => void;
  template?: ReportTemplate;
  onSave?: (template: ReportTemplate) => void;
}

export function ReportTemplateBuilder({ open, onClose, template, onSave }: ReportTemplateBuilderProps) {
  const [activeTab, setActiveTab] = useState('structure');
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial State
  const [templateData, setTemplateData] = useState<ReportTemplate>({
    name: '',
    description: '',
    category: 'Custom',
    frequency: 'As needed',
    sections: [],
    settings: {
      pageSize: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
      includeLogo: true,
      includeSignature: false,
      colorScheme: 'default'
    }
  });

  // Load or Reset Data
  useEffect(() => {
    if (open) {
      if (template) {
        setTemplateData(JSON.parse(JSON.stringify(template)));
      } else {
        setTemplateData({
          name: '',
          description: '',
          category: 'Custom',
          frequency: 'As needed',
          sections: [],
          settings: {
            pageSize: 'A4',
            orientation: 'portrait',
            includeHeader: true,
            includeFooter: true,
            includeLogo: true,
            includeSignature: false,
            colorScheme: 'default'
          }
        });
      }
      setActiveTab('structure');
      setShowPreview(false);
    }
  }, [open, template]);

  const handleSave = () => {
    if (!templateData.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (templateData.sections.length === 0) {
      toast.error('Please add at least one section');
      return;
    }

    setIsSubmitting(true);

    if (template?.id) {
        router.patch(route('admin.reports.templates.update', template.id), templateData as any, {
            onSuccess: () => {
                toast.success(`Template "${templateData.name}" updated successfully`);
                onClose();
                setIsSubmitting(false);
            },
            onError: (errors) => {
                toast.error('Failed to update template');
                console.error(errors);
                setIsSubmitting(false);
            }
        });
    } else {
        router.post(route('admin.reports.templates.store'), templateData as any, {
            onSuccess: () => {
                toast.success(`Template "${templateData.name}" created successfully`);
                onClose();
                setIsSubmitting(false);
            },
            onError: (errors) => {
                toast.error('Failed to create template');
                console.error(errors);
                setIsSubmitting(false);
            }
        });
    }
  };

  const handleDuplicate = () => {
    const duplicatedTemplate = {
      ...templateData,
      name: `${templateData.name} (Copy)`,
      id: undefined
    };
    setTemplateData(duplicatedTemplate);
    toast.success('Template duplicated. Click Save to create.');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[98vw] w-[98vw] h-[95vh] flex flex-col p-0 gap-0 overflow-hidden [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-[20px]">
                  {template ? 'Edit Report Template' : 'Create Report Template'}
                </DialogTitle>
                {template && <Badge variant="outline" className="text-[11px]">Editing: {template.name}</Badge>}
              </div>
              <DialogDescription className="mt-1">
                {template ? 'Modify the template structure and settings' : 'Build custom report templates with sections and fields'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="size-4 mr-2" />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              {template && (
                <Button variant="outline" size="sm" onClick={handleDuplicate}>
                  <Copy className="size-4 mr-2" /> Duplicate
                </Button>
              )}

              <div className="ml-2 flex items-center border-l border-neutral-200 pl-3 h-6">
                <Button variant="ghost" size="icon" onClick={onClose} className="size-8">
                    <X className="size-5 text-neutral-500" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content Area */}
        {showPreview ? (
          <TemplatePreview template={templateData} />
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 border-b bg-white">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-transparent p-0 h-auto w-full justify-start">
                  <TabsTrigger value="structure" className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-3 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    <Layout className="size-4 mr-2" /> Structure
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-4 py-3 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                    <Settings className="size-4 mr-2" /> Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/30">
              {activeTab === 'structure' && (
                <TemplateStructure template={templateData} setTemplate={setTemplateData} />
              )}
              {activeTab === 'settings' && (
                <TemplateSettings template={templateData} setTemplate={setTemplateData} />
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-white shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSave} className="bg-black hover:bg-black/90" disabled={isSubmitting}>
            <Save className="size-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
