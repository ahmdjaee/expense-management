import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UpcomingDeadline {
    id: number;
    title: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
    status: string;
    assigned_to: string;
    division: string;
    days_remaining: number;
}

interface UpcomingDeadlinesProps {
    data: UpcomingDeadline[];
}

export function UpcomingDeadlines({ data }: UpcomingDeadlinesProps) {
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50';
            case 'low':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/50';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/50';
        }
    };

    const getDaysRemainingColor = (days: number) => {
        if (days < 0) return 'text-red-600 dark:text-red-400';
        if (days === 0) return 'text-orange-600 dark:text-orange-400';
        if (days <= 2) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const formatDaysRemaining = (days: number) => {
        if (days < 0) return `${Math.abs(days)} days overdue`;
        if (days === 0) return 'Due today';
        if (days === 1) return '1 day left';
        return `${days} days left`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="space-y-4">
                        {data.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-start justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">{task.title}</p>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <span>Assigned to {task.assigned_to}</span>
                                        <span>•</span>
                                        <span>{task.division}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                                        >
                                            {task.priority}
                                        </span>
                                        <span
                                            className={`text-sm font-medium ${getDaysRemainingColor(task.days_remaining)}`}
                                        >
                                            {formatDaysRemaining(task.days_remaining)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                    {formatDate(task.deadline)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        <svg
                            className="mx-auto h-12 w-12 text-muted-foreground/50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="mt-2">No upcoming deadlines</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
