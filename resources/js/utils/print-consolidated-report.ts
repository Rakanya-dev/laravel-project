// resources/js/utils/print-consolidated-report.ts

import { toast } from 'sonner';

export interface StudentRow {
    id: number;
    name: string;
    age_years: number | null;
    age_months: number | null;
    gender: string;
    has_assessment: boolean;
    gross_motor: number | string;
    fine_motor: number | string;
    self_help: number | string;
    receptive: number | string;
    expressive: number | string;
    cognitive: number | string;
    socio_emotional: number | string;
    standard_score: number | string;
    interpretation: string;
}

export interface ConsolidatedReportData {
    rows: StudentRow[];
    currentType: string;
    daycareName: string;
    // 🚀 NEW: Accept the teacher's name
    teacherName?: string;
}

// 🚀 NEW: Helper to clean up empty/null data for printing
const formatData = (val: any) => {
    if (val === null || val === undefined || val === '') {
        return '&ndash;'; // HTML entity for a clean en-dash
    }
    return val;
};

export const generateConsolidatedReportPDF = (data: ConsolidatedReportData) => {
    // 🚀 EXTRACT teacherName
    const { rows, currentType, daycareName, teacherName } = data;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;

    if (!iframeDoc) {
        toast.error('Could not initialize printing.');
        document.body.removeChild(iframe);
        return;
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Consolidated_${currentType.replace(' ', '_')}</title>
            <style>
                /* Landscape Orientation for Master Sheets */
                @page { size: landscape; margin: 15mm; }
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    color: #000;
                    margin: 0;
                    padding: 0;
                    line-height: 1.3;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Official Header */
                .official-header { text-align: center; margin-bottom: 20px; }
                .official-header p { margin: 2px 0; font-size: 10px; text-transform: uppercase; }
                .official-header h1 { margin: 8px 0 4px 0; font-size: 18px; font-weight: bold; text-transform: uppercase; font-family: "Times New Roman", Times, serif; }
                .official-header h2 { margin: 0; font-size: 14px; font-weight: bold; }
                .meta-info { font-size: 11px; margin-top: 5px; font-style: italic; }

                /* Data Matrix */
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 2px solid #000; font-size: 9px; }
                th, td { border: 1px solid #000; padding: 5px 4px; vertical-align: middle; }

                /* Header Rows */
                thead th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
                .col-name { text-align: left; width: 15%; font-size: 10px; }
                .col-sm { width: 3%; }
                .col-domain { width: 6%; }
                .col-score { width: 7%; background-color: #e2e8f0; }
                .col-interp { width: 12%; text-align: left; font-style: italic; color: #333; } /* Added color to make dashes clear */

                /* Data Rows */
                .text-center { text-align: center; }
                .text-left { text-align: left; font-weight: bold; }

                /* Signatures */
                .signature-section { margin-top: 40px; display: flex; justify-content: space-between; padding: 0 50px; page-break-inside: avoid; }
                .sig-box { text-align: center; width: 35%; }
                .sig-line { border-bottom: 1px solid #000; margin-bottom: 5px; height: 30px; display: flex; align-items: flex-end; justify-content: center;}
                .sig-name { font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
                .sig-title { font-size: 10px; }

                .empty-state { text-align: center; padding: 30px; font-style: italic; color: #555; }
            </style>
        </head>
        <body>

            <div class="official-header">
                <p>Republic of the Philippines</p>
                <p>Early Childhood Care and Development Council</p>
                <h1>Class Consolidated Evaluation Report</h1>
                <h2>${daycareName || 'Daycare Center Name'}</h2>
                <div class="meta-info">Evaluation Period: ${currentType}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="2" class="col-name">Learner's Name</th>
                        <th rowspan="2" class="col-sm">Sex</th>
                        <th rowspan="2" class="col-sm">Age<br>(Mo)</th>
                        <th colspan="7">Scaled Scores per Domain</th>
                        <th rowspan="2" class="col-score">Standard<br>Score</th>
                        <th rowspan="2" class="col-interp" style="text-align: center;">Interpretation</th>
                    </tr>
                    <tr>
                        <th class="col-domain">Gross<br>Motor</th>
                        <th class="col-domain">Fine<br>Motor</th>
                        <th class="col-domain">Self<br>Help</th>
                        <th class="col-domain">Recep.<br>Lang.</th>
                        <th class="col-domain">Expr.<br>Lang.</th>
                        <th class="col-domain">Cognitive</th>
                        <th class="col-domain">Socio-<br>Emo.</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.length === 0 ? `<tr><td colspan="12" class="empty-state">No records found for this evaluation period.</td></tr>` : ''}
                    ${rows
                        .map(
                            (row) => `
                        <tr>
                            <td class="text-left">${row.name}</td>
                            <td class="text-center">${row.gender ? row.gender[0].toUpperCase() : '&ndash;'}</td>
                            <td class="text-center">${row.age_years !== null ? `${row.age_years}y ${row.age_months}m` : '&ndash;'}</td>

                            <td class="text-center">${formatData(row.gross_motor)}</td>
                            <td class="text-center">${formatData(row.fine_motor)}</td>
                            <td class="text-center">${formatData(row.self_help)}</td>
                            <td class="text-center">${formatData(row.receptive)}</td>
                            <td class="text-center">${formatData(row.expressive)}</td>
                            <td class="text-center">${formatData(row.cognitive)}</td>
                            <td class="text-center">${formatData(row.socio_emotional)}</td>

                            <td class="text-center font-bold" style="background-color: #f8fafc;">${formatData(row.standard_score)}</td>
                            <td class="col-interp" style="text-align: center;">${formatData(row.interpretation)}</td>
                        </tr>
                    `,
                        )
                        .join('')}
                </tbody>
            </table>

            <div class="signature-section">
                <div class="sig-box">
                    <div class="sig-line">
                        ${teacherName || '______________________________'}
                    </div>
                    <div class="sig-name"></div>
                    <div class="sig-title">Child Development Worker</div>
                </div>
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <div class="sig-name"></div>
                    <div class="sig-title">Center Head / Supervisor</div>
                </div>
            </div>

        </body>
        </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    setTimeout(() => {
        const win = iframe.contentWindow;
        if (win) {
            win.focus();
            win.print();
        }
        setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
};
