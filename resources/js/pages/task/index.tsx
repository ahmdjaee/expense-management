import { TaskCard } from '@/components/task-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { tasks } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { GridIcon, ListIcon, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DIVISIONS, TASKS } from '../mockdata';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasks',
        href: tasks().url,
    },
];

export default function TaskManagementDashboard() {
    const [selectedDivision, setSelectedDivision] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPriority, setSelectedPriority] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredTasks = useMemo(() => {
        return TASKS.filter((task) => {
            const divisionMatch = selectedDivision === 'all' || task.division.toString() === selectedDivision;
            const statusMatch = selectedStatus === 'all' || task.status === selectedStatus;
            const priorityMatch = selectedPriority === 'all' || task.priority === selectedPriority;
            return divisionMatch && statusMatch && priorityMatch;
        });
    }, [selectedDivision, selectedStatus, selectedPriority]);

    const stats = useMemo(() => {
        return {
            highPriority: TASKS.filter((t) => t.priority === 'high' && t.status !== 'completed').length,
            completionRate: Math.round((TASKS.filter((t) => t.status === 'completed').length / TASKS.length) * 100),
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Task" />
            <div className="flex-1 overflow-auto">
                <div className="mx-auto max-w-7xl p-4 md:p-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">All Tasks</h1>
                                <p className="mt-1 text-muted-foreground">
                                    View and manage all tasks across your organization
                                </p>
                            </div>
                            <Link href={tasks().url + '/create'}>
                                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                                    <Plus className="h-4 w-4" />
                                    New Task
                                </Button>
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="mb-1 text-xs font-medium text-muted-foreground">Total Tasks</p>
                                <p className="text-2xl font-bold text-foreground">{TASKS.length}</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="mb-1 text-xs font-medium text-muted-foreground">Completion Rate</p>
                                <p className="text-2xl font-bold text-foreground">{stats.completionRate}%</p>
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <p className="mb-1 text-xs font-medium text-muted-foreground">High Priority</p>
                                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="mb-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                                <div className="flex-1">
                                    <label className="mb-2 block text-sm font-medium text-foreground">Division</label>
                                    <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                                        <SelectTrigger className="bg-card">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Divisions</SelectItem>
                                            {DIVISIONS.map((d) => (
                                                <SelectItem key={d.id} value={d.id.toString()}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1">
                                    <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="bg-card">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in-progress">In Progress</SelectItem>
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
                            Showing {filteredTasks.length} of {TASKS.length} tasks
                        </p>
                    </div>

                    {/* Tasks Grid/List */}
                    <div
                        className={
                            viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
                        }
                    >
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
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
