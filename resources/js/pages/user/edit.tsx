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
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: tasks().url,
    },
    {
        title: 'Edit Task',
        href: '',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    division_id?: number;
}

interface Division {
    id: number;
    name: string;
    description?: string;
}

interface Task {
    id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    deadline: string | null;
    division_id: number;
    assigned_to: number | null; // Bisa null jika tidak diassign
    is_personal: boolean;
    division?: Division;
    assigned_to_user?: User;
}

interface TaskEditProps {
    task: Task;
    users: User[];
    divisions: Division[];
}

export default function TaskEdit({ task, users, divisions }: TaskEditProps) {
    const handleCancel = () => {
        router.visit(tasks().url);
    };

    const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format ke YYYY-MM-DD untuk input type="date"
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Filter users by selected division (opsional, bisa digunakan di onValueChange division)
    const getUsersByDivision = (divisionId: number) => {
        return users.filter((user) => user.division_id === divisionId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Task - ${task.title}`} />
            <div className="p-4">
                <Card className="flex-1 p-6">
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={handleCancel}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Edit Task</h1>
                            <p className="mt-1 text-muted-foreground">Update task details and assignment</p>
                        </div>
                    </div>
                    <Form action={`/tasks/${task.id}`} method="put" className="space-y-6">
                        {({ processing, errors, data, setData }) => (
                            <>
                                {/* Task Type Info */}
                                <div
                                    className={`rounded-lg border p-4 ${
                                        task.is_personal
                                            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                                            : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
                                    }`}
                                >
                                    <p
                                        className={`text-sm font-medium ${
                                            task.is_personal
                                                ? 'text-blue-800 dark:text-blue-200'
                                                : 'text-orange-800 dark:text-orange-200'
                                        }`}
                                    >
                                        {task.is_personal ? 'Personal Task' : 'Admin-Assigned Task'}
                                    </p>
                                    <p
                                        className={`mt-1 text-sm ${
                                            task.is_personal
                                                ? 'text-blue-700 dark:text-blue-300'
                                                : 'text-orange-700 dark:text-orange-300'
                                        }`}
                                    >
                                        {task.is_personal
                                            ? 'This task was created by the assigned user as a personal task.'
                                            : 'This task was created by an administrator and assigned to a user.'}
                                    </p>
                                </div>
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="font-medium text-foreground">
                                        Task Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={task.title}
                                        placeholder="Enter task title"
                                        required
                                        className="border-muted bg-muted/50"
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
                                        name="description"
                                        defaultValue={task.description || ''}
                                        placeholder="Enter task description"
                                        className="min-h-24 border-muted bg-muted/50"
                                    />
                                    <InputError message={errors.description} />
                                </div>
                                {/* Grid Layout */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Division */}
                                    <div className="space-y-2">
                                        <Label htmlFor="division_id" className="font-medium text-foreground">
                                            Division <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            name="division_id"
                                            defaultValue={task.division_id.toString()}
                                            onValueChange={(value) => {
                                                // Opsional: Reset assigned_to jika division berubah dan ingin membersihkan pilihan
                                                // setData('assigned_to', 'null'); // Atau nilai default lain jika diperlukan
                                                // Pastikan setData hanya digunakan jika menggunakan Form Inertia dan tidak langsung mengirim ke server
                                            }}
                                        >
                                            <SelectTrigger id="division_id" className="border-muted bg-muted/50">
                                                <SelectValue placeholder="Select division" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {divisions.map((division) => (
                                                    <SelectItem key={division.id} value={division.id.toString()}>
                                                        {division.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.division_id} />
                                    </div>
                                    {/* Assigned To */}
                                    <div className="space-y-2">
                                        <Label htmlFor="assigned_to" className="font-medium text-foreground">
                                            Assign To
                                        </Label>
                                        <Select
                                            name="assigned_to"
                                            // Gunakan 'null' jika task.assigned_to null, atau ID user jika tidak null
                                            defaultValue={task.assigned_to?.toString() || 'null'}
                                        >
                                            <SelectTrigger id="assigned_to" className="border-muted bg-muted/50">
                                                <SelectValue placeholder="Select team member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Gunakan 'null' sebagai value untuk Unassigned */}
                                                <SelectItem value="null">Unassigned</SelectItem>
                                                {users.map((user) => (
                                                    <SelectItem
                                                        key={user.id}
                                                        value={user.id.toString()}
                                                        disabled={user.division_id !== task.division_id}
                                                    >
                                                        {user.name}
                                                        {user.division_id !== task.division_id &&
                                                            ' (Different division)'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.assigned_to} />
                                        <p className="text-xs text-muted-foreground">
                                            Only users from the selected division are available for assignment
                                        </p>
                                    </div>
                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <Label htmlFor="priority" className="font-medium text-foreground">
                                            Priority <span className="text-red-500">*</span>
                                        </Label>
                                        <Select name="priority" defaultValue={task.priority}>
                                            <SelectTrigger id="priority" className="border-muted bg-muted/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                                                        Low
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="medium">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                                        Medium
                                                    </span>
                                                </SelectItem>
                                                <SelectItem value="high">
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                                        High
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.priority} />
                                    </div>
                                    {/* Due Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="deadline" className="font-medium text-foreground">
                                            Due Date
                                        </Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            name="deadline"
                                            defaultValue={formatDateForInput(task.deadline)}
                                            min={new Date().toISOString().split('T')[0]} // Hari ini sebagai minimum
                                            className="border-muted bg-muted/50"
                                        />
                                        <InputError message={errors.deadline} />
                                    </div>
                                </div>
                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="font-medium text-foreground">
                                        Status
                                    </Label>
                                    <Select name="status" defaultValue={task.status}>
                                        <SelectTrigger id="status" className="border-muted bg-muted/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                <span className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                                                    Pending
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="in_progress">
                                                <span className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                    In Progress
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="completed">
                                                <span className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                    Completed
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                                {/* Current Assignment Info */}
                                {(task.division || task.assigned_to_user) && (
                                    <div className="rounded-lg border border-border bg-card p-4">
                                        <p className="text-sm font-medium text-foreground">Current Assignment</p>
                                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Division:</span>
                                                <p className="font-medium">{task.division?.name || 'Not assigned'}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Assigned to:</span>
                                                <p className="font-medium">
                                                    {task.assigned_to_user?.name || 'Unassigned'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Buttons */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <span className="mr-2">Updating...</span>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                            </>
                                        ) : (
                                            'Update Task'
                                        )}
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
