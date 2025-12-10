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

        // Query berdasarkan position user
        $query = ExpenseRequest::with(['user', 'approvals.approver']);

        if ($user->position === 'head') {
            // Head hanya lihat request dari karyawan di divisi yang sama dengan status 'submitted'
            $divisionIds = $user->divisions->pluck('id');

            $requests = $query->whereHas('user', function ($q) use ($divisionIds) {
                $q->whereHas('divisions', function ($q2) use ($divisionIds) {
                    $q2->whereIn('divisions.id', $divisionIds);
                })->where('position', 'karyawan');
            })->where('status', 'submitted')
                ->orderBy('created_at', 'desc')
                ->get();

        } elseif ($user->position === 'direktur') {
            // Direktur hanya lihat request yang sudah di-approve head
            $requests = $query->where('status', 'head_approved')
                ->orderBy('created_at', 'desc')
                ->get();

        } elseif ($user->position === 'finance') {
            // Finance lihat semua request yang sudah di-approve direktur
            $requests = $query->where('status', 'director_approved')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Jika bukan approver, tidak ada yang ditampilkan
            $requests = collect();
        }

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
        $request = ExpenseRequest::with(['user', 'approvals.approver'])
            ->findOrFail($id);

        // Check authorization
        $canView = false;

        if ($user->position === 'head' && $request->status === 'submitted') {
            // Head bisa lihat jika request dari karyawan di divisinya
            $divisionIds = $user->divisions->pluck('id');
            $requesterDivisionIds = $request->user->divisions->pluck('id');
            $canView = $divisionIds->intersect($requesterDivisionIds)->isNotEmpty()
                && $request->user->position === 'karyawan';

        } elseif ($user->position === 'direktur' && $request->status === 'head_approved') {
            $canView = true;

        } elseif ($user->position === 'finance' && $request->status === 'director_approved') {
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
        $expenseRequest = ExpenseRequest::findOrFail($id);

        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        // Check authorization dan update status
        if ($user->position === 'head' && $expenseRequest->canBeApprovedByHead()) {
            // Cek apakah head dari divisi yang sama dengan requester
            $divisionIds = $user->divisions->pluck('id');
            $requesterDivisionIds = $expenseRequest->user->divisions->pluck('id');

            if ($divisionIds->intersect($requesterDivisionIds)->isEmpty()) {
                flash()->error('Anda tidak memiliki wewenang untuk approve request ini');
                return redirect()->back();
            }

            // Update status dan record approval
            $expenseRequest->status = 'head_approved';
            $expenseRequest->head_approved_by = $user->id;
            $expenseRequest->head_approved_at = now();
            $expenseRequest->save();

            // Create approval record
            Approval::create([
                'request_id' => $expenseRequest->id,
                'approver_position' => 'head',
                'approver_id' => $user->id,
                'status' => 'approved',
                'notes' => $request->input('notes'),
                'approved_at' => now(),
            ]);

            flash()->success('Request berhasil di-approve oleh Head');

        } elseif ($user->position === 'direktur' && $expenseRequest->canBeApprovedByDirector()) {
            // Update status dan record approval
            $expenseRequest->status = 'director_approved';
            $expenseRequest->director_approved_by = $user->id;
            $expenseRequest->director_approved_at = now();
            $expenseRequest->save();

            // Create approval record
            Approval::create([
                'request_id' => $expenseRequest->id,
                'approver_position' => 'director',
                'approver_id' => $user->id,
                'status' => 'approved',
                'notes' => $request->input('notes'),
                'approved_at' => now(),
            ]);

            flash()->success('Request berhasil di-approve oleh Direktur');

        } else {
            flash()->error('Anda tidak memiliki wewenang untuk approve request ini');
            return redirect()->back();
        }

        return redirect()->route('expense.approvals');
    }

    /**
     * Reject request
     */
    public function reject(Request $request, string $id)
    {
        $user = auth()->user();
        $expenseRequest = ExpenseRequest::findOrFail($id);

        $request->validate([
            'notes' => 'required|string|max:500',
        ]);

        // Check authorization
        $canReject = false;
        $approverPosition = '';

        if ($user->position === 'head' && $expenseRequest->status === 'submitted') {
            $divisionIds = $user->divisions->pluck('id');
            $requesterDivisionIds = $expenseRequest->user->divisions->pluck('id');

            if ($divisionIds->intersect($requesterDivisionIds)->isNotEmpty()) {
                $canReject = true;
                $approverPosition = 'head';
            }

        } elseif ($user->position === 'direktur' && $expenseRequest->status === 'head_approved') {
            $canReject = true;
            $approverPosition = 'director';
        }

        if (!$canReject) {
            flash()->error('Anda tidak memiliki wewenang untuk reject request ini');
            return redirect()->back();
        }

        // Update status
        $expenseRequest->status = 'rejected';
        $expenseRequest->rejected_reason = $request->input('notes');
        $expenseRequest->save();

        // Create approval record
        Approval::create([
            'request_id' => $expenseRequest->id,
            'approver_position' => $approverPosition,
            'approver_id' => $user->id,
            'status' => 'rejected',
            'notes' => $request->input('notes'),
            'approved_at' => now(),
        ]);

        flash()->success('Request berhasil di-reject');
        return redirect()->route('expense.approvals');
    }
}