import { toast } from 'sonner';

// --- FIELD MAPPING ---
// Maps raw IDs to readable labels
const FIELD_MAP: Record<string, string> = {
    'f1': 'Child Name', 'f2': 'Report Date', 'f3': 'Age', 'f4': 'Daycare Center/Quarter', 'f5': 'Teacher Name',
    'f6': 'Cognitive Score', 'f7': 'Cognitive Obs.', 'f8': 'Physical Score', 'f9': 'Physical Obs.',
    'f10': 'Social Score', 'f11': 'Social Obs.',
    'f12': 'Monthly Trend', 'f13': 'Strengths', 'f14': 'Areas for Growth', 'f15': 'Recommendations',
    'f16': 'Expressive Lang.', 'f17': 'Receptive Lang.', 'f18': 'Language Obs.',
    'f19': 'Next Goals', 'f20': 'Activities', 'f21': 'Next Due Date',
    'i1': 'Incident Date', 'i2': 'Time', 'i3': 'Location', 'i4': 'Description', 'i5': 'Action Taken', 'i6': 'Parents Notified',
    'i7': 'Incident Type', 'i8': 'Circumstances', 'i9': 'No Injury', 'i10': 'Minor Injury', 'i11': 'Medical Attention',
    'i12': 'Injury Desc', 'i13': 'Immediate Response', 'i14': 'First Aid', 'i15': 'Parent Notified',
    'i16': 'Contact Time', 'i17': 'Prevention', 'i18': 'Reported By', 'i19': 'Supervisor'
};

const getLabel = (key: string) => {
    if (key.length > 4 && key.includes(' ')) return key;
    return FIELD_MAP[key] || key.replace(/_/g, ' ').replace(/^f(\d+)$/, 'Field $1').toUpperCase();
};

