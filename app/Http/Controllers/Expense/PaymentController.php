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

        // Request yang siap dibayar (director_approved)
        $readyForPayment = ExpenseRequest::with(['user', 'approvals.approver'])
            ->where('status', 'director_approved')
            ->orderBy('created_at', 'desc')
            ->get();

        // Request yang sudah dibayar
        $paidRequests = ExpenseRequest::with(['user', 'payment'])
            ->where('status', 'paid')
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

        $request = ExpenseRequest::with(['user', 'approvals.approver'])
            ->findOrFail($id);

        // Cek apakah request bisa dibayar
        if (!$request->canBePaid()) {
            flash()->error('Request ini belum bisa dibayar');
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
            flash()->error('Request ini belum bisa dibayar');
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

        // Update request status
        $expenseRequest->status = 'paid';
        $expenseRequest->paid_by = $user->id;
        $expenseRequest->paid_at = now();
        $expenseRequest->save();

        flash()->success('Pembayaran berhasil diproses');
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