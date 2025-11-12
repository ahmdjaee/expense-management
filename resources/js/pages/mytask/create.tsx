import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Form, Head, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Tasks',
        href: '/mytasks',
    },
    {
        title: 'Create Task',
        href: '',
    },
];

export default function MyTaskCreate() {
    const handleCancel = () => {
        router.visit('/mytasks');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Task - My Tasks" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCancel}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            Create Personal Task
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Add a new task to your personal task list
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <Card className="border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                    <Form action="/mytasks/store" method="post" className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                {/* Division Error Alert */}
                                {errors.division && (
                                    <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                                        <div className="text-sm text-red-800 dark:text-red-200">
                                            <p className="font-medium">Division Not Assigned</p>
                                            <p className="mt-1">{errors.division}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="title"
                                        className="font-medium text-neutral-900 dark:text-neutral-50"
                                    >
                                        Task Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Enter task title"
                                        required
                                        className="border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="description"
                                        className="font-medium text-neutral-900 dark:text-neutral-50"
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Describe what needs to be done..."
                                        className="min-h-32 border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                {/* Grid Layout */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="priority"
                                            className="font-medium text-neutral-900 dark:text-neutral-50"
                                        >
                                            Priority <span className="text-red-500">*</span>
                                        </Label>
                                        <Select name="priority" defaultValue="medium">
                                            <SelectTrigger
                                                id="priority"
                                                className="border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
                                            >
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
                                        <Label
                                            htmlFor="dueDate"
                                            className="font-medium text-neutral-900 dark:text-neutral-50"
                                        >
                                            Due Date <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="dueDate"
                                            name="deadline"
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
                                        />
                                        <InputError message={errors.deadline} />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="status"
                                        className="font-medium text-neutral-900 dark:text-neutral-50"
                                    >
                                        Initial Status
                                    </Label>
                                    <Select name="status" defaultValue="pending">
                                        <SelectTrigger
                                            id="status"
                                            className="border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
                                        >
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

                                {/* Info Box */}
                                <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                                    <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                                    <div className="text-sm text-blue-800 dark:text-blue-200">
                                        <p className="font-medium">Personal Task</p>
                                        <p className="mt-1">
                                            This task will be automatically assigned to you and saved to your division.
                                            You can edit or delete it anytime from "My Tasks".
                                        </p>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={processing}
                                        className="border-neutral-300 dark:border-neutral-700"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <span className="mr-2">Creating...</span>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                            </>
                                        ) : (
                                            'Create Task'
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
