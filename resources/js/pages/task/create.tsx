import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import AppLayout from "@/layouts/app-layout"
import { tasks } from "@/routes"
import { BreadcrumbItem } from "@/types"
import { Head } from "@inertiajs/react"
import { useState } from "react"

export const DIVISIONS = [
  { id: 1, name: "Engineering", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { id: 2, name: "Design", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  { id: 3, name: "Marketing", color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" },
  { id: 4, name: "Product", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { id: 5, name: "HR", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
]

export const USERS = [
  { id: 1, name: "Ahmad Rizki", email: "ahmad@company.com", division: 1, avatar: "👨‍💼" },
  { id: 2, name: "Sarah Johnson", email: "sarah@company.com", division: 2, avatar: "👩‍💼" },
  { id: 3, name: "Michael Chen", email: "michael@company.com", division: 1, avatar: "👨‍💻" },
  { id: 4, name: "Eka Putri", email: "eka@company.com", division: 3, avatar: "👩‍💻" },
  { id: 5, name: "Budi Santoso", email: "budi@company.com", division: 4, avatar: "👨‍💼" },
  { id: 6, name: "Lisa Wang", email: "lisa@company.com", division: 2, avatar: "👩‍🎨" },
  { id: 7, name: "Rinto Harahap", email: "rinto@company.com", division: 5, avatar: "👨‍💼" },
  { id: 8, name: "Nina Sari", email: "nina@company.com", division: 3, avatar: "👩‍💼" },
]

interface TaskFormProps {
  onSubmit?: (data: any) => void
  onCancel?: () => void
  isLoading?: boolean
}


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Task',
        href: tasks().url,
    },
    {
        title: 'Create Task',
        href: "",
    },
];

export default function TaskForm({ onSubmit, onCancel, isLoading = false }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    division: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
    status: "pending",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Task" />
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground font-medium">
            Task Title
          </Label>
          <Input
            id="title"
            placeholder="Enter task title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="bg-muted/50 border-muted"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Enter task description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-24 bg-muted/50 border-muted"
          />
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Division */}
          <div className="space-y-2">
            <Label htmlFor="division" className="text-foreground font-medium">
              Division
            </Label>
            <Select value={formData.division} onValueChange={(value) => setFormData({ ...formData, division: value })}>
              <SelectTrigger id="division" className="bg-muted/50 border-muted">
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {DIVISIONS.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo" className="text-foreground font-medium">
              Assign To
            </Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
            >
              <SelectTrigger id="assignedTo" className="bg-muted/50 border-muted">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {USERS.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.avatar} {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-foreground font-medium">
              Priority
            </Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger id="priority" className="bg-muted/50 border-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-foreground font-medium">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              className="bg-muted/50 border-muted"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-foreground font-medium">
            Initial Status
          </Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger id="status" className="bg-muted/50 border-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Card>
    </AppLayout>
  )
}