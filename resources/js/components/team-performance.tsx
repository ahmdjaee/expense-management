import { DIVISIONS, TASKS, USERS } from "@/pages/mockdata"
import { Card } from "./ui/card"
import { useMemo } from "react"
import { Progress } from "./ui/progress"

export default function TeamPerformance() {
  const teamStats = useMemo(() => {
    return USERS.map((user) => {
      const userTasks = TASKS.filter((t) => t.assignedTo === user.id)
      const completedTasks = userTasks.filter((t) => t.status === "completed").length
      const completionRate = userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 0
      const division = DIVISIONS.find((d) => d.id === user.division)

      return {
        ...user,
        taskCount: userTasks.length,
        completedTasks,
        completionRate,
        division,
      }
    }).sort((a, b) => b.completionRate - a.completionRate)
  }, [])

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Team Performance</h3>
      <div className="space-y-6">
        {teamStats.map((member) => (
          <div key={member.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{member.avatar}</span>
                <div>
                  <p className="font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.division?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {member.completedTasks}/{member.taskCount}
                </p>
                <p className="text-xs text-muted-foreground">{member.completionRate}% complete</p>
              </div>
            </div>
            {/* <Progress value={member.completionRate} className="h-2" /> */}
          </div>
        ))}
      </div>
    </Card>
  )
}