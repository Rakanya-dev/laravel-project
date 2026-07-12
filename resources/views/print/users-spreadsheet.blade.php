<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>{{ $title }} - Print Report</title>
    <style>
        /* 1. Reset everything for a clean print */
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 20px;
        }

        /* 2. Format the header */
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

        /* 3. The "Excel" Table Style */
        table {
            width: 100%;
            border-collapse: collapse;
            /* This forces the tight Excel grid look */
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
            /* Forces printers to print the gray background */
            print-color-adjust: exact;
        }

        /* 4. Ensure rows don't break across pages weirdly */
        tr {
            page-break-inside: avoid;
        }

        /* 5. Force Landscape mode on the printer */
        @page {
            size: landscape;
            margin: 0.5in;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1>{{ $title }}</h1>
        <p>Generated on {{ now()->format('F j, Y, g:i a') }} • Total Records: {{ $users->count() }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Center Assignment</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($users as $index => $user)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $user->last_name }}, {{ $user->first_name }} {{ $user->middle_name }}</td>
                    <td>{{ $user->email }}</td>
                    <td>{{ $user->phone ?? 'N/A' }}</td>
                    <td>
                        @if ($user->daycare)
                            {{ $user->daycare->name }}
                        @elseif($user->students && $user->students->count() > 0 && $user->students->first()->daycare)
                            {{ $user->students->first()->daycare->name }} (via Student)
                        @else
                            Unassigned
                        @endif
                    </td>
                    <td>{{ ucfirst($user->status) }}</td>
                </tr>
            @empty
                <tr>
                    <td colSpan="6" style="text-align: center; padding: 20px;">No records found matching the current
                        filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    w

</body>

</html>
