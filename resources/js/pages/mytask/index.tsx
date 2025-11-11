import AppLayout from '@/layouts/app-layout';
import { tasks } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'My Tasks',
        href: tasks().url,
    },
];

// Mockup data untuk My Tasks
const myTasks = [
    {
        id: 1,
        title: 'Database Optimization',
        description:
            'Optimize database queries and improve overall performance',
        division: 'Engineering',
        assignedTo: 'Ahmad Rizki',
        avatar: '👨‍💻',
        status: 'Completed',
        priority: 'Medium',
        deadline: '2025-11-09',
        hasIndicator: true,
    },
    {
        id: 2,
        title: 'Security Audit Implementation',
        description:
            'Implement recommended security measures from recent audit',
        division: 'Engineering',
        assignedTo: 'Ahmad Rizki',
        avatar: '👨‍💻',
        status: 'In Progress',
        priority: 'High',
        deadline: '2025-11-16',
        daysLeft: 5,
    },
];

export default function MyTasksPage() {
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [sortBy, setSortBy] = useState('Due Date');

    // Calculate stats
    const totalTasks = myTasks.length;
    const inProgressTasks = myTasks.filter(
        (t) => t.status === 'In Progress',
    ).length;
    const completedTasks = myTasks.filter(
        (t) => t.status === 'Completed',
    ).length;
    const pendingTasks = myTasks.filter((t) => t.status === 'Pending').length;

    const getStatusColor = (status: string) => {
        const colors = {
            'In Progress':
                'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
            Pending:
                'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
            Completed:
                'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
        };
        return colors[status] || colors['Pending'];
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            High: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
            Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
            Low: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        };
        return colors[priority] || colors['Medium'];
    };

    const getDivisionColor = (division: string) => {
        const colors = {
            Design: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
            Engineering:
                'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
            Marketing:
                'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
        };
        return colors[division] || colors['Engineering'];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Tasks" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            My Tasks
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Tasks assigned to Ahmad Rizki
                        </p>
                    </div>
                    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        New Task
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-neutral-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Total Tasks
                        </p>
                        <p className="mt-2 text-4xl font-bold text-blue-900 dark:text-blue-100">
                            {totalTasks}
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-purple-50 p-6 dark:border-purple-900 dark:bg-purple-950">
                        <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            In Progress
                        </p>
                        <p className="mt-2 text-4xl font-bold text-purple-900 dark:text-purple-100">
                            {inProgressTasks}
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                            Completed
                        </p>
                        <p className="mt-2 text-4xl font-bold text-green-900 dark:text-green-100">
                            {completedTasks}
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Pending
                        </p>
                        <p className="mt-2 text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                            {pendingTasks}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Status
                            </p>
                            <div className="relative">
                                <button className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
                                    {selectedStatus}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700"></div>

                        {/* Sort By */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Sort By
                            </p>
                            <div className="relative">
                                <button className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
                                    {sortBy}
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task Count */}
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Showing {myTasks.length} of {totalTasks} tasks
                </div>

                {/* Tasks Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    {myTasks.map((task) => (
                        <div
                            key={task.id}
                            className="relative rounded-xl border border-neutral-200 bg-white p-6 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
                        >
                            {/* Red indicator for specific tasks */}
                            {task.hasIndicator && (
                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-red-500"></div>
                            )}

                            <h3 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-50">
                                {task.title}
                            </h3>
                            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                                {task.description}
                            </p>

                            {/* Tags */}
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span
                                    className={`rounded-md border px-2.5 py-1 text-xs font-medium ${getDivisionColor(task.division)}`}
                                >
                                    {task.division}
                                </span>
                                <span
                                    className={`rounded-md border px-2.5 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                                >
                                    {task.priority}
                                </span>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-sm dark:bg-neutral-800">
                                        {task.avatar}
                                    </div>
                                    <span className="text-sm text-neutral-900 dark:text-neutral-50">
                                        {task.assignedTo}
                                    </span>
                                </div>
                                {task.status === 'Completed' ? (
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                        Completed
                                    </span>
                                ) : task.daysLeft !== undefined ? (
                                    <span
                                        className={`text-sm font-medium ${
                                            task.daysLeft <= 3
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-neutral-600 dark:text-neutral-400'
                                        }`}
                                    >
                                        {task.daysLeft} days left
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
