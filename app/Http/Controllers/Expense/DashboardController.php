<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use App\Models\Request as ExpenseRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display expense dashboard with user's requests and statistics
     */
    public function index()
    {
        $user = auth()->user();
        $query = ExpenseRequest::with(['user', 'user.divisions', 'approvals.approver']);

        // Get user's requests with relationships
        if ($user->position !== 'direktur') {
            $query
                ->where('user_id', $user->id)
                ->whereHas('user', function ($q) use ($user) {
                    $q->where('location', $user->location);
                });
    }
        $userRequests = $query
                ->orderBy('created_at', 'desc')
                ->get();

        // Calculate statistics
        $stats = [
            'total' => $userRequests->count(),
            'pending' => $userRequests->whereIn('status', ['submitted', 'head_approved'])->count(),
            'approved' => $userRequests->whereIn('status', ['director_approved', 'paid', 'closed'])->count(),
            'rejected' => $userRequests->where('status', 'rejected')->count(),
        ];

        // Get recent requests (last 5)
        $recentRequests = $userRequests->take(5)->values();

        return Inertia::render('expense/dashboard', [
            'auth' => [
                'user' => $user,
            ],
            'recentRequests' => $recentRequests,
            'stats' => $stats,
        ]);
    }
}