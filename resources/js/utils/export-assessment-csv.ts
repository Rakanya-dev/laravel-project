import { toast } from 'sonner';

//
export interface AssessmentCSVData {
    childName: string;
    evaluation: string;
    dateCreated: string;
    evaluator: string;
    status: string;
    standardScore: number;
    nextAssessmentDue: string;
    [key: string]: any;
}

export const generateAssessmentCSV = (assessments: AssessmentCSVData[], filenamePrefix: string = 'assessments_export') => {
    if (assessments.length === 0) {
        toast.error("No data to export.");
        return;
    }

    // Define CSV headers
    const headers = ['Child Name', 'Evaluation', 'Date', 'Evaluator', 'Status', 'Standard Score', 'Next Due'];

    // Map data to rows
    const rows = assessments.map(a => [
        `"${a.childName}"`,
        `"${a.evaluation}"`,
        `"${a.dateCreated}"`,
        `"${a.evaluator}"`,
        `"${a.status}"`,
        `"${a.standardScore}"`,
        `"${a.nextAssessmentDue || 'TBD'}"`
    ]);

    // Combine into CSV string
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${assessments.length} records to CSV`);
};
