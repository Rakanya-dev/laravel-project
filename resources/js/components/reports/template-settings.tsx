import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReportTemplate, CATEGORY_OPTIONS, FREQUENCY_OPTIONS, COLOR_SCHEMES } from '@/constants/report-types';

interface TemplateSettingsProps {
  template: ReportTemplate;
  setTemplate: React.Dispatch<React.SetStateAction<ReportTemplate>>;
}

export function TemplateSettings({ template, setTemplate }: TemplateSettingsProps) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-[14px]">Report Output Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={template.category} onValueChange={(val) => setTemplate(prev => ({ ...prev, category: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={template.frequency} onValueChange={(val) => setTemplate(prev => ({ ...prev, frequency: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map(freq => <SelectItem key={freq} value={freq}>{freq}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Page Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select value={template.settings.pageSize} onValueChange={(val: any) => setTemplate(prev => ({ ...prev, settings: { ...prev.settings, pageSize: val } }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Orientation</Label>
              <Select value={template.settings.orientation} onValueChange={(val: any) => setTemplate(prev => ({ ...prev, settings: { ...prev.settings, orientation: val } }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Colors */}
          <div className="space-y-3">
            <Label>Color Scheme</Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {COLOR_SCHEMES.map((scheme) => (
                <button
                  key={scheme.value}
                  onClick={() => setTemplate(prev => ({ ...prev, settings: { ...prev.settings, colorScheme: scheme.value } }))}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    template.settings.colorScheme === scheme.value ? 'border-black bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="size-6 rounded-full shadow-sm" style={{ backgroundColor: scheme.color }} />
                  <span className="text-[10px] font-medium">{scheme.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-4">
            <Label>Include in Report PDF</Label>
            <div className="grid grid-cols-2 gap-4">
              <ToggleRow label="Show Header" checked={template.settings.includeHeader} onChange={(c) => setTemplate(p => ({...p, settings: {...p.settings, includeHeader: c}}))} />
              <ToggleRow label="Show Footer" checked={template.settings.includeFooter} onChange={(c) => setTemplate(p => ({...p, settings: {...p.settings, includeFooter: c}}))} />
              <ToggleRow label="Include Logo" checked={template.settings.includeLogo} onChange={(c) => setTemplate(p => ({...p, settings: {...p.settings, includeLogo: c}}))} />
              <ToggleRow label="Signature Lines" checked={template.settings.includeSignature} onChange={(c) => setTemplate(p => ({...p, settings: {...p.settings, includeSignature: c}}))} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
    return (
        <div className="flex items-center justify-between border p-3 rounded-lg">
            <Label className="cursor-pointer font-normal">{label}</Label>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}
