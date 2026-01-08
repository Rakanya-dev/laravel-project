import { Type, AlignLeft, Hash, Calendar, CheckSquare, FileText, Image as ImageIcon, BarChart3, Table as TableIcon } from 'lucide-react';

export interface TemplateField {
  id: string;
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'textarea' | 'image' | 'chart' | 'table';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
  collapsible?: boolean;
}

export interface ReportTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  sections: TemplateSection[];
  lastUsed?: string;
  settings: {
    pageSize: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    includeHeader: boolean;
    includeFooter: boolean;
    includeLogo: boolean;
    includeSignature: boolean;
    colorScheme: string;
  };
}

export const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: Type },
  { value: 'textarea', label: 'Text Area', icon: AlignLeft },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'select', label: 'Dropdown', icon: FileText },
  { value: 'image', label: 'Image', icon: ImageIcon },
  { value: 'chart', label: 'Chart', icon: BarChart3 },
  { value: 'table', label: 'Data Table', icon: TableIcon },
];

export const CATEGORY_OPTIONS = [
  'Monthly', 'Quarterly', 'Annual', 'Individual', 'Behavioral', 'Health', 'Communication', 'Custom'
];

export const FREQUENCY_OPTIONS = [
  'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annually', 'As needed'
];

export const COLOR_SCHEMES = [
  { value: 'default', label: 'Default (Blue)', color: '#3b82f6' },
  { value: 'green', label: 'Green', color: '#10b981' },
  { value: 'purple', label: 'Purple', color: '#8b5cf6' },
  { value: 'orange', label: 'Orange', color: '#f59e0b' },
  { value: 'red', label: 'Red', color: '#ef4444' },
  { value: 'gray', label: 'Grayscale', color: '#6b7280' },
];
