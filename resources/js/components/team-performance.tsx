import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    division: string;
    all_divisions: string;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    completion_rate: number;
}

interface TeamPerformanceProps {
    data: TeamMember[];
}

export default function TeamPerformance({ data }: TeamPerformanceProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Task completion rates and workload across team members</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <div className="space-y-4">
                        {data.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <span className="text-sm font-medium text-primary">
                                            {member.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{member.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {member.division}
                                            {member.all_divisions !== member.division && (
                                                <span className="ml-1 text-xs text-blue-600">
                                                    (+{member.all_divisions.split(',').length - 1} more)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`text-sm font-medium ${
                                                member.completion_rate >= 70
                                                    ? 'text-green-600'
                                                    : member.completion_rate >= 40
                                                      ? 'text-yellow-600'
                                                      : 'text-red-600'
                                            }`}
                                        >
                                            {member.completion_rate}%
                                        </span>
                                        <div className="w-20">
                                            <div className="h-2 w-full rounded-full bg-muted">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        member.completion_rate >= 70
                                                            ? 'bg-green-500'
                                                            : member.completion_rate >= 40
                                                              ? 'bg-yellow-500'
                                                              : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${Math.min(member.completion_rate, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {member.completed_tasks}/{member.total_tasks} tasks
                                    </p>
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
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                        </svg>
                        <p className="mt-2">No team performance data available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
