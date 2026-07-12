<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>{{ $title }} - Print Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            font-size: 18px;
            margin: 0 0 5px 0;
            text-transform: uppercase;
        }

        .header p {
            margin: 0;
            color: #555;
            font-size: 11px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: left;
        }

        th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        tr {
            page-break-inside: avoid;
        }

        @page {
            size: landscape;
            margin: 0.5in;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Generated on {{ now()->format('F j, Y, g:i a') }} • Total Records: {{ $students->count() }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Date of Birth</th>
                <th>Parent/Guardian</th>
                @if ($role === 'admin')
                    <th>Branch Assignment</th>
                @else
                    <th>Session</th>
                @endif
                <th>Enrollment Status</th>
                @if ($role === 'teacher')
                    <th>Assessment Status</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @forelse($students as $index => $student)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $student->last_name }}, {{ $student->first_name }} {{ $student->middle_name }}</td>
                    <td>{{ \Carbon\Carbon::parse($student->date_of_birth)->format('M d, Y') }}</td>
                    <td>
                        @if ($student->parents && $student->parents->count() > 0)
                            {{ $student->parents->first()->first_name }} {{ $student->parents->first()->last_name }}
                        @else
                            Unlinked
                        @endif
                    </td>
                    @if ($role === 'admin')
                        <td>{{ $student->daycare->name ?? 'Unassigned' }}</td>
                    @else
                        <td>{{ $student->section->name ?? 'Unassigned' }}</td>
                    @endif

                    <td>{{ ucfirst($student->status) }}</td>

                    @if ($role === 'teacher')
                        @php
                            // 🚀 Find the most recent assessment
                            $latestAssessment = $student->assessments->sortByDesc('created_at')->first();
                            $status = $latestAssessment ? $latestAssessment->status : 'Not Started';
                        @endphp

                        <td>{{ $status }}</td>
                    @endif
                </tr>
            @empty
                <tr>
                    <td colSpan="7" style="text-align: center; padding: 20px;">No students found matching the current
                        filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

</body>

</html>
