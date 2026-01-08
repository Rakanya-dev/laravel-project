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
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  lastUsed?: string;
  sections: TemplateSection[];
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

// Core templates for centralized assessment record management
export const defaultTemplates: ReportTemplate[] = [
  {
    id: 'template-1',
    name: 'Monthly Progress Report',
    description: 'Comprehensive monthly assessment summary for individual children',
    category: 'Monthly',
    frequency: 'Monthly',
    lastUsed: '2 days ago',
    sections: [
      {
        id: 'section-1',
        title: 'Child Information',
        description: 'Basic demographic and enrollment details',
        fields: [
          { id: 'f1', type: 'text', label: 'Child Name', placeholder: 'Enter full name', required: true },
          { id: 'f2', type: 'date', label: 'Report Date', placeholder: '', required: true },
          { id: 'f3', type: 'text', label: 'Age', placeholder: 'e.g., 4 years', required: true },
          { id: 'f4', type: 'select', label: 'Daycare Center', placeholder: 'Select center', required: true },
          { id: 'f5', type: 'text', label: 'Teacher Name', placeholder: 'Enter teacher name', required: true },
        ]
      },
      {
        id: 'section-2',
        title: 'Developmental Domains',
        description: 'Assessment across key developmental areas',
        fields: [
          { id: 'f6', type: 'number', label: 'Cognitive Development Score', placeholder: '0-100', required: true },
          { id: 'f7', type: 'textarea', label: 'Cognitive Observations', placeholder: 'Describe cognitive progress...', required: false },
          { id: 'f8', type: 'number', label: 'Physical Development Score', placeholder: '0-100', required: true },
          { id: 'f9', type: 'textarea', label: 'Physical Observations', placeholder: 'Describe physical progress...', required: false },
          { id: 'f10', type: 'number', label: 'Social-Emotional Score', placeholder: '0-100', required: true },
          { id: 'f11', type: 'textarea', label: 'Social-Emotional Observations', placeholder: 'Describe social progress...', required: false },
        ]
      },
      {
        id: 'section-3',
        title: 'Progress Summary',
        description: 'Overall assessment and recommendations',
        fields: [
          { id: 'f12', type: 'chart', label: 'Monthly Trend Chart', placeholder: '', required: false },
          { id: 'f13', type: 'textarea', label: 'Strengths', placeholder: 'List child\'s strengths...', required: true },
          { id: 'f14', type: 'textarea', label: 'Areas for Growth', placeholder: 'List areas for improvement...', required: true },
          { id: 'f15', type: 'textarea', label: 'Recommendations', placeholder: 'Provide recommendations...', required: true },
        ]
      }
    ],
    settings: {
      pageSize: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
      includeLogo: true,
      includeSignature: true,
      colorScheme: 'default'
    }
  },
  {
    id: 'template-2',
    name: 'Quarterly Developmental Assessment',
    description: 'Detailed quarterly evaluation across all developmental domains',
    category: 'Quarterly',
    frequency: 'Quarterly',
    lastUsed: '1 week ago',
    sections: [
      {
        id: 'section-1',
        title: 'Assessment Information',
        fields: [
          { id: 'f1', type: 'text', label: 'Child Name', required: true },
          { id: 'f2', type: 'date', label: 'Assessment Date', required: true },
          { id: 'f3', type: 'text', label: 'Assessor Name', required: true },
          { id: 'f4', type: 'select', label: 'Quarter', required: true },
          { id: 'f5', type: 'text', label: 'Age Group', required: true },
        ]
      },
      {
        id: 'section-2',
        title: 'Cognitive Development',
        description: 'Problem-solving, memory, and learning abilities',
        fields: [
          { id: 'f6', type: 'number', label: 'Cognitive Score', placeholder: '0-100', required: true },
          { id: 'f7', type: 'checkbox', label: 'Problem-Solving Skills', required: false },
          { id: 'f8', type: 'checkbox', label: 'Memory & Recall', required: false },
          { id: 'f9', type: 'checkbox', label: 'Attention Span', required: false },
          { id: 'f10', type: 'textarea', label: 'Detailed Observations', placeholder: 'Cognitive development notes...', required: true },
        ]
      },
      {
        id: 'section-3',
        title: 'Motor Skills Development',
        description: 'Fine and gross motor skill assessment',
        fields: [
          { id: 'f11', type: 'number', label: 'Fine Motor Score', placeholder: '0-100', required: true },
          { id: 'f12', type: 'number', label: 'Gross Motor Score', placeholder: '0-100', required: true },
          { id: 'f13', type: 'textarea', label: 'Motor Skills Observations', placeholder: 'Describe motor skills...', required: true },
          { id: 'f14', type: 'chart', label: 'Motor Skills Progress Chart', required: false },
        ]
      },
      {
        id: 'section-4',
        title: 'Language & Communication',
        fields: [
          { id: 'f15', type: 'number', label: 'Language Score', placeholder: '0-100', required: true },
          { id: 'f16', type: 'checkbox', label: 'Expressive Language', required: false },
          { id: 'f17', type: 'checkbox', label: 'Receptive Language', required: false },
          { id: 'f18', type: 'textarea', label: 'Language Observations', placeholder: 'Communication development...', required: true },
        ]
      },
      {
        id: 'section-5',
        title: 'Action Plan',
        fields: [
          { id: 'f19', type: 'textarea', label: 'Goals for Next Quarter', placeholder: 'List goals...', required: true },
          { id: 'f20', type: 'textarea', label: 'Recommended Activities', placeholder: 'Activities to support development...', required: true },
          { id: 'f21', type: 'date', label: 'Next Assessment Date', required: true },
        ]
      }
    ],
    settings: {
      pageSize: 'Letter',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
      includeLogo: true,
      includeSignature: true,
      colorScheme: 'green'
    }
  },
  {
    id: 'template-3',
    name: 'Annual Summary Report',
    description: 'Year-end comprehensive developmental summary',
    category: 'Annual',
    frequency: 'Annually',
    lastUsed: '3 weeks ago',
    sections: [
      {
        id: 'section-1',
        title: 'Student Overview',
        fields: [
          { id: 'f1', type: 'text', label: 'Child Name', required: true },
          { id: 'f2', type: 'date', label: 'Report Year', required: true },
          { id: 'f3', type: 'text', label: 'Starting Age', required: true },
          { id: 'f4', type: 'text', label: 'Current Age', required: true },
          { id: 'f5', type: 'text', label: 'Primary Teacher', required: true },
        ]
      },
      {
        id: 'section-2',
        title: 'Year-Long Progress',
        description: 'Overall development throughout the year',
        fields: [
          { id: 'f6', type: 'chart', label: 'Annual Progress Chart', required: true },
          { id: 'f7', type: 'table', label: 'Domain Scores Comparison', required: true },
          { id: 'f8', type: 'textarea', label: 'Major Achievements', placeholder: 'Key milestones reached...', required: true },
          { id: 'f9', type: 'textarea', label: 'Growth Areas', placeholder: 'Areas of significant growth...', required: true },
        ]
      },
      {
        id: 'section-3',
        title: 'Social & Behavioral Summary',
        fields: [
          { id: 'f10', type: 'textarea', label: 'Peer Interactions', placeholder: 'Social relationships...', required: true },
          { id: 'f11', type: 'textarea', label: 'Behavioral Patterns', placeholder: 'Behavior observations...', required: true },
          { id: 'f12', type: 'textarea', label: 'Emotional Regulation', placeholder: 'Emotional development...', required: true },
        ]
      },
      {
        id: 'section-4',
        title: 'Recommendations for Next Year',
        fields: [
          { id: 'f13', type: 'textarea', label: 'Development Goals', placeholder: 'Goals for next year...', required: true },
          { id: 'f14', type: 'textarea', label: 'Parent Involvement Suggestions', placeholder: 'How parents can support...', required: true },
          { id: 'f15', type: 'checkbox', label: 'Ready for Next Level', required: false },
        ]
      }
    ],
    settings: {
      pageSize: 'Letter',
      orientation: 'landscape',
      includeHeader: true,
      includeFooter: true,
      includeLogo: true,
      includeSignature: true,
      colorScheme: 'purple'
    }
  },
  {
    id: 'template-4',
    name: 'Daily Activity Report',
    description: 'Quick daily summary for parent communication',
    category: 'Communication',
    frequency: 'Daily',
    lastUsed: 'Today',
    sections: [
      {
        id: 'section-1',
        title: 'Daily Information',
        fields: [
          { id: 'f1', type: 'text', label: 'Child Name', required: true },
          { id: 'f2', type: 'date', label: 'Date', required: true },
          { id: 'f3', type: 'text', label: 'Teacher', required: true },
        ]
      },
      {
        id: 'section-2',
        title: 'Activities & Learning',
        fields: [
          { id: 'f4', type: 'textarea', label: 'Morning Activities', placeholder: 'Activities completed...', required: true },
          { id: 'f5', type: 'textarea', label: 'Afternoon Activities', placeholder: 'Activities completed...', required: true },
          { id: 'f6', type: 'textarea', label: 'Learning Highlights', placeholder: 'What we learned today...', required: true },
        ]
      },
      {
        id: 'section-3',
        title: 'Meals & Rest',
        fields: [
          { id: 'f7', type: 'select', label: 'Breakfast', required: true },
          { id: 'f8', type: 'select', label: 'Lunch', required: true },
          { id: 'f9', type: 'select', label: 'Snack', required: true },
          { id: 'f10', type: 'text', label: 'Nap Duration', placeholder: 'e.g., 2 hours', required: false },
        ]
      },
      {
        id: 'section-4',
        title: 'Daily Notes',
        fields: [
          { id: 'f11', type: 'textarea', label: 'Mood & Behavior', placeholder: 'How was the child today...', required: true },
          { id: 'f12', type: 'textarea', label: 'Special Notes', placeholder: 'Anything parents should know...', required: false },
          { id: 'f13', type: 'checkbox', label: 'Diaper Changes Completed', required: false },
        ]
      }
    ],
    settings: {
      pageSize: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: false,
      includeLogo: true,
      includeSignature: false,
      colorScheme: 'default'
    }
  },
  {
    id: 'template-5',
    name: 'Parent-Teacher Conference Form',
    description: 'Structured form for parent-teacher meetings',
    category: 'Communication',
    frequency: 'Quarterly',
    lastUsed: '2 weeks ago',
    sections: [
      {
        id: 'section-1',
        title: 'Meeting Information',
        fields: [
          { id: 'f1', type: 'text', label: 'Child Name', required: true },
          { id: 'f2', type: 'date', label: 'Conference Date', required: true },
          { id: 'f3', type: 'text', label: 'Teacher Name', required: true },
          { id: 'f4', type: 'text', label: 'Parent/Guardian Names', required: true },
        ]
      },
      {
        id: 'section-2',
        title: 'Discussion Topics',
        fields: [
          { id: 'f5', type: 'textarea', label: 'Academic Progress', placeholder: 'Current performance...', required: true },
          { id: 'f6', type: 'textarea', label: 'Social Development', placeholder: 'Peer interactions...', required: true },
          { id: 'f7', type: 'textarea', label: 'Behavioral Observations', placeholder: 'Behavior patterns...', required: true },
        ]
      },
      {
        id: 'section-3',
        title: 'Parent Input',
        fields: [
          { id: 'f8', type: 'textarea', label: 'Parent Questions/Concerns', placeholder: 'Questions raised...', required: false },
          { id: 'f9', type: 'textarea', label: 'Home Observations', placeholder: 'Parent feedback...', required: false },
        ]
      },
      {
        id: 'section-4',
        title: 'Action Items',
        fields: [
          { id: 'f10', type: 'textarea', label: 'Goals Set', placeholder: 'Goals discussed...', required: true },
          { id: 'f11', type: 'textarea', label: 'Teacher Action Items', placeholder: 'Teacher will...', required: false },
          { id: 'f12', type: 'textarea', label: 'Parent Action Items', placeholder: 'Parents will...', required: false },
          { id: 'f13', type: 'date', label: 'Next Meeting Date', required: false },
        ]
      }
    ],
    settings: {
      pageSize: 'Letter',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
      includeLogo: true,
      includeSignature: true,
      colorScheme: 'default'
    }
  },
  {
    id: 'template-6',
    name: 'Incident Report',
    description: 'Documentation of incidents or accidents',
    category: 'Safety',
    frequency: 'As needed',
    lastUsed: '4 days ago',
    sections: [
      {
        id: 'section-1',
        title: 'Incident Details',
        fields: [
          { id: 'f1', type: 'text', label: 'Child Name', required: true },
          { id: 'f2', type: 'date', label: 'Incident Date', required: true },
          { id: 'f3', type: 'text', label: 'Time of Incident', placeholder: 'e.g., 10:30 AM', required: true },
          { id: 'f4', type: 'text', label: 'Location', placeholder: 'Where it occurred', required: true },
          { id: 'f5', type: 'text', label: 'Witness(es)', placeholder: 'Names of witnesses', required: false },
        ]
      },
      {
        id: 'section-2',
        title: 'Incident Description',
        fields: [
          { id: 'f6', type: 'select', label: 'Type of Incident', required: true },
          { id: 'f7', type: 'textarea', label: 'Detailed Description', placeholder: 'What happened...', required: true },
          { id: 'f8', type: 'textarea', label: 'Circumstances Leading to Incident', placeholder: 'What was happening before...', required: true },
        ]
      },
      {
        id: 'section-3',
        title: 'Injury/Impact Assessment',
        fields: [
          { id: 'f9', type: 'checkbox', label: 'No Injury', required: false },
          { id: 'f10', type: 'checkbox', label: 'Minor Injury', required: false },
          { id: 'f11', type: 'checkbox', label: 'Requires Medical Attention', required: false },
          { id: 'f12', type: 'textarea', label: 'Injury Description', placeholder: 'Describe any injuries...', required: false },
        ]
      },
      {
        id: 'section-4',
        title: 'Actions Taken',
        fields: [
          { id: 'f13', type: 'textarea', label: 'Immediate Response', placeholder: 'Actions taken immediately...', required: true },
          { id: 'f14', type: 'textarea', label: 'First Aid Provided', placeholder: 'Treatment given...', required: false },
          { id: 'f15', type: 'checkbox', label: 'Parent Notified', required: true },
          { id: 'f16', type: 'text', label: 'Parent Contact Time', placeholder: 'Time parent was called', required: false },
        ]
      },
      {
        id: 'section-5',
        title: 'Follow-up',
        fields: [
          { id: 'f17', type: 'textarea', label: 'Prevention Measures', placeholder: 'How to prevent in future...', required: true },
          { id: 'f18', type: 'text', label: 'Reported By', placeholder: 'Staff member name', required: true },
          { id: 'f19', type: 'text', label: 'Supervisor Review', placeholder: 'Supervisor name', required: false },
        ]
      }
    ],
    settings: {
      pageSize: 'A4',
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
      includeLogo: true,
      includeSignature: true,
      colorScheme: 'red'
    }
  }
];
