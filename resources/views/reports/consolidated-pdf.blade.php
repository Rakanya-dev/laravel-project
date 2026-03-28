<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Consolidated Daycare Performance Audit</title>
    <style>
        /* --- Base Print Settings --- */
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12px;
            color: #111;
            margin: 0;
            padding: 20px 30px;
            line-height: 1.4;
        }

        /* --- Official Header --- */
        .document-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px double #000; /* Official double-line separator */
        }
        .document-header p { margin: 2px 0; font-size: 11px; text-transform: uppercase; font-weight: bold; color: #333; }
        .document-header h1 { margin: 15px 0 5px 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; }
        .document-header h2 { margin: 0 0 10px 0; font-size: 14px; font-weight: normal; font-style: italic; color: #444; }

        /* --- Legend Box --- */
        .legend-wrapper {
            border: 1px solid #9ca3af;
            background-color: #f8fafc;
            padding: 10px 15px;
            margin-bottom: 25px;
            border-radius: 2px;
            font-family: Arial, Helvetica, sans-serif; /* Cleaner font for data/legends */
        }
        .legend-title { font-weight: bold; font-size: 10px; text-transform: uppercase; margin-bottom: 6px; color: #1f2937; letter-spacing: 0.5px; }
        .legend-table { width: 100%; border: none; font-size: 10px; }
        .legend-table td { border: none; text-align: left; padding: 3px 0; }
        .legend-badge { display: inline-block; width: 50px; font-weight: bold; }

        /* --- Data Tables --- */
        .branch-section { margin-bottom: 35px; page-break-inside: avoid; }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, Helvetica, sans-serif;
            border: 1.5px solid #000; /* Slightly thicker outer border */
        }
        .data-table th, .data-table td {
            border: 1px solid #000;
            padding: 8px 12px;
            vertical-align: middle;
        }

        /* Branch Title Header */
        .branch-header th {
            background-color: #e2e8f0;
            font-size: 12px;
            text-transform: uppercase;
            padding: 10px 12px;
        }
        .branch-header .branch-name { font-size: 13px; text-decoration: underline; margin-left: 5px; }

        /* Column Headers */
        .col-headers th {
            background-color: #f1f5f9;
            font-size: 10px;
            color: #334155;
            letter-spacing: 0.5px;
        }

        /* Layout Adjustments */
        .col-domain { text-align: left; font-weight: bold; width: 45%; font-size: 11.5px; color: #1e293b; }
        .col-score { width: 20%; text-align: center; font-size: 13px; }
        .col-interp { width: 35%; text-align: center; font-size: 11px; font-style: italic; color: #334155; }

        /* Overall Row Styling */
        .row-overall td {
            border-top: 2px solid #000; /* Thicker line to separate total */
            background-color: #f8fafc;
        }

        /* Empty State */
        .empty-state { text-align: center; padding: 20px; font-style: italic; color: #64748b; border: 1px solid #000; border-top: none; font-family: Arial, sans-serif; background-color: #fafafa; }

        /* --- Signatures --- */
        .signature-table { width: 100%; margin-top: 60px; border: none; page-break-inside: avoid; }
        .signature-table td { border: none; text-align: center; padding: 10px 20px; vertical-align: bottom; height: 90px; }
        .sig-content { display: inline-block; width: 85%; }
        .sig-line {
            border-bottom: 1px solid #000;
            margin-bottom: 4px;
            padding-bottom: 2px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            font-family: Arial, sans-serif;
        }
        .sig-title { font-size: 11px; color: #4b5563; }
        .sig-label { font-size: 11px; text-align: left; margin-bottom: 40px; font-style: italic; color: #333; }

        /* --- Meta Footer --- */
        .meta-text { font-size: 9px; color: #9ca3af; text-align: right; margin-top: 40px; font-family: Arial, sans-serif; text-transform: uppercase; }
    </style>
</head>
<body>

    <div class="document-header">
        <p>Republic of the Philippines</p>
        <p>Early Childhood Care and Development (ECCD) Program</p>
        <h1>CONSOLIDATED DAYCARE PERFORMANCE AUDIT</h1>
        <h2>End-of-Year Domain Averages (3rd Assessment)</h2>
        <p style="font-size: 10px; font-style: italic; color: #555; margin-top: 8px;">School Year: {{ date('Y') - 1 }} - {{ date('Y') }}</p>
    </div>

    <div class="legend-wrapper">
        <div class="legend-title">ECCD Scaled Score Interpretation Legend (Scale of 1-19)</div>
        <table class="legend-table">
            <tr>
                <td><span class="legend-badge">17 - 19</span> : Highly Advanced</td>
                <td><span class="legend-badge">14 - 16</span> : Slightly Advanced</td>
                <td><span class="legend-badge">7 - 13</span> : Average Development</td>
            </tr>
            <tr>
                <td><span class="legend-badge">4 - 6</span> : Slight Delay</td>
                <td><span class="legend-badge">1 - 3</span> : Significant Delay</td>
                <td></td>
            </tr>
        </table>
    </div>

    @foreach($reportData as $branch)
        <div class="branch-section">
            <table class="data-table">
                <thead>
                    <tr class="branch-header">
                        <th colspan="2" style="text-align: left;">
                            Child Development Center: <strong class="branch-name">{{ strtoupper($branch['branch_name']) }}</strong>
                        </th>
                        <th style="text-align: right; font-weight: normal; font-size: 11px;">
                            Total Evaluated Learners: <strong style="font-size: 13px;">{{ $branch['evaluated_students'] }}</strong>
                        </th>
                    </tr>
                    @if($branch['evaluated_students'] > 0)
                        <tr class="col-headers">
                            <th class="col-domain">DEVELOPMENTAL DOMAINS</th>
                            <th class="col-score">AVERAGE SCORE</th>
                            <th class="col-interp">INTERPRETATION</th>
                        </tr>
                    @endif
                </thead>
                @if($branch['evaluated_students'] > 0)
                    <tbody>
                        @foreach($branch['domain_averages'] as $domainName => $averageScore)
                            @php
                                $interp = 'Needs Monitoring';
                                if ($averageScore >= 17) { $interp = 'Highly Advanced'; }
                                elseif ($averageScore >= 14) { $interp = 'Slightly Advanced'; }
                                elseif ($averageScore >= 7) { $interp = 'Average Development'; }
                                elseif ($averageScore >= 4) { $interp = 'Slight Delay'; }
                                elseif ($averageScore >= 1) { $interp = 'Significant Delay'; }
                            @endphp
                            <tr>
                                <td class="col-domain">{{ $domainName }}</td>
                                <td class="col-score"><strong>{{ number_format($averageScore, 1) }}</strong></td>
                                <td class="col-interp">{{ $interp }}</td>
                            </tr>
                        @endforeach

                        @php
                            $domainScores = array_values($branch['domain_averages']);
                            $overallAverage = count($domainScores) > 0 ? array_sum($domainScores) / count($domainScores) : 0;

                            $overallInterp = 'Needs Monitoring';
                            if ($overallAverage >= 17) { $overallInterp = 'Highly Advanced'; }
                            elseif ($overallAverage >= 14) { $overallInterp = 'Slightly Advanced'; }
                            elseif ($overallAverage >= 7) { $overallInterp = 'Average Development'; }
                            elseif ($overallAverage >= 4) { $overallInterp = 'Slight Delay'; }
                            elseif ($overallAverage >= 1) { $overallInterp = 'Significant Delay'; }
                        @endphp
                        <tr class="row-overall">
                            <td class="col-domain" style="text-align: right; padding-right: 15px;"><strong>OVERALL CENTER AVERAGE:</strong></td>
                            <td class="col-score" style="font-size: 14.5px;"><strong>{{ number_format($overallAverage, 1) }}</strong></td>
                            <td class="col-interp" style="font-weight: bold; font-style: normal; color: #000;">{{ $overallInterp }}</td>
                        </tr>
                    </tbody>
                @endif
            </table>

            @if($branch['evaluated_students'] == 0)
                <div class="empty-state">
                    No completed final assessments on record for this center during this evaluation period.
                </div>
            @endif
        </div>
    @endforeach

    <table class="signature-table">
        <tr>
            <td>
                <div class="sig-content">
                    <div class="sig-label">Prepared and Consolidated by:</div>
                    <div class="sig-line">{{ Auth::user()->name ?? 'System Administrator' }}</div>
                    <div class="sig-title">ECCD / Daycare Administrator</div>
                </div>
            </td>
            <td>
                <div class="sig-content">
                    <div class="sig-label">Noted and Approved by:</div>
                    <div class="sig-line">&nbsp;</div>
                    <div class="sig-title">City/Municipal Social Welfare Officer</div>
                </div>
            </td>
        </tr>
    </table>

    <div class="meta-text">
        System Generated Document • {{ $date }}
    </div>

</body>
</html>
