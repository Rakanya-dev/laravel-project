import { toast } from 'sonner';

// Define the data structure needed for the PDF
export interface AssessmentExportData {
    childName: string;
    dateCreated: string;
    evaluator: string;
    evaluation: string;
    standardScore: number;
    sumOfScaled: number;
    domainScores: {
        domain: string;
        rawScore: number;
        scaledScore: number;
        interpretation: string;
    }[];
    assessmentSummary: string;
    recommendation: string;
    nextAssessmentDue: string;
}

export const generateAssessmentPDF = (data: AssessmentExportData) => {
    // 1. Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    // 2. Append to body to make it active
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;

    if (!iframeDoc) {
        toast.error("Could not initialize printing.");
        document.body.removeChild(iframe);
        return;
    }

    // 3. Construct the HTML content
    const htmlContent = `
      <html>
        <head>
          <title>Assessment Report - ${data.childName}</title>
          <style>
            /* Print-friendly styles */
            body { font-family: sans-serif; padding: 40px; color: #1e293b; background: white; }
            h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }

            /* Meta Grid */
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .meta-item { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 600; }

            /* Table */
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            th { text-align: left; background: #f1f5f9; padding: 12px; font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #e2e8f0; }
            td { border-bottom: 1px solid #e2e8f0; padding: 12px; color: #334155; font-size: 14px; }
            tr:nth-child(even) { background: #f8fafc; }
            .score-badge { background: #eff6ff; color: #1d4ed8; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

            /* Boxes */
            .section-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; background: #fff; break-inside: avoid; }
            .section-title { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; }

            /* Score Banner */
            .std-score-box { text-align: center; background: #1e293b !important; color: white !important; padding: 20px; border-radius: 12px; margin-bottom: 30px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .std-score-val { font-size: 48px; font-weight: 800; line-height: 1; margin: 10px 0; }

            /* Force background colors to print */
            @media print {
                body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <h1>Developmental Assessment Report</h1>

          <div class="meta">
            <div class="meta-item"><div class="label">Student</div><div class="value">${data.childName}</div></div>
            <div class="meta-item"><div class="label">Date</div><div class="value">${data.dateCreated}</div></div>
            <div class="meta-item"><div class="label">Evaluator</div><div class="value">${data.evaluator}</div></div>
            <div class="meta-item"><div class="label">Evaluation</div><div class="value">${data.evaluation}</div></div>
          </div>

          <div class="std-score-box">
            <div class="label" style="color: #94a3b8;">Standard Score</div>
            <div class="std-score-val">${data.standardScore}</div>
            <div style="font-size: 14px; color: #cbd5e1;">Sum of Scaled Scores: ${data.sumOfScaled}</div>
          </div>

          <h3>Domain Scores</h3>
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th style="text-align: center;">Raw Score</th>
                <th style="text-align: center;">Scaled Score</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              ${data.domainScores.map(d => `
                <tr>
                  <td><b>${d.domain}</b></td>
                  <td style="text-align: center;">${d.rawScore}</td>
                  <td style="text-align: center;"><span class="score-badge">${d.scaledScore}</span></td>
                  <td>${d.interpretation}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-box" style="border-left: 4px solid #3b82f6;">
            <div class="section-title" style="color: #1d4ed8;">Assessment Summary</div>
            <div>${data.assessmentSummary || 'N/A'}</div>
          </div>

          <div class="section-box" style="border-left: 4px solid #22c55e;">
            <div class="section-title" style="color: #15803d;">Recommendation</div>
            <div>${data.recommendation || 'N/A'}</div>
          </div>

          <div class="section-box" style="border-left: 4px solid #f97316;">
            <div class="section-title" style="color: #c2410c;">Next Assessment Due</div>
            <div>${data.nextAssessmentDue || 'TBD'}</div>
          </div>

          <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8;">
              Generated by KIDTRAK Assessment System
          </div>
        </body>
      </html>
    `;

    // 4. Write content and Trigger Print
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait a moment for styles to apply/render
    setTimeout(() => {
        const win = iframe.contentWindow;
        if (win) {
            win.focus();
            win.print();
        }
        // Cleanup after printing is initiated
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }, 500);
};
