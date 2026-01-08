import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportTemplate } from '@/constants/report-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Table as TableIcon, Image as ImageIcon, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have this or use standard input

const MOCK_CHART_DATA = [
  { name: 'Jan', value: 40 }, { name: 'Feb', value: 30 }, { name: 'Mar', value: 65 },
  { name: 'Apr', value: 45 }, { name: 'May', value: 80 }, { name: 'Jun', value: 55 },
];

export function TemplatePreview({ template }: { template: ReportTemplate }) {

  const isFullWidth = (type: string) => ['textarea', 'chart', 'table', 'image'].includes(type);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/50">
      <div className="max-w-[800px] mx-auto space-y-6">
        <Card>
          <CardHeader className="border-b bg-white">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{template.name || 'Untitled Template'}</CardTitle>
                <p className="text-[13px] text-neutral-600 mt-1">{template.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{template.category}</Badge>
                <Badge variant="outline">{template.frequency}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {template.settings.includeHeader && (
              <div className="flex justify-between items-center border-b pb-4 mb-6 border-gray-100">
                <div className="text-sm font-bold uppercase text-gray-400">Header Area</div>
                {template.settings.includeLogo && <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[10px]">Logo</div>}
              </div>
            )}

            {template.sections.length === 0 ? (
              <div className="text-center py-12 text-neutral-500"><p>No sections added yet</p></div>
            ) : (
              template.sections.map((section) => (
                <div key={section.id} className="space-y-4">
                  <div>
                    <h3 className="text-[18px] font-semibold mb-1">{section.title}</h3>
                    {section.description && <p className="text-[13px] text-neutral-600">{section.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.fields.map((field) => (
                      <div key={field.id} className={`space-y-2 ${isFullWidth(field.type) ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}>
                        <Label className="text-sm font-medium flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>

                        <div className="pointer-events-none opacity-80">
                          {field.type === 'textarea' ? (
                            <Textarea className="min-h-[80px]" placeholder={field.placeholder} />
                          ) : field.type === 'select' ? (
                              <Select>
                                <SelectTrigger><SelectValue placeholder={field.placeholder || "Select option"} /></SelectTrigger>
                                <SelectContent>
                                    {(field.options || ['Option 1', 'Option 2']).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                              </Select>
                          ) : field.type === 'checkbox' ? (
                            <div className="space-y-2">
                                {(field.options && field.options.length > 0 ? field.options : ['Option 1']).map((opt, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <div className="h-4 w-4 rounded border border-gray-300 bg-white"></div>
                                        <span className="text-sm font-medium leading-none">{opt}</span>
                                    </div>
                                ))}
                            </div>
                          ) : field.type === 'chart' ? (
                            <div className="h-[200px] w-full rounded-md border border-input bg-white p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={MOCK_CHART_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                        <Bar dataKey="value" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                          ) : (
                            <Input placeholder={field.placeholder} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              ))
            )}

            {template.settings.includeFooter && (
               <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">Footer Content Area • Page 1 of 1</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
