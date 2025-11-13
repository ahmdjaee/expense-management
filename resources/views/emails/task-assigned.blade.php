<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Assigned</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 30px;
        }
        .header {
            background: #4F46E5;
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 20px -30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .task-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            width: 120px;
            color: #666;
        }
        .detail-value {
            flex: 1;
            color: #333;
        }
        .priority {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .priority-high {
            background: #FEE2E2;
            color: #DC2626;
        }
        .priority-medium {
            background: #FEF3C7;
            color: #D97706;
        }
        .priority-low {
            background: #DBEAFE;
            color: #2563EB;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: capitalize;
        }
        .status-pending {
            background: #E5E7EB;
            color: #4B5563;
        }
        .status-in_progress {
            background: #DBEAFE;
            color: #2563EB;
        }
        .status-completed {
            background: #D1FAE5;
            color: #059669;
        }
        .button {
            display: inline-block;
            background: #4F46E5;
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Tugas baru ditambahkan</h1>
        </div>

        <p>Hi <strong>{{ $user->name }}</strong>,</p>
        <p>Kamu telah diberikan tugas baru, berikut detailnya</p>

        <div class="task-details">
            <div class="detail-row">
                <div class="detail-label">Title:</div>
                <div class="detail-value"><strong>{{ $task->title }}</strong></div>
            </div>

            @if($task->description)
            <div class="detail-row">
                <div class="detail-label">Description:</div>
                <div class="detail-value">{{ $task->description }}</div>
            </div>
            @endif

            <div class="detail-row">
                <div class="detail-label">Division:</div>
                <div class="detail-value">{{ $task->division->name }}</div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Priority:</div>
                <div class="detail-value">
                    <span class="priority priority-{{ $task->priority }}">
                        {{ ucfirst($task->priority) }}
                    </span>
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label">Status:</div>
                <div class="detail-value">
                    <span class="status status-{{ $task->status }}">
                        {{ ucfirst(str_replace('_', ' ', $task->status)) }}
                    </span>
                </div>
            </div>

            @if($task->deadline)
            <div class="detail-row">
                <div class="detail-label">Deadline:</div>
                <div class="detail-value">
                    {{ \Carbon\Carbon::parse($task->deadline)->format('l, d F Y') }}
                </div>
            </div>
            @endif

            <div class="detail-row">
                <div class="detail-label">Created by:</div>
                <div class="detail-value">{{ $task->createdBy->name ?? 'System' }}</div>
            </div>
        </div>

        <a href="{{ config('app.url') }}/my-tasks" class="button">
            View My Tasks
        </a>

        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>