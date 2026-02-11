<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Request as ExpenseRequest;
use Illuminate\Support\Facades\Storage; // Tambahkan import ini
use Inertia\Inertia;

class RequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $requests = ExpenseRequest::with(['user', 'approvals.approver'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('expense/request/index', [
            'requests' => $requests,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        // Type in parameter
        $type = $request->query('type', 'reimbursement'); 

        return Inertia::render('expense/request/new', [
            'initialType' => $type, 
        ]);
    }

    // ExpenseRequest model
    public function items()
    {
        return $this->hasMany(RequestItem::class);
    }

        /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,transfer',
            'type' => 'required|in:reimbursement,advance,bill',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
        ]);

        // Handle file upload
        $paths = [];

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $paths[] = $file->store('attachments', 'public');
            }
        }

        $totalAmount = collect($request->items)->sum('amount');

        $user = auth()->user();

        $status = $user->position === 'direktur'
            ? 'director_approved'
            : 'submitted';

        $expenseRequest = ExpenseRequest::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'category' => $request->category,
            'amount' => $totalAmount,
            'actual_amount' => $totalAmount,
            'payment_method' => $request->payment_method,
            'type' => $request->type,
            'status' => $status,
            'attachments' => $paths
        ]);

        foreach ($request->items as $item) {
            $expenseRequest->items()->create([
                'description' => $item['description'],
                'amount' => $item['amount'],
            ]);
        }

        flash()->success('Pengajuan berhasil dibuat.');

        return redirect()->route('expense.requestIndex');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $request = ExpenseRequest::with([
            'user',
            'user.divisions',
            'items',
            'approvals.approver',
            'headApprover',
            'directorApprover',
            'paidBy',
            'payment'
        ])->findOrFail($id);

        // Add approval flow information
        $approvalFlow = $request->getApprovalFlow();
        $nextApprover = $request->getNextApproverPosition();

        // Check if current user can take action
        $currentUser = auth()->user();
        $position = $currentUser->position;
        $canApprove = false;
        if ($position) {
            $canApprove = $request->canBeApprovedBy($position);
        }
        $canPay = $position === 'finance' && $request->canBePaid();
        // $currentUser = auth()->user();
        // $canApprove = $request->canBeApprovedBy($currentUser->position);
        // $canPay = $currentUser->position === 'finance' && $request->canBePaid();

        // Additional check for head
        if ($canApprove && $currentUser->position === 'head') {
            $divisionIds = $currentUser->divisions->pluck('id');
            $requesterDivisionIds = $request->user->divisions->pluck('id');
            $canApprove = $divisionIds->intersect($requesterDivisionIds)->isNotEmpty();
        }

        return Inertia::render('expense/request/detail', [
            'request' => $request,
            'approvalFlow' => $approvalFlow,
            'nextApprover' => $nextApprover,
            'canApprove' => $canApprove,
            'canPay' => $canPay,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        // Hanya pemilik request yang bisa edit
        $request = ExpenseRequest::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Hanya request dengan status 'draft' atau 'rejected' yang bisa diedit
        if (!in_array($request->status, ['draft', 'rejected'])) {
            flash()->error('Pengajuan tidak dapat diedit karena sudah diproses');
            return redirect()->route('expense.requestDetail', $id);
        }

        return Inertia::render('expense/request/edit', [
            'request' => $request,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $expenseRequest = ExpenseRequest::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Hanya request dengan status 'draft' atau 'rejected' yang bisa diedit
        if (!in_array($expenseRequest->status, ['draft', 'rejected'])) {
            flash()->error('Pengajuan tidak dapat diedit karena sudah diproses');
            return redirect()->route('expense.requestDetail', $id);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.amount' => 'required|numeric|min:0',
            'category' => 'required',
            'payment_method' => 'required|in:cash,transfer',
            'type' => 'required|in:reimbursement,advance,bill',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
        ]);

        // Handle file upload
        $paths = $expenseRequest->attachments ?? [];

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $paths[] = $file->store('attachments', 'public');
            }
        }

        $expenseRequest->attachments = $paths;
        $expenseRequest->save();


        // Update the request
        $expenseRequest->title = $request->input('title');
        $expenseRequest->amount = $request->input('amount');
        $expenseRequest->category = $request->input('category');
        $expenseRequest->description = $request->input('description');
        $expenseRequest->payment_method = $request->input('payment_method');
        $expenseRequest->type = $request->input('type');

        // Jika status rejected, reset ke submitted
        if ($expenseRequest->status === 'rejected') {
            $expenseRequest->status = 'submitted';
            $expenseRequest->rejected_reason = null;
        }

        $expenseRequest->save();

        flash()->success('Pengajuan berhasil diperbarui.');

        return redirect()->route('expense.requestDetail', $id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $request = ExpenseRequest::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Hanya request dengan status 'draft' atau 'rejected' yang bisa dihapus
        if (!in_array($request->status, ['draft', 'rejected'])) {
            flash()->error('Pengajuan tidak dapat dihapus karena sudah diproses');
            return redirect()->route('expense.requestDetail', $id);
        }

        // Hapus file attachment jika ada
        if ($request->attachments) {
            foreach ($request->attachments as $path) {
                Storage::disk('public')->delete($path);
            }
        }

        $request->delete();

        flash()->success('Pengajuan berhasil dihapus.');

        return redirect()->route('expense.requestIndex');
    }
}