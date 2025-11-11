import { TASKS, USERS } from "@/pages/mockdata"
import { Card } from "./ui/card"
import { AlertCircle, Clock } from "lucide-react"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

export function UpcomingDeadlines() {
  const upcomingTasks = useMemo(() => {
    return TASKS.filter((t) => t.status !== "completed")
      .map((task) => {
        const daysUntilDue = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return { ...task, daysUntilDue }
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 6)
  }, [])

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    }
    return colors[priority as keyof typeof colors] || colors.low
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Upcoming Deadlines</h3>
      <div className="space-y-3">
        {upcomingTasks.map((task) => {
          const assignee = USERS.find((u) => u.id === task.assignedTo)
          const isOverdue = task.daysUntilDue < 0
          const isWeekAway = task.daysUntilDue > 0 && task.daysUntilDue <= 7

          return (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                isOverdue
                  ? "border-destructive/30 bg-destructive/5"
                  : isWeekAway
                    ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
                    : "border-border bg-card hover:border-primary/20",
              )}
            >
              <div className="flex-shrink-0">
                {isOverdue ? (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
                <p className="text-xs text-muted-foreground">{assignee?.name}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isOverdue ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {isOverdue ? `${Math.abs(task.daysUntilDue)}d overdue` : `${task.daysUntilDue}d left`}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}