<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Models\Division;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // Total counts
        $totalTasks = Task::count();
        $totalUsers = User::count();
        $totalDivisions = Division::count();

        // Task statistics
        $completedTasks = Task::where('status', 'completed')->count();
        $inProgressTasks = Task::where('status', 'in_progress')->count();
        $pendingTasks = Task::where('status', 'pending')->count();

        // Priority statistics
        $highPriorityTasks = Task::where('priority', 'high')->where('status', '!=', 'completed')->count();
        $overdueTasks = Task::where('deadline', '<', now())
            ->where('status', '!=', 'completed')
            ->count();

        // Completion rate
        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // Team performance (tasks per user)
        $teamPerformance = User::with(['division', 'divisions'])
            ->withCount(['assignedTasks as total_tasks'])
            ->withCount([
                'assignedTasks as completed_tasks' => function ($query) {
                    $query->where('status', 'completed');
                }
            ])
            ->withCount([
                'assignedTasks as pending_tasks' => function ($query) {
                    $query->where('status', 'pending');
                }
            ])
            ->withCount([
                'assignedTasks as in_progress_tasks' => function ($query) {
                    $query->where('status', 'in_progress');
                }
            ])
            ->having('total_tasks', '>', 0)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'division' => $user->division_name, // Use the accessor
                    'all_divisions' => $user->all_division_names, // All divisions
                    'total_tasks' => $user->total_tasks,
                    'completed_tasks' => $user->completed_tasks,
                    'pending_tasks' => $user->pending_tasks,
                    'in_progress_tasks' => $user->in_progress_tasks,
                    'completion_rate' => $user->total_tasks > 0 ?
                        round(($user->completed_tasks / $user->total_tasks) * 100) : 0,
                ];
            });

        // Upcoming deadlines (next 7 days)
        $upcomingDeadlines = Task::with(['assignedTo', 'division'])
            ->where(function ($query) {
                $query->whereDate('deadline', '>=', now()->toDateString())
                    ->whereDate('deadline', '<=', now()->addDays(7)->toDateString());
            })
            ->where('status', '!=', 'completed')
            ->orderBy('deadline', 'asc')
            ->limit(10)
            ->get()
            ->map(function ($task) {
                $deadline = \Carbon\Carbon::parse($task->deadline);

                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'deadline' => $deadline->format('Y-m-d'),
                    'priority' => $task->priority,
                    'status' => $task->status,
                    'assigned_to' => $task->assignedTo?->name,
                    'division' => $task->division?->name,
                    'days_remaining' => now()->startOfDay()->diffInDays($deadline->startOfDay(), false),
                ];
            });

        // Recent activity (latest tasks)
        $recentTasks = Task::with(['assignedTo', 'division', 'createdBy'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'status' => $task->status,
                    'priority' => $task->priority,
                    'created_at' => $task->created_at->diffForHumans(),
                    'created_by' => $task->createdBy->name,
                    'assigned_to' => $task->assignedTo?->name,
                ];
            });

        // Division statistics - using tasks relationship
        $divisionStats = Division::withCount(['tasks as total_tasks'])
            ->withCount([
                'tasks as completed_tasks' => function ($query) {
                    $query->where('status', 'completed');
                }
            ])
            ->get()
            ->map(function ($division) {
                return [
                    'id' => $division->id,
                    'name' => $division->name,
                    'total_tasks' => $division->total_tasks,
                    'completed_tasks' => $division->completed_tasks,
                    'completion_rate' => $division->total_tasks > 0 ?
                        round(($division->completed_tasks / $division->total_tasks) * 100) : 0,
                    'member_count' => $division->users()->count(), // Count users in this division
                ];
            });

        return Inertia::render('dashboard', [
            'stats' => [
                'total_tasks' => $totalTasks,
                'total_users' => $totalUsers,
                'total_divisions' => $totalDivisions,
                'completed_tasks' => $completedTasks,
                'in_progress_tasks' => $inProgressTasks,
                'pending_tasks' => $pendingTasks,
                'high_priority_tasks' => $highPriorityTasks,
                'overdue_tasks' => $overdueTasks,
                'completion_rate' => $completionRate,
            ],
            'team_performance' => $teamPerformance,
            'upcoming_deadlines' => $upcomingDeadlines,
            'recent_tasks' => $recentTasks,
            'division_stats' => $divisionStats,
        ]);
    }
}