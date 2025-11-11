import AppLayout from '@/layouts/app-layout';
import { tasks } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronDown, Grid3x3, List, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: tasks().url,
    },
];

// Mockup data
const mockTasks = [
    {
        id: 1,
        title: 'Redesign Landing Page',
        description:
            'Complete redesign of the main landing page with modern UI/UX principles',
        division: 'Design',
        assignedTo: 'Sarah Johnson',
        avatar: '👩‍💼',
        status: 'In Progress',
        priority: 'High',
        deadline: '2025-11-14',
        daysLeft: 3,
    },
    {
        id: 2,
        title: 'API Integration for User Dashboard',
        description:
            'Integrate backend API endpoints with frontend dashboard components',
        division: 'Engineering',
        assignedTo: 'Michael Chan',
        avatar: '👨‍💻',
        status: 'Pending',
        priority: 'High',
        deadline: '2025-11-17',
        daysLeft: 6,
    },
    {
        id: 3,
        title: 'Q4 Marketing Campaign Planning',
        description: 'Plan and strategize marketing initiatives for Q4 launch',
        division: 'Marketing',
        assignedTo: 'Nina Sari',
        avatar: '👩‍💼',
        status: 'Pending',
        priority: 'Medium',
        deadline: '2025-11-19',
        daysLeft: 8,
    },
    {
        id: 4,
        title: 'Database Optimization',
        description:
            'Optimize database queries and improve overall performance',
        division: 'Engineering',
        assignedTo: 'Ahmad Rizki',
        avatar: '👨‍💻',
        status: 'Completed',
        priority: 'Medium',
        deadline: '2025-11-09',
        daysLeft: null,
        hasIndicator: true,
    },
    {
        id: 5,
        title: 'Mobile App Responsive Testing',
        description:
            'Test mobile app responsiveness across multiple device sizes',
        division: 'Engineering',
        assignedTo: 'Michael Chan',
        avatar: '👨‍💻',
        status: 'In Progress',
        priority: 'High',
        deadline: '2025-11-13',
        daysLeft: 2,
    },
    {
        id: 6,
        title: 'Brand Guidelines Update',
        description:
            'Update brand guidelines document with new color palette and typography',
        division: 'Design',
        assignedTo: 'Lisa Wang',
        avatar: '👩‍🎨',
        status: 'Pending',
        priority: 'Low',
        deadline: '2025-11-25',
        daysLeft: 14,
    },
];

export default function TaskManagementDashboard() {
    const [selectedDivision, setSelectedDivision] = useState('All Divisions');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [selectedPriority, setSelectedPriority] = useState('All Priorities');
    const [viewMode, setViewMode] = useState('grid');

    const totalTasks = mockTasks.length;
    const completedTasks = mockTasks.filter(
        (t) => t.status === 'Completed',
    ).length;
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    const highPriorityTasks = mockTasks.filter(
        (t) => t.priority === 'High',
    ).length;

    const getStatusColor = (status) => {
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

    const getPriorityColor = (priority) => {
        const colors = {
            High: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
            Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
            Low: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        };
        return colors[priority] || colors['Medium'];
    };

    const getDivisionColor = (division) => {
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
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            All Tasks
                        </h1>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            View and manage all tasks across your organization
                        </p>
                    </div>
                    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        New Task
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Total Tasks
                        </p>
                        <p className="mt-2 text-4xl font-bold text-neutral-900 dark:text-neutral-50">
                            {totalTasks}
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Completion Rate
                        </p>
                        <p className="mt-2 text-4xl font-bold text-neutral-900 dark:text-neutral-50">
                            {completionRate}%
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            High Priority
                        </p>
                        <p className="mt-2 text-4xl font-bold text-red-600 dark:text-red-400">
                            {highPriorityTasks}
                        </p>
                    </div>
                </div>

                {/* Filters and View Toggle */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Division Filter */}
                        <div className="relative">
                            <button className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
                                Division
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700"></div>

                        {/* Status Filter */}
                        <div className="relative">
                            <button className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
                                Status
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700"></div>

                        {/* Priority Filter */}
                        <div className="relative">
                            <button className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800">
                                Priority
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`rounded-md p-2 transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                            }`}
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`rounded-md p-2 transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                            }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Task Count */}
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Showing {mockTasks.length} of {totalTasks} tasks
                </div>

                {/* Tasks Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mockTasks.map((task) => (
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
                                    className={`rounded-md border px-2.5 py-1 text-xs font-medium ${getStatusColor(task.status)}`}
                                >
                                    {task.status}
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
                                {task.daysLeft !== null && (
                                    <span
                                        className={`text-sm font-medium ${
                                            task.daysLeft <= 3
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-neutral-600 dark:text-neutral-400'
                                        }`}
                                    >
                                        {task.daysLeft} days left
                                    </span>
                                )}
                                {task.status === 'Completed' && (
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                        Completed
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
