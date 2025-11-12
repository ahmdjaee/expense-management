import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Tasks',
        href: '/mytasks',
    },
];

interface Task {
    id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    deadline: string | null;
    division?: {
        id: number;
        name: string;
    };
    assigned_to?: {
        id: number;
        name: string;
    };
    created_at: string;
}

interface MyTasksPageProps {
    tasks: Task[];
}

export default function MyTasksPage({ tasks = [] }: MyTasksPageProps) {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [sortBy, setSortBy] = useState('dueDate');

    // Filter and sort tasks
    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks.filter((task) => {
            const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
            const priorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
            return statusMatch && priorityMatch;
        });

        // Sort tasks
        if (sortBy === 'dueDate') {
            filtered.sort((a, b) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            });
        } else if (sortBy === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (sortBy === 'status') {
            const statusOrder = {
                in_progress: 0,
                pending: 1,
                completed: 2,
            };
            filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        }

        return filtered;
    }, [tasks, selectedStatus, selectedPriority, sortBy]);

    // Calculate stats
    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;

    // Helper functions
    const getDaysLeft = (deadline: string | null) => {
        if (!deadline) return null;
        const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            in_progress:
                'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
            pending:
                'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
            completed:
                'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
        };
        return colors[status] || colors['pending'];
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            in_progress: 'In Progress',
            pending: 'Pending',
            completed: 'Completed',
        };
        return labels[status] || status;
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
            medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
            low: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        };
        return colors[priority] || colors['medium'];
    };

    const getPriorityLabel = (priority: string) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    const getDivisionColor = (division: string) => {
        const colors = {
            Design: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
            Engineering:
                'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
            Marketing:
                'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
            Product:
                'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
            HR: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
        };
        return (
            colors[division] ||
            'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Tasks" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">My Tasks</h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Your personal task list</p>
                    </div>
                    <Link
                        href="/mytasks/create"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        New Task
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-neutral-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Tasks</p>
                        <p className="mt-2 text-4xl font-bold text-blue-900 dark:text-blue-100">{totalTasks}</p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-purple-50 p-6 dark:border-purple-900 dark:bg-purple-950">
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">In Progress</p>
                        <p className="mt-2 text-4xl font-bold text-purple-900 dark:text-purple-100">
                            {inProgressTasks}
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed</p>
                        <p className="mt-2 text-4xl font-bold text-green-900 dark:text-green-100">{completedTasks}</p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Pending</p>
                        <p className="mt-2 text-4xl font-bold text-neutral-900 dark:text-neutral-100">{pendingTasks}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Status Filter */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</p>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-[180px] bg-white dark:bg-neutral-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Priority</p>
                            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                <SelectTrigger className="w-[180px] bg-white dark:bg-neutral-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="hidden h-6 w-px bg-neutral-300 lg:block dark:bg-neutral-700"></div>

                        {/* Sort By */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Sort By</p>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[180px] bg-white dark:bg-neutral-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dueDate">Due Date</SelectItem>
                                    <SelectItem value="priority">Priority</SelectItem>
                                    <SelectItem value="status">Status</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Task Count */}
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Showing {filteredAndSortedTasks.length} of {totalTasks} tasks
                </div>

                {/* Tasks Grid */}
                {filteredAndSortedTasks.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredAndSortedTasks.map((task) => {
                            const daysLeft = getDaysLeft(task.deadline);
                            return (
                                <div
                                    key={task.id}
                                    className="relative rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
                                >
                                    <h3 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-50">
                                        {task.title}
                                    </h3>
                                    <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                                        {task.description || 'No description'}
                                    </p>

                                    {/* Tags */}
                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                        {task.division && (
                                            <span
                                                className={`rounded-md border px-2.5 py-1 text-xs font-medium ${getDivisionColor(task.division.name)}`}
                                            >
                                                {task.division.name}
                                            </span>
                                        )}
                                        <span
                                            className={`rounded-md border px-2.5 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                                        >
                                            {getStatusLabel(task.status)}
                                        </span>
                                        <span
                                            className={`rounded-md border px-2.5 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                                        >
                                            {getPriorityLabel(task.priority)}
                                        </span>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-sm dark:bg-neutral-800">
                                                👤
                                            </div>
                                            <span className="text-sm text-neutral-900 dark:text-neutral-50">
                                                {task.assigned_to?.name || 'You'}
                                            </span>
                                        </div>
                                        {task.status === 'completed' ? (
                                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                                Completed
                                            </span>
                                        ) : daysLeft !== null ? (
                                            <span
                                                className={`text-sm font-medium ${
                                                    daysLeft <= 3
                                                        ? 'text-orange-600 dark:text-orange-400'
                                                        : 'text-neutral-600 dark:text-neutral-400'
                                                }`}
                                            >
                                                {daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-neutral-100 p-6 dark:bg-neutral-800">
                            <svg
                                className="h-12 w-12 text-neutral-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>
                        <p className="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-50">No tasks found</p>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Try adjusting your filters or create a new task
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
