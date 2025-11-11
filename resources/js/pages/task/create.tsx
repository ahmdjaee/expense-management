import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { tasks } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Form, Head, router } from '@inertiajs/react';

export const DIVISIONS = [
    { id: 1, name: 'Engineering', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { id: 2, name: 'Design', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { id: 3, name: 'Marketing', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
    { id: 4, name: 'Product', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { id: 5, name: 'HR', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
];

export const USERS = [
    { id: 1, name: 'Ahmad Rizki', email: 'ahmad@company.com', division: 1, avatar: '👨‍💼' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@company.com', division: 2, avatar: '👩‍💼' },
    { id: 3, name: 'Michael Chen', email: 'michael@company.com', division: 1, avatar: '👨‍💻' },
    { id: 4, name: 'Eka Putri', email: 'eka@company.com', division: 3, avatar: '👩‍💻' },
    { id: 5, name: 'Budi Santoso', email: 'budi@company.com', division: 4, avatar: '👨‍💼' },
    { id: 6, name: 'Lisa Wang', email: 'lisa@company.com', division: 2, avatar: '👩‍🎨' },
    { id: 7, name: 'Rinto Harahap', email: 'rinto@company.com', division: 5, avatar: '👨‍💼' },
    { id: 8, name: 'Nina Sari', email: 'nina@company.com', division: 3, avatar: '👩‍💼' },
];

interface TaskFormProps {
    users: Array<{ id: number; name: string }>;
    divisions: Array<{ id: number; name: string; description: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Task',
        href: tasks().url,
    },
    {
        title: 'Create Task',
        href: '',
    },
];

export default function TaskForm({ users, divisions }: TaskFormProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Task" />
            <div className="p-4">
                <Card className="flex-1 p-6">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Create Task</h1>
                    </div>
                    <Form action={'/tasks/store'} className="space-y-6" method="post">
                        {({ processing, errors }) => (
                            <>
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="font-medium text-foreground">
                                        Task Title
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter task title"
                                        required
                                        className="border-muted bg-muted/50"
                                        name="title"
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="font-medium text-foreground">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter task description"
                                        name="description"
                                        className="min-h-24 border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                {/* Grid Layout */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Division */}
                                    <div className="space-y-2">
                                        <Label htmlFor="division" className="font-medium text-foreground">
                                            Division
                                        </Label>
                                        <Select name="division_id">
                                            <SelectTrigger id="division" className="border-muted bg-muted/50">
                                                <SelectValue placeholder="Select division" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {divisions.map((d) => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.division_id} />
                                    </div>

                                    {/* Assigned To */}
                                    <div className="space-y-2">
                                        <Label htmlFor="assignedTo" className="font-medium text-foreground">
                                            Assign To
                                        </Label>
                                        <Select name="assigned_to">
                                            <SelectTrigger id="assignedTo" className="border-muted bg-muted/50">
                                                <SelectValue placeholder="Select team member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((u) => (
                                                    <SelectItem key={u.id} value={u.id.toString()}>
                                                        {u.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.assigned_to} />
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <Label htmlFor="priority" className="font-medium text-foreground">
                                            Priority
                                        </Label>
                                        <Select name="priority">
                                            <SelectTrigger id="priority" className="border-muted bg-muted/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.priority} />
                                    </div>

                                    {/* Due Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate" className="font-medium text-foreground">
                                            Due Date
                                        </Label>
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            name="due_date"
                                            required
                                            className="border-muted bg-muted/50"
                                        />
                                        <InputError message={errors.due_date} />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="font-medium text-foreground">
                                        Initial Status
                                    </Label>
                                    <Select name="status" defaultValue='pending'>
                                        <SelectTrigger id="status" className="border-muted bg-muted/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(tasks().url)}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        disabled={processing}
                                    >
                                        {processing ? 'Creating...' : 'Create Task'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </Card>
            </div>
        </AppLayout>
    );
}
