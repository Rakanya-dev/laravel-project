// resources/js/utils/print-student-report.ts

import { formatAgeString, formatPHDate } from '@/utils/date';
import { toast } from 'sonner';

interface DomainScore {
    name?: string;
    domain_name?: string;
    domain?: { name: string };
    scaled_score: number | string;
    score?: number;
    raw_score?: number;
}

interface AssessmentRecord {
    id: number;
    type: string;
    date: string;
    age_months: number;
    standard_score: number;
    interpretation: string;
    domains: DomainScore[];
}

export interface StudentReportData {
    student: any;
    history: AssessmentRecord[];
    daycare: any;
    teacherName?: string; // 🚀 1. ADDED THIS: We will accept the teacher's name directly
}

const formatScore = (val: string | number | null | undefined) => {
    if (val === null || val === undefined || val === '') return '-';
    return Math.round(Number(val));
};

export const generateStudentReportPDF = (data: StudentReportData) => {
    // 🚀 2. EXTRACT IT HERE
    const { student, history, daycare, teacherName } = data;

    const record1 = history.find((r) => r.type.includes('1st'));
    const record2 = history.find((r) => r.type.includes('2nd'));
    const record3 = history.find((r) => r.type.includes('3rd'));

    // 🚀 3. USE IT DIRECTLY (with a fallback just in case)
    const evaluatorName = teacherName || 'Child Development Worker';

    const domainsList = [
        'Gross Motor',
        'Fine Motor',
        'Self-Help',
        'Receptive Language',
        'Expressive Language',
        'Cognitive',
        'Socio-Emotional'
    ];

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

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const currentYear = new Date().getFullYear();

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${student.last_name}_ECCD_Progress_Report</title>
            <style>
                @page { size: portrait; margin: 10mm; }

                body {
                    font-family: "Times New Roman", Times, serif;
                    font-size: 11px;
                    color: #111;
                    margin: 0;
                    padding: 0;
                    line-height: 1.3;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                .document-header {
                    text-align: center;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 3px double #000;
                }
                .document-header p { margin: 1px 0; font-size: 10px; text-transform: uppercase; font-weight: bold; color: #333; }
                .document-header h1 { margin: 8px 0 3px 0; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; }
                .document-header h2 { margin: 0; font-size: 13px; font-weight: normal; font-style: italic; color: #444; }

                .info-section {
                    font-family: Arial, Helvetica, sans-serif;
                    margin-bottom: 10px;
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 10.5px;
                }
                .info-section td { padding: 3px 4px; vertical-align: bottom; }
                .info-label { font-weight: bold; text-align: right; color: #4b5563; width: 12%; }
                .info-value { border-bottom: 1px solid #000; font-weight: bold; color: #111; }

                .legend-wrapper {
                    border: 1px solid #9ca3af;
                    background-color: #f8fafc;
                    margin-bottom: 12px;
                    border-radius: 2px;
                    font-family: Arial, Helvetica, sans-serif;
                    padding: 2px;
                }
                .legend-table { width: 100%; border-collapse: collapse; font-size: 9px; }
                .legend-table td { padding: 4px 8px; vertical-align: top; }
                .legend-title { font-weight: bold; font-size: 9.5px; text-transform: uppercase; margin-bottom: 4px; color: #1f2937; }
                .legend-badge { display: inline-block; width: 40px; font-weight: bold; }

                table.data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: Arial, Helvetica, sans-serif;
                    border: 1.5px solid #000;
                    margin-bottom: 15px;
                }
                .data-table th, .data-table td {
                    border: 1px solid #000;
                    padding: 5px;
                    vertical-align: middle;
                }
                .data-table th {
                    background-color: #e2e8f0;
                    font-size: 9.5px;
                    text-transform: uppercase;
                    text-align: center;
                }

                .col-domain { background-color: #f8fafc; font-weight: bold; text-align: left; width: 22%; font-size: 10.5px; }
                .col-score { text-align: center; font-size: 11px; width: 13%; }
                .col-scaled { text-align: center; font-size: 12px; font-weight: bold; width: 13%; background-color: #fafafa; }

                .sub-header th { font-size: 8.5px; font-weight: normal; background-color: #f1f5f9; letter-spacing: 0.5px; }
                .eval-meta { font-size: 8px; font-weight: normal; text-transform: none; display: block; margin-top: 2px; }

                .row-sum td { border-top: 2px solid #000; background-color: #f1f5f9; font-weight: bold; font-size: 11px; }
                .row-overall td { background-color: #e2e8f0; font-weight: bold; font-size: 12px; }
                .row-interp td { background-color: #f8fafc; font-style: italic; font-size: 10px; font-weight: bold; color: #334155; }

                .signature-table { width: 100%; border: none; page-break-inside: avoid; margin-top: 30px; }
                .signature-table td { border: none; text-align: center; padding: 5px 20px; vertical-align: bottom; height: 60px; }
                .sig-content { display: inline-block; width: 85%; }
                .sig-line {
                    border-bottom: 1px solid #000;
                    margin-bottom: 4px;
                    padding-bottom: 2px;
                    font-weight: bold;
                    text-transform: uppercase;
                    font-size: 11px;
                    font-family: Arial, sans-serif;
                }
                .sig-title { font-size: 10px; color: #4b5563; }
                .sig-label { font-size: 10px; text-align: left; margin-bottom: 30px; font-style: italic; color: #333; }

                .meta-text { font-size: 8.5px; color: #9ca3af; text-align: right; margin-top: 15px; font-family: Arial, sans-serif; text-transform: uppercase; }
            </style>
        </head>
        <body>

            <div class="document-header">
                <p>Republic of the Philippines</p>
                <p>Early Childhood Care and Development (ECCD) Program</p>
                <h1>CHILD'S DEVELOPMENTAL PROGRESS REPORT</h1>
                <h2>${daycare?.name || 'Child Development Center'}</h2>
            </div>

            <table class="info-section">
                <tr>
                    <td class="info-label">Name:</td>
                    <td class="info-value" colspan="3" style="width: 50%;">
                        ${student.last_name}, ${student.first_name} ${student.middle_name || ''}
                    </td>
                    <td class="info-label">Sex:</td>
                    <td class="info-value" style="width: 14%;">
                        ${student.gender || 'N/A'}
                    </td>
                </tr>
                <tr>
                    <td class="info-label">Date of Birth:</td>
                    <td class="info-value" style="width: 20%;">
                        ${student.date_of_birth ? formatPHDate(student.date_of_birth) : 'N/A'}
                    </td>
                    <td class="info-label">School Year:</td>
                    <td class="info-value" style="width: 18%;">
                        ${currentYear} - ${currentYear + 1}
                    </td>
                    <td class="info-label">Date Printed:</td>
                    <td class="info-value" style="width: 14%;">
                        ${currentDate}
                    </td>
                </tr>
            </table>

            <div class="legend-wrapper">
                <table class="legend-table">
                    <tr>
                        <td style="width: 50%; border-right: 1px dashed #cbd5e1;">
                            <div class="legend-title">Scaled Score Interpretation (Per Domain)</div>
                            <span class="legend-badge">17 - 19</span> : Highly Advanced Development<br>
                            <span class="legend-badge">14 - 16</span> : Slightly Advanced Development<br>
                            <span class="legend-badge">7 - 13</span> : Average Development<br>
                            <span class="legend-badge">4 - 6</span> : Slight Delay in Development<br>
                            <span class="legend-badge">1 - 3</span> : Significant Delay in Development
                        </td>
                        <td style="width: 50%;">
                            <div class="legend-title">Standard Score Interpretation (Overall)</div>
                            <span class="legend-badge" style="width: 75px;">130 & above</span> : Highly Advanced Development<br>
                            <span class="legend-badge" style="width: 75px;">120 - 129</span> : Slightly Advanced Development<br>
                            <span class="legend-badge" style="width: 75px;">80 - 119</span> : Average Development<br>
                            <span class="legend-badge" style="width: 75px;">70 - 79</span> : Slight Delay in Development<br>
                            <span class="legend-badge" style="width: 75px;">69 & below</span> : Significant Delay in Development
                        </td>
                    </tr>
                </table>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th rowspan="2" class="col-domain" style="text-align: center;">DEVELOPMENTAL DOMAINS</th>
                        <th colspan="2">
                            ${record1?.type?.toUpperCase() || '1ST EVALUATION'}
                            ${record1 ? `<span class="eval-meta">${formatPHDate(record1.date)}<br>Age: ${formatAgeString(record1.age_months, student.date_of_birth, record1.date)}</span>` : '<span class="eval-meta">-</span>'}
                        </th>
                        <th colspan="2">
                            ${record2?.type?.toUpperCase() || '2ND EVALUATION'}
                            ${record2 ? `<span class="eval-meta">${formatPHDate(record2.date)}<br>Age: ${formatAgeString(record2.age_months, student.date_of_birth, record2.date)}</span>` : '<span class="eval-meta">-</span>'}
                        </th>
                        <th colspan="2">
                            ${record3?.type?.toUpperCase() || '3RD EVALUATION'}
                            ${record3 ? `<span class="eval-meta">${formatPHDate(record3.date)}<br>Age: ${formatAgeString(record3.age_months, student.date_of_birth, record3.date)}</span>` : '<span class="eval-meta">-</span>'}
                        </th>
                    </tr>
                    <tr class="sub-header">
                        <th>Raw</th>
                        <th>Scaled</th>
                        <th>Raw</th>
                        <th>Scaled</th>
                        <th>Raw</th>
                        <th>Scaled</th>
                    </tr>
                </thead>
                <tbody>
                    ${domainsList
                        .map((domainName, index) => {
                            const findDomain = (record: any) => {
                                if (!record || !record.domains) return null;
                                return record.domains.find((d: any) => {
                                    const dbName = String(d.name || d.domain_name || d.domain?.name || '');
                                    const normalize = (str: string) => str.toLowerCase().replace(/[- ]/g, '');
                                    return normalize(dbName) === normalize(domainName);
                                });
                            };

                            const d1 = findDomain(record1);
                            const d2 = findDomain(record2);
                            const d3 = findDomain(record3);

                            return `
                                <tr>
                                    <td class="col-domain">${index + 1}. ${domainName}</td>
                                    <td class="col-score">${d1 ? formatScore(d1.score ?? d1.raw_score) : '-'}</td>
                                    <td class="col-scaled">${d1 ? (d1.scaled_score ?? '-') : '-'}</td>
                                    <td class="col-score">${d2 ? formatScore(d2.score ?? d2.raw_score) : '-'}</td>
                                    <td class="col-scaled">${d2 ? (d2.scaled_score ?? '-') : '-'}</td>
                                    <td class="col-score">${d3 ? formatScore(d3.score ?? d3.raw_score) : '-'}</td>
                                    <td class="col-scaled">${d3 ? (d3.scaled_score ?? '-') : '-'}</td>
                                </tr>
                            `;
                        })
                        .join('')}
                </tbody>
                <tfoot>
                    <tr class="row-sum">
                        <td class="col-domain" style="text-align: right; padding-right: 15px; background-color: transparent;">SUM OF SCALED SCORES:</td>
                        <td colspan="2" class="col-scaled" style="background-color: transparent;">
                            ${record1 ? record1.domains.reduce((sum, d) => sum + (Number(d.scaled_score) || 0), 0) : '-'}
                        </td>
                        <td colspan="2" class="col-scaled" style="background-color: transparent;">
                            ${record2 ? record2.domains.reduce((sum, d) => sum + (Number(d.scaled_score) || 0), 0) : '-'}
                        </td>
                        <td colspan="2" class="col-scaled" style="background-color: transparent;">
                            ${record3 ? record3.domains.reduce((sum, d) => sum + (Number(d.scaled_score) || 0), 0) : '-'}
                        </td>
                    </tr>

                    <tr class="row-overall">
                        <td class="col-domain" style="text-align: right; padding-right: 15px; background-color: transparent;">OVERALL STANDARD SCORE:</td>
                        <td colspan="2" class="col-scaled" style="font-size: 14px; background-color: transparent;">${record1?.standard_score || '-'}</td>
                        <td colspan="2" class="col-scaled" style="font-size: 14px; background-color: transparent;">${record2?.standard_score || '-'}</td>
                        <td colspan="2" class="col-scaled" style="font-size: 14px; background-color: transparent;">${record3?.standard_score || '-'}</td>
                    </tr>

                    <tr class="row-interp">
                        <td class="col-domain" style="text-align: right; padding-right: 15px; background-color: transparent;">INTERPRETATION:</td>
                        <td colspan="2" class="col-scaled" style="font-weight: bold; background-color: transparent; font-size: 10px; color: #334155;">${record1?.interpretation || '-'}</td>
                        <td colspan="2" class="col-scaled" style="font-weight: bold; background-color: transparent; font-size: 10px; color: #334155;">${record2?.interpretation || '-'}</td>
                        <td colspan="2" class="col-scaled" style="font-weight: bold; background-color: transparent; font-size: 10px; color: #334155;">${record3?.interpretation || '-'}</td>
                    </tr>
                </tfoot>
            </table>

            <table class="signature-table">
                <tr>
                    <td>
                        <div class="sig-content">
                            <div class="sig-label">Evaluated by:</div>
                            <div class="sig-line">
                                ${evaluatorName}
                            </div>
                            <div class="sig-title">Daycare Teacher / Evaluator</div>
                        </div>
                    </td>
                    <td>
                        <div class="sig-content">
                            <div class="sig-label">Acknowledged by:</div>
                            <div class="sig-line">
                                &nbsp;
                            </div>
                            <div class="sig-title">Parent / Guardian Signature</div>
                        </div>
                    </td>
                </tr>
            </table>

            <div class="meta-text">
                System Generated Document • Learner ID: ${student.id || 'N/A'}
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
