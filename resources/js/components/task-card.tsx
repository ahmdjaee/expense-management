import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DIVISIONS, Task, USERS } from "@/pages/mockdata"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const division = DIVISIONS.find((d) => d.id === task.division)
  const assignee = USERS.find((u) => u.id === task.assignedTo)
  const daysUntilDue = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysUntilDue < 0
  const isWeekAway = daysUntilDue > 0 && daysUntilDue <= 7
  const isCompleted = task.status === "completed"

  const statusColors = {
    pending: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md",
        isOverdue && "border-destructive/30 bg-destructive/5",
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-card-foreground line-clamp-2">{task.title}</h3>
          {isOverdue && <div className="h-2 w-2 rounded-full bg-destructive flex-shrink-0 mt-1" />}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={division?.color}>
            {division?.name}
          </Badge>
          <Badge variant="outline" className={statusColors[task.status as keyof typeof statusColors]}>
            {task.status === "in-progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Badge>
          <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{assignee?.avatar}</span>
            <span className="text-xs text-muted-foreground">{assignee?.name}</span>
          </div>
          <div
            className={cn(
              "text-xs font-medium",
              isCompleted
                ? "text-green-600 dark:text-green-400"
                : isOverdue
                  ? "text-destructive"
                  : isWeekAway
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-muted-foreground",
            )}
          >
            {isCompleted
              ? "Completed"
              : isOverdue
                ? `${Math.abs(daysUntilDue)} days overdue`
                : `${daysUntilDue} days left`}
          </div>
        </div>
      </div>
    </div>
  )
}
