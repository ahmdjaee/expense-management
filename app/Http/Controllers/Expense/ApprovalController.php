<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use App\Models\Request as ExpenseRequest;
use App\Models\Approval;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalController extends Controller
{
    /**
     * Display a listing of pending approvals
     */
    public function index()
    {
        $user = auth()->user();
        $userPosition = $user->position;
        $query = ExpenseRequest::with(['user', 'user.divisions', 'approvals.approver']);

        if ($userPosition === 'karyawan') {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        // Query requests yang perlu approval dari position user
        // $query = ExpenseRequest::with(['user', 'user.divisions', 'approvals.approver']);
        if ($userPosition !== 'direktur') {
        $query->whereHas('user', fn($q) => $q->where('location', $user->location));
        }

        $requests = $query->get()->filter(function ($request) use ($user, $userPosition) {
            // Skip if already rejected or paid
            if (in_array($request->status, ['rejected', 'paid'])) {
                return false;
            }

            // Check if this position needs to approve this request
            if (!$request->needsApprovalFrom($userPosition)) {
                return false;
            }

            // Check if it's this position's turn to approve
            $nextPosition = $request->getNextApproverPosition();
            if ($nextPosition !== $userPosition) {
                return false;
            }

            // Additional check for head: only approve requests from their division
            if ($userPosition === 'head') {
                $divisionIds = $user->divisions->pluck('id');
                $requesterDivisionIds = $request->user->divisions->pluck('id');

                if ($divisionIds->intersect($requesterDivisionIds)->isEmpty()) {
                    return false;
                }
            }

            return true;
        })->values();

        return Inertia::render('expense/approvals/index', [
            'requests' => $requests,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * Show detail request for approval
     */
    public function show(string $id)
    {
        $user = auth()->user();
        $query = ExpenseRequest::with(['user', 'user.divisions', 'approvals.approver']);

        if ($user->position !== 'direktur') {
            $query
                ->whereHas('user', fn($q) => $q->where('location', $user->location));
            
        }

        $request = $query->find($id);
        // LOGIKA BARU: Cek manual jika data null
        if (!$request) {
            flash()->error('Tidak Ditemukan');
            return redirect()->route('expense.expenseDashboard');
        }

        // Check if user can view this request
        $canView = false;
        $userPosition = $user->position;

        // Check if this position is in the approval flow
        if ($request->needsApprovalFrom($userPosition)) {
            // Check if it's this position's turn
            $nextPosition = $request->getNextApproverPosition();

            if ($nextPosition === $userPosition) {
                // For head, check division
                if ($userPosition === 'head') {
                    $divisionIds = $user->divisions->pluck('id');
                    $requesterDivisionIds = $request->user->divisions->pluck('id');
                    $canView = $divisionIds->intersect($requesterDivisionIds)->isNotEmpty();
                } else {
                    $canView = true;
                }
            }
        }

        // Finance can also view if ready for payment
        if ($userPosition === 'finance' && $request->canBePaid()) {
            $canView = true;
        }

        if (!$canView) {
            flash()->error('Anda tidak memiliki akses untuk melihat request ini');
            return redirect()->route('expense.approvals');
        }

        return Inertia::render('expense/approvals/show', [
            'request' => $request,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * Approve request
     */
    public function approve(Request $request, string $id)
    {
        $user = auth()->user();
        $query = ExpenseRequest::with('user');

        if ($user->position !== 'direktur') {
        $query
            ->whereHas('user', fn($q) => $q->where('location', $user->location));
        }

        $expenseRequest = $query->find($id);

        // LOGIKA BARU: Redirect jika null
        if (!$expenseRequest) {
            flash()->error('Tidak ditemukan');
            return redirect()->route('expense.expenseDashboard');
        }

        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $userPosition = $user->position;

        // Verify this user can approve this request
        if (!$expenseRequest->canBeApprovedBy($userPosition)) {
            flash()->error('Anda tidak memiliki wewenang untuk approve request ini atau request sudah diproses');
            return redirect()->back();
        }

        // Additional check for head: must be same division
        if ($userPosition === 'head') {
            $divisionIds = $user->divisions->pluck('id');
            $requesterDivisionIds = $expenseRequest->user->divisions->pluck('id');

            if ($divisionIds->intersect($requesterDivisionIds)->isEmpty()) {
                flash()->error('Anda tidak memiliki wewenang untuk approve request ini');
                return redirect()->back();
            }
        }

        // Create approval record
        Approval::create([
            'request_id' => $expenseRequest->id,
            'approver_position' => $userPosition,
            'approver_id' => $user->id,
            'status' => 'approved',
            'notes' => $request->input('notes'),
            'approved_at' => now(),
        ]);

        // Update request fields based on position
        if ($userPosition === 'head') {
            $expenseRequest->head_approved_by = $user->id;
            $expenseRequest->head_approved_at = now();
        } elseif ($userPosition === 'direktur') {
            $expenseRequest->director_approved_by = $user->id;
            $expenseRequest->director_approved_at = now();
        }

        // Update status
        $expenseRequest->status = $expenseRequest->getCurrentStatus();
        $expenseRequest->save();

        $positionLabel = [
            'head' => 'Head',
            'direktur' => 'Direktur',
            'finance' => 'Finance'
        ][$userPosition] ?? $userPosition;

        flash()->success("Request berhasil di-approve oleh {$positionLabel}");
        return redirect()->route('expense.approvals');
    }

    /**
     * Reject request
     */
    public function reject(Request $request, string $id)
    {
        $user = auth()->user();
        $query = ExpenseRequest::with('user');

        if ($user->position !== 'direktur') {
            $query
                ->whereHas('user', fn($q) => $q->where('location', $user->location));
        }

        $expenseRequest = $query->find($id);

        if (!$expenseRequest) {
            flash()->error('Tidak ditemukan');
            return redirect()->route('expense.expenseDashboard');
        }

        $request->validate([
            'notes' => 'required|string|max:500',
        ]);

        $userPosition = $user->position;

        // Verify this user can reject this request
        if (!$expenseRequest->canBeApprovedBy($userPosition)) {
            flash()->error('Anda tidak memiliki wewenang untuk reject request ini');
            return redirect()->back();
        }

        // Additional check for head: must be same division
        if ($userPosition === 'head') {
            $divisionIds = $user->divisions->pluck('id');
            $requesterDivisionIds = $expenseRequest->user->divisions->pluck('id');

            if ($divisionIds->intersect($requesterDivisionIds)->isEmpty()) {
                flash()->error('Anda tidak memiliki wewenang untuk reject request ini');
                return redirect()->back();
            }
        }

        // Create approval record with rejected status
        Approval::create([
            'request_id' => $expenseRequest->id,
            'approver_position' => $userPosition,
            'approver_id' => $user->id,
            'status' => 'rejected',
            'notes' => $request->input('notes'),
            'approved_at' => now(),
        ]);

        // Update request status
        $expenseRequest->status = 'rejected';
        $expenseRequest->actual_amount = 0;
        $expenseRequest->rejected_reason = $request->input('notes');
        $expenseRequest->save();

        flash()->success('Request berhasil di-reject');
        return redirect()->route('expense.approvals');
    }
}