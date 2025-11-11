import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Task } from '@/pages/mockdata';

interface TaskCardProps {
    task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
    console.log(task);
    const deadlineDate = new Date(task.deadline);
    const daysUntilDue = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntilDue < 0;
    const isWeekAway = daysUntilDue > 0 && daysUntilDue <= 7;
    const isCompleted = task.status === 'completed';

    const statusColors = {
        pending: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };

    const priorityColors = {
        high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };

    return (
        <div
            className={cn(
                'rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md',
                // isOverdue && 'border-destructive/30 bg-destructive/5',
            )}
        >
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 font-semibold text-card-foreground">{task.title}</h3>
                    {/* {isOverdue && <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-destructive" />} */}
                </div>

                {/* Description */}
                <p className="line-clamp-2 text-sm text-muted-foreground">{task.description}</p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        variant="outline"
                        className={'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}
                    >
                        {task.division?.name}
                    </Badge>
                    <Badge variant="outline" className={statusColors[task.status as keyof typeof statusColors]}>
                        {task.status === 'in_progress'
                            ? 'In Progress'
                            : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-2">
                    <div className="flex items-center gap-2">
                        {/* <span className="text-2xl">{task.assignedTo?.avatar}</span> */}
                        <span className="text-xs text-muted-foreground">{task.assignedTo?.name}</span>
                    </div>
                    <div
                        className={cn(
                            'text-xs font-medium',
                            isCompleted
                                ? 'text-green-600 dark:text-green-400'
                                : isOverdue
                                  ? 'text-destructive'
                                  : isWeekAway
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-muted-foreground',
                        )}
                    >
                        {isCompleted
                            ? 'Completed'
                            : isOverdue
                              ? `${Math.abs(daysUntilDue)} days overdue`
                              : `${daysUntilDue} days left`}
                    </div>
                </div>
            </div>
        </div>
    );
}
