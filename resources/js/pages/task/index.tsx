import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { getDivisionColor } from '@/lib/badge-color';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { GridIcon, ListIcon, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: '/tasks', // Update ke path langsung
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
}

interface TaskManagementDashboardProps {
    tasks: Task[];
}

export default function TaskManagementDashboard({ tasks = [] }: TaskManagementDashboardProps) {
    const [selectedDivision, setSelectedDivision] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPriority, setSelectedPriority] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const { auth } = usePage<{ auth: { user: { role: string } } }>().props;
    const authRole = auth.user.role;

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const divisionMatch = selectedDivision === 'all' || task.division?.id.toString() === selectedDivision;
            const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
            const priorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
            return divisionMatch && statusMatch && priorityMatch;
        });
    }, [tasks, selectedDivision, selectedStatus, selectedPriority]);

    const stats = useMemo(() => {
        return {
            highPriority: tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length,
            overdueTasks: tasks.filter((t) => {
                if (t.status === 'completed' || !t.deadline) return false;
                const daysLeft = Math.ceil(
                    (new Date(t.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                );
                return daysLeft < 0;
            }).length,
            completionRate:
                tasks.length > 0
                    ? Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)
                    : 0,
        };
    }, [tasks]);

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/tasks/${id}`);
        }
    };

    const handleEdit = (id: number) => {
        router.visit(`/tasks/${id}/edit`);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            in_progress: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
            pending: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
            completed: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300',
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
            high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300',
            medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300',
            low: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300',
        };
        return colors[priority] || colors['medium'];
    };

    const getPriorityLabel = (priority: string) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    // 修改这个函数，让它返回正数（剩余天数）或负数（已过期天数）
    const getDaysLeft = (deadline: string | null) => {
        if (!deadline) return null;
        return Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Task Management" />
            <div className="flex-1 overflow-auto">
                <div className="mx-auto px-4 py-6">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">All Tasks</h1>
                                <p className="mt-1 text-muted-foreground">
                                    View and manage all tasks across your organization
                                </p>
                            </div>
                            {authRole === 'admin' || authRole === 'superadmin' ? (
                                <Link href="/tasks/create">
                                    <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                                        <Plus className="h-4 w-4" />
                                        New Task
                                    </Button>
                                </Link>
                            ) : null}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="mb-1 text-xs font-medium text-muted-foreground">Total Tasks</p>
                                <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="mb-1 text-xs font-medium text-muted-foreground">Completion Rate</p>
                                <p className="text-2xl font-bold text-foreground">{stats.completionRate}%</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="mb-1 text-xs font-medium text-muted-foreground">High Priority</p>
                                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="mb-1 text-xs font-medium text-muted-foreground">Overdue</p>
                                <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="mb-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                                {authRole === 'superadmin' ? (
                                    <div className="flex-1">
                                        <label className="mb-2 block text-sm font-medium text-foreground">
                                            Division
                                        </label>
                                        <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                                            <SelectTrigger className="bg-card">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Divisions</SelectItem>
                                                <SelectItem value="1">HRGA</SelectItem>
                                                <SelectItem value="2">Design</SelectItem>
                                                <SelectItem value="3">IT</SelectItem>
                                                <SelectItem value="4">DEALING</SelectItem>
                                                <SelectItem value="5">ACCOUNTING</SelectItem>
                                                <SelectItem value="6">WAKIL PIALANG</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : null}

                                <div className="flex-1">
                                    <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="bg-card">
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

                                <div className="flex-1">
                                    <label className="mb-2 block text-sm font-medium text-foreground">Priority</label>
                                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                        <SelectTrigger className="bg-card">
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
                            </div>

                            {/* View Mode Toggle */}
                            <div className="ml-4 hidden gap-2 md:flex">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className="h-10 w-10"
                                >
                                    <GridIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                    className="h-10 w-10"
                                >
                                    <ListIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredTasks.length} of {tasks.length} tasks
                        </p>
                    </div>

                    {/* Tasks Grid/List */}
                    <div
                        className={
                            viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
                        }
                    >
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const daysLeft = getDaysLeft(task.deadline);
                                return (
                                    <div
                                        key={task.id}
                                        className={`relative rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg ${
                                            daysLeft !== null && daysLeft < 0 && task.status !== 'completed'
                                                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                                                : ''
                                        }`}
                                    >
                                        {/* Dropdown Menu */}
                                        {authRole === 'admin' || authRole === 'superadmin' ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(task.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit Task
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(task.id)}
                                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Task
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : null}

                                        <h3 className="mb-2 pr-8 text-base font-semibold text-foreground">
                                            {task.title}
                                        </h3>
                                        <p className="mb-4 text-sm text-muted-foreground">
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
                                            {daysLeft !== null && daysLeft < 0 && task.status !== 'completed' && (
                                                <span className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between border-t border-border pt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm">
                                                    👤
                                                </div>
                                                <span className="text-sm text-foreground">
                                                    {task.assigned_to?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                            {task.status === 'completed' ? (
                                                <span className="text-sm font-medium text-green-600">Completed</span>
                                            ) : daysLeft !== null ? (
                                                <span
                                                    className={`text-sm font-medium ${
                                                        daysLeft < 0
                                                            ? 'text-red-600'
                                                            : daysLeft <= 3
                                                              ? 'text-orange-600'
                                                              : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {daysLeft < 0
                                                        ? `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? 's' : ''}`
                                                        : daysLeft === 0
                                                          ? 'Due today'
                                                          : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full flex items-center justify-center py-12 text-muted-foreground">
                                <div className="text-center">
                                    <p className="text-lg font-medium">No tasks found</p>
                                    <p className="text-sm">Try adjusting your filters</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
