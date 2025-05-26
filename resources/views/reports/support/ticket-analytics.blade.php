<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket Analytics Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
        }
        .header .period {
            color: #666;
            margin-top: 5px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h2 {
            color: #007bff;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        .summary-card {
            border: 1px solid #ddd;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
        }
        .summary-card .number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .summary-card .label {
            color: #666;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .chart-placeholder {
            height: 200px;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f8f9fa;
            color: #666;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Support Ticket Analytics Report</h1>
        <div class="period">
            Report Period: {{ $period['start'] }} to {{ $period['end'] }}
        </div>
        <div class="period">
            Generated on: {{ now()->format('M j, Y \a\t g:i A') }}
        </div>
    </div>

    <!-- Summary Section -->
    <div class="section">
        <h2>Executive Summary</h2>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="number">{{ $summary['total'] }}</div>
                <div class="label">Total Tickets</div>
            </div>
            <div class="summary-card">
                <div class="number">{{ $summary['resolved'] + $summary['closed'] }}</div>
                <div class="label">Resolved</div>
            </div>
            <div class="summary-card">
                <div class="number">{{ $summary['open'] + $summary['in_progress'] + $summary['pending'] }}</div>
                <div class="label">Active</div>
            </div>
            <div class="summary-card">
                <div class="number">{{ $summary['overdue'] }}</div>
                <div class="label">Overdue</div>
            </div>
        </div>

        @if($summary['total'] > 0)
        <p><strong>Resolution Rate:</strong> {{ round(($summary['resolved'] + $summary['closed']) / $summary['total'] * 100, 1) }}%</p>
        @endif
    </div>

    <!-- Status Breakdown -->
    <div class="section">
        <h2>Tickets by Status</h2>
        <table>
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                @foreach($by_status as $status => $count)
                <tr>
                    <td>{{ ucfirst(str_replace('_', ' ', $status)) }}</td>
                    <td>{{ $count }}</td>
                    <td>{{ $summary['total'] > 0 ? round($count / $summary['total'] * 100, 1) : 0 }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Priority and Category Breakdown -->
    <div class="section">
        <div class="two-column">
            <div>
                <h2>Tickets by Priority</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Priority</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($by_priority as $priority => $count)
                        <tr>
                            <td>{{ ucfirst($priority) }}</td>
                            <td>{{ $count }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div>
                <h2>Tickets by Category</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($by_category as $category => $count)
                        <tr>
                            <td>{{ $category ?: 'Uncategorized' }}</td>
                            <td>{{ $count }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Resolution Times -->
    @if($resolution_times['average'] > 0)
    <div class="section">
        <h2>Resolution Time Analysis</h2>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Time (Minutes)</th>
                    <th>Time (Hours)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Average Resolution Time</td>
                    <td>{{ $resolution_times['average'] }}</td>
                    <td>{{ round($resolution_times['average'] / 60, 1) }}</td>
                </tr>
                <tr>
                    <td>Median Resolution Time</td>
                    <td>{{ $resolution_times['median'] }}</td>
                    <td>{{ round($resolution_times['median'] / 60, 1) }}</td>
                </tr>
                <tr>
                    <td>Fastest Resolution</td>
                    <td>{{ $resolution_times['min'] }}</td>
                    <td>{{ round($resolution_times['min'] / 60, 1) }}</td>
                </tr>
                <tr>
                    <td>Slowest Resolution</td>
                    <td>{{ $resolution_times['max'] }}</td>
                    <td>{{ round($resolution_times['max'] / 60, 1) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    @endif

    <!-- SLA Compliance -->
    @if($sla_compliance['response_compliance'] > 0 || $sla_compliance['resolution_compliance'] > 0)
    <div class="section">
        <h2>SLA Compliance</h2>
        <table>
            <thead>
                <tr>
                    <th>SLA Metric</th>
                    <th>Compliance Rate</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Response Time SLA</td>
                    <td>{{ $sla_compliance['response_compliance'] }}%</td>
                </tr>
                <tr>
                    <td>Resolution Time SLA</td>
                    <td>{{ $sla_compliance['resolution_compliance'] }}%</td>
                </tr>
            </tbody>
        </table>
    </div>
    @endif

    <!-- Daily Trends -->
    <div class="section">
        <h2>Daily Ticket Trends</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Created</th>
                    <th>Resolved</th>
                    <th>Closed</th>
                </tr>
            </thead>
            <tbody>
                @foreach($daily_trends as $trend)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($trend['date'])->format('M j, Y') }}</td>
                    <td>{{ $trend['created'] }}</td>
                    <td>{{ $trend['resolved'] }}</td>
                    <td>{{ $trend['closed'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Assignee Performance -->
    @if(!empty($by_assignee))
    <div class="section">
        <h2>Tickets by Assignee</h2>
        <table>
            <thead>
                <tr>
                    <th>Assignee</th>
                    <th>Assigned Tickets</th>
                </tr>
            </thead>
            <tbody>
                @foreach($by_assignee as $assignee => $count)
                <tr>
                    <td>{{ $assignee ?: 'Unassigned' }}</td>
                    <td>{{ $count }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="footer">
        <p>{{ config('app.name') }} Support Analytics Report | Generated {{ now()->format('M j, Y \a\t g:i A') }}</p>
    </div>
</body>
</html>
