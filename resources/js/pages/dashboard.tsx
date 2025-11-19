import TeamPerformance from '@/components/team-performance';
import { UpcomingDeadlines } from '@/components/upcoming-deadlines';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Stats {
    total_tasks: number;
    total_users: number;
    total_divisions: number;
    completed_tasks: number;
    in_progress_tasks: number;
    pending_tasks: number;
    high_priority_tasks: number;
    overdue_tasks: number;
    completion_rate: number;
}

interface TeamMember {
    id: number;
    name: string;
    email: string;
    division: string;
    all_divisions: string;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    completion_rate: number;
}

interface UpcomingDeadline {
    id: number;
    title: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
    status: string;
    assigned_to: string;
    division: string;
    days_remaining: number;
}

interface RecentTask {
    id: number;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    created_by: string;
    assigned_to: string;
}

interface DivisionStat {
    id: number;
    name: string;
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
    member_count: number;
}

interface DashboardProps {
    stats: Stats;
    team_performance: TeamMember[];
    upcoming_deadlines: UpcomingDeadline[];
    recent_tasks: RecentTask[];
    division_stats: DivisionStat[];
}

export default function Dashboard({
    stats,
    team_performance,
    upcoming_deadlines,
    recent_tasks,
    division_stats,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <div className="flex-1 overflow-auto">
                    <div className="mx-auto px-4 py-6">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                                    <p className="mt-1 text-muted-foreground">
                                        Overview of your task management system
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Last updated: {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Total Tasks */}
                            <div className="rounded-lg border border-border bg-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                                        <p className="mt-2 text-3xl font-bold text-foreground">{stats.total_tasks}</p>
                                    </div>
                                    <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                                        <svg
                                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
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
                                </div>
                                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                    <span
                                        className={`flex h-2 w-2 rounded-full ${stats.completion_rate >= 70 ? 'bg-green-500' : stats.completion_rate >= 40 ? 'bg-yellow-500' : 'bg-red-500'} mr-2`}
                                    ></span>
                                    {stats.completion_rate}% completion rate
                                </div>
                            </div>

                            {/* Total Users */}
                            <div className="rounded-lg border border-border bg-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                                        <p className="mt-2 text-3xl font-bold text-foreground">{stats.total_users}</p>
                                    </div>
                                    <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                                        <svg
                                            className="h-6 w-6 text-green-600 dark:text-green-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-muted-foreground">
                                    Across {stats.total_divisions} divisions
                                </div>
                            </div>

                            {/* High Priority Tasks */}
                            <div className="rounded-lg border border-border bg-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                                        <p className="mt-2 text-3xl font-bold text-red-600">
                                            {stats.high_priority_tasks}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900">
                                        <svg
                                            className="h-6 w-6 text-red-600 dark:text-red-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4 text-sm text-muted-foreground">
                                    {stats.overdue_tasks} overdue tasks
                                </div>
                            </div>

                            {/* Task Status Overview */}
                            <div className="rounded-lg border border-border bg-card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Task Status</p>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-foreground">Completed</span>
                                                <span className="font-medium text-green-600">
                                                    {stats.completed_tasks}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-foreground">In Progress</span>
                                                <span className="font-medium text-blue-600">
                                                    {stats.in_progress_tasks}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-foreground">Pending</span>
                                                <span className="font-medium text-orange-600">
                                                    {stats.pending_tasks}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                                        <svg
                                            className="h-6 w-6 text-purple-600 dark:text-purple-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Division Stats */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-xl font-bold text-foreground">Division Performance</h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {division_stats.map((division) => (
                                    <div key={division.id} className="rounded-lg border border-border bg-card p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-foreground">{division.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {division.member_count} members
                                                </p>
                                            </div>
                                            <span
                                                className={`text-sm font-medium ${
                                                    division.completion_rate >= 70
                                                        ? 'text-green-600'
                                                        : division.completion_rate >= 40
                                                          ? 'text-yellow-600'
                                                          : 'text-red-600'
                                                }`}
                                            >
                                                {division.completion_rate}%
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            {division.completed_tasks} of {division.total_tasks} tasks completed
                                        </div>
                                        <div className="mt-2 h-2 w-full rounded-full bg-muted">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    division.completion_rate >= 70
                                                        ? 'bg-green-500'
                                                        : division.completion_rate >= 40
                                                          ? 'bg-yellow-500'
                                                          : 'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.min(division.completion_rate, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-xl font-bold text-foreground">Recent Activity</h2>
                            <div className="rounded-lg border border-border bg-card">
                                <div className="p-4">
                                    {recent_tasks.length > 0 ? (
                                        <div className="space-y-3">
                                            {recent_tasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                                task.status === 'completed'
                                                                    ? 'bg-green-100 text-green-600'
                                                                    : task.status === 'in_progress'
                                                                      ? 'bg-blue-100 text-blue-600'
                                                                      : 'bg-orange-100 text-orange-600'
                                                            }`}
                                                        >
                                                            <svg
                                                                className="h-4 w-4"
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
                                                        <div>
                                                            <p className="font-medium text-foreground">{task.title}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Created by {task.created_by} • {task.created_at}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                task.priority === 'high'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : task.priority === 'medium'
                                                                      ? 'bg-yellow-100 text-yellow-800'
                                                                      : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {task.priority}
                                                        </span>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {task.assigned_to || 'Unassigned'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <svg
                                                className="mx-auto h-12 w-12 text-muted-foreground/50"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1}
                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                />
                                            </svg>
                                            <p className="mt-2">No recent activity</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Analytics Grid */}
                        <div className="space-y-6">
                            {/* Bottom Section - Team Performance & Deadlines */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <div className="lg:col-span-2">
                                    <TeamPerformance data={team_performance} />
                                </div>
                                <div>
                                    <UpcomingDeadlines data={upcoming_deadlines} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