export const printReport = (report: any) => {
    if (!report) return;

    toast.info("Preparing document for print...");

    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Parse content if needed
    const content = typeof report.content === 'string'
        ? JSON.parse(report.content)
        : report.content;

    let bodyHtml = '';

    // --- HTML CHART GENERATOR (Visual Bars) ---
    const generateChartHtml = (data: any[], title: string) => {
         const firstItem = data[0];

         const valueKey = Object.keys(firstItem).find(k => {
             const val = firstItem[k];
             return typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '');
         }) || 'score';

         const labelKey = Object.keys(firstItem).find(k => k !== valueKey && !k.toLowerCase().includes('date')) || 'name';

         // Determine scale
         const values = data.map(d => Number(d[valueKey] || 0));
         const maxVal = Math.max(...values, 20); // Minimum scale of 20

         const bars = data.map(item => {
             const label = item[labelKey] || item.domain || '?';
             const val = Math.round(Number(item[valueKey] || 0));
             const pct = Math.min((val / maxVal) * 100, 100);

             return `
                <div style="margin-bottom: 6px; display: flex; align-items: center; font-size: 10px;">
                    <div style="width: 120px; color: #64748b; padding-right: 10px; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${label}</div>
                    <div style="flex: 1; background: #f1f5f9; height: 14px; border-radius: 3px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <div style="width: ${pct}%; background: #3b82f6; height: 100%; border-radius: 2px; -webkit-print-color-adjust: exact; print-color-adjust: exact;"></div>
                    </div>
                    <div style="width: 30px; padding-left: 8px; font-weight: bold; color: #334155; text-align: right;">${val}</div>
                </div>
             `;
         }).join('');

         return `
            <div class="full-width card-like" style="page-break-inside: avoid;">
                <div class="field-label-large">📊 ${title}</div>
                <div style="padding: 10px 0;">${bars}</div>
            </div>
         `;
    };

    // --- TABLE GENERATOR (Fallback) ---
    const generateTableHtml = (data: any[], title: string) => {
        const headers = Object.keys(data[0]);
        const rows = data.map((r: any) =>
            `<tr>${headers.map(h => `<td>${r[h]}</td>`).join('')}</tr>`
        ).join('');

        return `
        <div class="full-width card-like">
            <div class="field-label-large">${title}</div>
            <table class="data-table">
                <thead><tr>${headers.map(h => `<th>${getLabel(h)}</th>`).join('')}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    };

    // --- GRID GENERATOR ---
    const generateGridHtml = (data: [string, any][]) => {
        let html = '<div class="grid-container">';
        data.forEach(([key, value]) => {
            if (value === null || value === '') return;
            const label = getLabel(key);

            // 1. Handle Arrays (Charts/Tables)
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                const hasNumbers = Object.values(value[0]).some(v => {
                    return typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '');
                });

                // Break the grid to insert full-width content
                html += '</div>';

                if (hasNumbers) {
                    html += generateChartHtml(value, label);
                } else {
                    html += generateTableHtml(value, label);
                }

                html += '<div class="grid-container">'; // Restart grid
            }
            // 2. Boolean Data
            else if (typeof value === 'boolean') {
                html += `
                    <div class="grid-item card-item">
                        <div class="field-label">${label}</div>
                        <div class="badge ${value ? 'badge-yes' : 'badge-no'}">${value ? 'YES' : 'NO'}</div>
                    </div>`;
            }
            // 3. Text Data
            else {
                const strVal = String(value);
                const isLong = strVal.length > 80 || strVal.includes('\n');

                // Break grid for long text
                if (isLong) {
                    html += `</div><div class="full-width card-item" style="margin-bottom: 10px;">
                        <div class="field-label">${label}</div>
                        <div class="field-value">${strVal.replace(/\n/g, '<br>')}</div>
                    </div><div class="grid-container">`;
                } else {
                    html += `
                        <div class="grid-item card-item">
                            <div class="field-label">${label}</div>
                            <div class="field-value">${strVal}</div>
                        </div>`;
                }
            }
        });
        html += '</div>';
        return html;
    };

    // Detect Structure (Sectioned vs Flat)
    const isNested = Object.values(content).some(val => typeof val === 'object' && val !== null && !Array.isArray(val));

    if (isNested) {
        Object.entries(content).forEach(([sectionTitle, sectionData]: [string, any]) => {
            if (!sectionData || Object.keys(sectionData).length === 0) return;
            bodyHtml += `
                <div class="section">
                    <div class="section-header">${sectionTitle}</div>
                    <div class="section-body">${generateGridHtml(Object.entries(sectionData))}</div>
                </div>`;
        });
    } else {
        bodyHtml += `
            <div class="section">
                <div class="section-header">Report Details</div>
                <div class="section-body">${generateGridHtml(Object.entries(content))}</div>
            </div>`;
    }

    // --- HTML TEMPLATE ---
    const html = `
        <html>
        <head>
            <title>${report.title}</title>
            <style>
                @page { margin: 15mm; size: A4; }
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #334155; margin: 0; padding: 25px; background: white; -webkit-print-color-adjust: exact; }

                .doc-header { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #0f172a; display: flex; justify-content: space-between; align-items: flex-end; }
                .doc-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2; text-transform: uppercase; }
                .doc-subtitle { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 500; }
                .brand { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }

                .doc-meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
                .meta-item { display: flex; flex-direction: column; }
                .meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 3px; letter-spacing: 0.5px; }
                .meta-value { font-size: 12px; font-weight: 600; color: #0f172a; }

                .section { margin-bottom: 20px; page-break-inside: avoid; }
                .section-header { font-size: 14px; font-weight: 700; color: #3b82f6; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .section-body { padding: 5px 0; }

                /* Grid Layout */
                .grid-container { display: flex; flex-wrap: wrap; gap: 15px; }
                .grid-item { flex: 1 1 45%; min-width: 200px; }
                .full-width { flex: 1 1 100%; width: 100%; }

                /* Cards */
                .card-item { background: #fff; border: 1px solid #f1f5f9; border-radius: 4px; padding: 10px; margin-bottom: 10px; }
                .card-like { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; background: #fff; margin-bottom: 10px; }

                /* Text */
                .field-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.3px; }
                .field-label-large { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; border-left: 3px solid #3b82f6; padding-left: 8px; }
                .field-value { font-size: 13px; line-height: 1.5; color: #1e293b; white-space: pre-wrap; font-weight: 500; }

                /* Badges */
                .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid #e2e8f0; }
                .badge-yes { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
                .badge-no { background: #f1f5f9; color: #64748b; border-color: #e2e8f0; }

                /* Tables */
                .data-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 5px; border: 1px solid #e2e8f0; }
                .data-table th { background: #f8fafc; padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600; text-transform: uppercase; }
                .data-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
                .data-table tr:last-child td { border-bottom: none; }

                .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #cbd5e1; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="doc-header">
                <div>
                    <h1 class="doc-title">${report.title}</h1>
                    <div class="doc-subtitle">Official Assessment Record</div>
                </div>
                <div class="brand">KIDTRAK SYSTEM</div>
            </div>

            <div class="doc-meta-box">
                <div class="meta-item"><div class="meta-label">Student Name</div><div class="meta-value">${report.student}</div></div>
                <div class="meta-item"><div class="meta-label">Report Date</div><div class="meta-value">${report.date}</div></div>
                <div class="meta-item"><div class="meta-label">Report Type</div><div class="meta-value">${report.type}</div></div>
                <div class="meta-item"><div class="meta-label">Generated By</div><div class="meta-value">${report.generated_by}</div></div>
            </div>

            ${bodyHtml}

            <div class="footer">
                Generated by KIDTRAK System • ${new Date().toLocaleDateString()} • Confidential Document
            </div>
        </body>
        </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 500);
};
