<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use App\Models\Request as ExpenseRequest;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments
     */
    public function index()
    {
        $user = auth()->user();

        // Hanya finance yang bisa akses halaman ini
        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        // Request yang siap dibayar (all approvals complete)
        $readyForPayment = ExpenseRequest::with(['user', 'user.divisions', 'approvals.approver'])
            ->get()
            ->filter(function ($request) {
                return $request->canBePaid();
            })
            ->values();

        // Request yang sudah dibayar
        $paidRequests = ExpenseRequest::with(['user', 'payment'])
            ->whereIn('status', ['paid', 'closed'])
            ->orderBy('paid_at', 'desc')
            ->get();

        return Inertia::render('expense/payments/index', [
            'readyForPayment' => $readyForPayment,
            'paidRequests' => $paidRequests,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * Show payment form
     */
    public function show(string $id)
    {
        $user = auth()->user();

        // Hanya finance yang bisa akses
        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        $request = ExpenseRequest::with(['user', 'user.divisions', 'approvals.approver'])
            ->findOrFail($id);

        // Cek apakah request bisa dibayar
        if (!$request->canBePaid()) {
            flash()->error('Request ini belum bisa dibayar. Pastikan semua approval sudah lengkap.');
            return redirect()->route('expense.payments');
        }

        return Inertia::render('expense/payments/pay', [
            'request' => $request,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * Process payment
     */
    public function process(Request $request, string $id)
    {
        $user = auth()->user();

        // Hanya finance yang bisa proses payment
        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki wewenang untuk memproses pembayaran');
            return redirect()->back();
        }

        $expenseRequest = ExpenseRequest::findOrFail($id);

        // Validasi
        if (!$expenseRequest->canBePaid()) {
            flash()->error('Request ini belum bisa dibayar. Pastikan semua approval sudah lengkap.');
            return redirect()->route('expense.payments');
        }

        $request->validate([
            'payment_method' => 'required|in:cash,transfer',
            'reference_number' => 'required_if:payment_method,transfer|nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        // Create payment record
        $payment = Payment::create([
            'request_id' => $expenseRequest->id,
            'amount' => $expenseRequest->amount,
            'payment_method' => $request->input('payment_method'),
            'status' => 'completed',
            'reference_number' => $request->input('reference_number'),
            'paid_at' => now(),
        ]);

        // Update request status based on type
        if ($expenseRequest->type === 'reimbursement') {
            // Reimbursement langsung closed setelah paid
            $expenseRequest->status = 'closed';
            flash()->success('Pembayaran berhasil diproses. Request reimbursement telah ditutup.');
        } else {
            // Advance/Kasbon menunggu LPJ
            $expenseRequest->status = 'paid';
            flash()->success('Pembayaran berhasil diproses. Menunggu LPJ dari pemohon.');
        }

        $expenseRequest->paid_by = $user->id;
        $expenseRequest->paid_at = now();
        $expenseRequest->save();

        return redirect()->route('expense.payments');
    }

    /**
     * Show payment history
     */
    public function history()
    {
        $user = auth()->user();

        // Hanya finance yang bisa akses
        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        $payments = Payment::with(['request.user'])
            ->orderBy('paid_at', 'desc')
            ->paginate(20);

        return Inertia::render('expense/payments/history', [
            'payments' => $payments,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }
}