<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use App\Models\Request as ExpenseRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportsController extends Controller
{
    /**
     * Display reports and analytics page
     * Shows different data based on user role/position
     */
    public function index()
    {
        $user = auth()->user();

        // Start building query with relationships
        $query = ExpenseRequest::with(['user', 'user.divisions', 'approvals.approver'])
            ->whereHas('user', function ($q) use ($user) {
                $q->where('location', $user->location);
            });

        // Filter based on user position
        switch ($user->position) {
            case 'karyawan':
                // Karyawan can only see their own requests
                $query->where('user_id', $user->id);
                break;

            case 'head':
                // Head can see requests from their divisions
                $divisionIds = $user->divisions->pluck('id');
                $query->whereHas('user.divisions', function ($q) use ($divisionIds) {
                    $q->whereIn('divisions.id', $divisionIds);
                });
                break;

            case 'direktur':
            case 'finance':
                // Director and finance can see all requests
                // No filter needed
                break;

            default:
                // Default to only showing user's own requests
                $query->where('user_id', $user->id);
                break;
        }

        // Get all requests ordered by creation date
        $requests = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('expense/reports/index', [
            'auth' => [
                'user' => $user,
            ],
            'requests' => $requests,
        ]);
    }
}