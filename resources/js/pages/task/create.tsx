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
import { useMemo, useState } from 'react';
import ReactSelect from 'react-select';

interface TaskFormProps {
    users: Array<{ id: number; name: string; divisions: Array<{ id: number; name: string; description: string }> }>;
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
    const [selectedDivision, setSelectedDivision] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    // Filter user berdasarkan divisi yang dipilih
    const filteredUsers = useMemo(() => {
        if (!selectedDivision) return [];
        return users
            .filter((user) =>
                user.divisions.some((division) => division.id.toString() === selectedDivision)
            )
            .map((user) => ({
                value: user.id,
                label: user.name,
            }));
    }, [selectedDivision, users]);

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
                                        <Select
                                            name="division_id"
                                            onValueChange={(value) => {
                                                setSelectedDivision(value);
                                                setSelectedUser(null); // reset user saat ganti divisi
                                            }}
                                        >
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
                                        <ReactSelect
                                            isMulti
                                            name="users[]"
                                            options={filteredUsers}
                                            value={selectedUser}
                                            onChange={setSelectedUser}
                                            isDisabled={!selectedDivision}
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            placeholder={
                                                selectedDivision ? 'Pilih user...' : 'Pilih divisi terlebih dahulu'
                                            }
                                        />
                                        <InputError message={errors.users} />
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
                                            name="deadline"
                                            required
                                            className="border-muted bg-muted/50"
                                        />
                                        <InputError message={errors.deadline} />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="font-medium text-foreground">
                                        Initial Status
                                    </Label>
                                    <Select name="status" defaultValue="pending">
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
