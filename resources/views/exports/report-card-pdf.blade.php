<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $student->last_name }} - Official ECCD Consolidated Report</title>
    <style>
        /* --- Strict 1-Page Print Settings --- */
        @page { size: portrait; margin: 10mm; } /* Narrow physical margins */

        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11px; /* Slightly smaller base font */
            color: #111;
            margin: 0;
            padding: 0;
            line-height: 1.3;
        }

        /* --- Official Header --- */
        .document-header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 3px double #000;
        }
        .document-header p { margin: 1px 0; font-size: 10px; text-transform: uppercase; font-weight: bold; color: #333; }
        .document-header h1 { margin: 8px 0 3px 0; font-size: 16px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; }
        .document-header h2 { margin: 0; font-size: 13px; font-weight: normal; font-style: italic; color: #444; }

        /* --- Student Information Block --- */
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

        /* --- Legend Box --- */
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

        /* --- Data Tables --- */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, Helvetica, sans-serif;
            border: 1.5px solid #000;
            margin-bottom: 15px;
        }
        .data-table th, .data-table td {
            border: 1px solid #000;
            padding: 5px 8px; /* Compressed cell padding */
            vertical-align: middle;
        }
        .data-table th {
            background-color: #e2e8f0;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: center;
        }
        .col-domain { background-color: #f8fafc; font-weight: bold; text-align: left; width: 35%; font-size: 11px; }
        .col-score { text-align: center; font-size: 13px; font-weight: bold; }

        /* Emphasized Total Rows */
        .row-sum td { border-top: 2px solid #000; background-color: #f1f5f9; }
        .row-overall td { border-top: 2px solid #000; background-color: #e2e8f0; }

        /* --- Remarks Section --- */
        .remarks-container {
            font-family: Arial, Helvetica, sans-serif;
            margin-bottom: 20px;
        }
        .remarks-label { font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; color: #374151; }
        .remarks-box {
            border: 1px solid #000;
            padding: 8px 12px;
            min-height: 40px; /* Reduced min-height */
            background-color: #fafafa;
            font-style: italic;
            line-height: 1.4;
            font-size: 10.5px;
        }

        /* --- Signatures --- */
        .signature-table { width: 100%; border: none; page-break-inside: avoid; }
        .signature-table td { border: none; text-align: center; padding: 5px 20px; vertical-align: bottom; height: 60px; /* Reduced height */ }
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
        .sig-label { font-size: 10px; text-align: left; margin-bottom: 30px; /* Reduced gap */ font-style: italic; color: #333; }

        /* --- Meta Footer --- */
        .meta-text { font-size: 8.5px; color: #9ca3af; text-align: right; margin-top: 15px; font-family: Arial, sans-serif; text-transform: uppercase; }
    </style>
</head>
<body>

    @php
        // Prepare the data for the dynamic columns
        $latestAssessment = $assessments->last(); // The most recent one
        $firstAssessment = $assessments->first(); // To extract the domain list

        // Extract domains safely so we can loop through them for the rows
        $domains = [];
        if ($firstAssessment) {
            foreach ($firstAssessment->scores as $score) {
                $domains[$score->domain_id] = $score->domain->name ?? 'Domain';
            }
        }
    @endphp

    <div class="document-header">
        <p>Republic of the Philippines</p>
        <p>Early Childhood Care and Development (ECCD) Program</p>
        <h1>CONSOLIDATED LEARNER'S PROGRESS REPORT</h1>
        <h2>{{ $student->daycare->name ?? 'Child Development Center' }}</h2>
    </div>

    <table class="info-section">
        <tr>
            <td class="info-label">Name:</td>
            <td class="info-value" colspan="3" style="width: 50%;">
                {{ $student->last_name }}, {{ $student->first_name }} {{ $student->middle_name ?? '' }}
            </td>
            <td class="info-label">Sex:</td>
            <td class="info-value" style="width: 14%;">
                {{ $student->gender ?? 'N/A' }}
            </td>
        </tr>
        <tr>
            <td class="info-label">Age:</td>
            <td class="info-value" style="width: 20%;">
                {{ $student->formatted_age ?? 'N/A' }}
            </td>
            <td class="info-label">School Year:</td>
            <td class="info-value" style="width: 18%;">
                {{ date('Y') }} - {{ date('Y') + 1 }}
            </td>
            <td class="info-label">Date Printed:</td>
            <td class="info-value" style="width: 14%;">
                {{ now()->format('M d, Y') }}
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
                <th class="col-domain" style="text-align: center; background-color: #e2e8f0;">DEVELOPMENTAL DOMAINS</th>
                @if ($assessments->count() > 0)
                    @foreach ($assessments as $index => $eval)
                        <th>
                            EVALUATION {{ $index + 1 }}<br>
                            <span style="font-size: 8.5px; font-weight: normal; text-transform: none; letter-spacing: 0;">
                                {{ \Carbon\Carbon::parse($eval->assessment_date ?? $eval->created_at)->format('M d, Y') }}
                            </span>
                        </th>
                    @endforeach
                @else
                    <th>SCORES</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @if (count($domains) > 0)
                @php $domainCounter = 1; @endphp
                @foreach ($domains as $domainId => $domainName)
                    <tr>
                        <td class="col-domain">{{ $domainCounter++ }}. {{ $domainName }}</td>

                        @foreach ($assessments as $eval)
                            @php
                                $score = $eval->scores->where('domain_id', $domainId)->first();
                                $scaled = $score ? (int) ($score->scaled_score ?? $score->score) : '-';
                            @endphp
                            <td class="col-score">{{ $scaled }}</td>
                        @endforeach
                    </tr>
                @endforeach

                <tr class="row-sum">
                    <td class="col-domain" style="text-align: right; padding-right: 15px; background-color: transparent;">SUM OF SCALED SCORES:</td>
                    @foreach ($assessments as $eval)
                        @php
                            $sumScaledScores = 0;
                            foreach ($domains as $domainId => $domainName) {
                                $score = $eval->scores->where('domain_id', $domainId)->first();
                                $sumScaledScores += $score ? (int) ($score->scaled_score ?? $score->score) : 0;
                            }
                        @endphp
                        <td class="col-score">{{ $sumScaledScores > 0 ? $sumScaledScores : '-' }}</td>
                    @endforeach
                </tr>

                <tr class="row-overall">
                    <td class="col-domain" style="text-align: right; padding-right: 15px; background-color: transparent; text-transform: uppercase;">OVERALL STANDARD SCORE:</td>
                    @foreach ($assessments as $eval)
                        <td class="col-score" style="font-size: 15px;">
                            {{ $eval->overall_score ?? ($eval->standard_score ?? '-') }}
                        </td>
                    @endforeach
                </tr>
            @else
                <tr>
                    <td colspan="4" style="text-align: center; padding: 15px; color: #64748b; font-style: italic;">
                        No completed assessment records found for this student yet.
                    </td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="remarks-container">
        <div class="remarks-label">Latest Teacher Remarks & Recommendations</div>
        <div class="remarks-box">
            @if ($latestAssessment && ($latestAssessment->remarks || $latestAssessment->recommendation))
                @if ($latestAssessment->remarks)
                    <strong>Remarks:</strong> {{ $latestAssessment->remarks }}<br><br>
                @endif
                @if ($latestAssessment->recommendation)
                    <strong>Recommendations:</strong> {{ $latestAssessment->recommendation }}
                @endif
            @else
                The learner has shown consistent progress throughout the evaluation periods and participates actively in daily routines. Continue to guide and support the child's development at home.
            @endif
        </div>
    </div>

    <table class="signature-table">
        <tr>
            <td>
                <div class="sig-content">
                    <div class="sig-label">Evaluated by:</div>
                    <div class="sig-line">
                        @if ($latestAssessment && $latestAssessment->teacher)
                            {{ $latestAssessment->teacher->first_name }} {{ $latestAssessment->teacher->last_name }}
                        @else
                            Child Development Worker
                        @endif
                    </div>
                    <div class="sig-title">Daycare Teacher / Evaluator</div>
                </div>
            </td>
            <td>
                <div class="sig-content">
                    <div class="sig-label">Acknowledged by:</div>
                    <div class="sig-line">
                        @if ($student->parents && $student->parents->count() > 0)
                            {{ $student->parents->first()->first_name }} {{ $student->parents->first()->last_name }}
                        @else
                            &nbsp;
                        @endif
                    </div>
                    <div class="sig-title">Parent / Guardian Signature</div>
                </div>
            </td>
        </tr>
    </table>

    <div class="meta-text">
        System Generated Document • Learner ID: {{ $student->id ?? 'N/A' }}
    </div>

</body>
</html>
