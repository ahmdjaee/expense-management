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

        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        // Request yang sudah dibayar
        $readyForPayment = ExpenseRequest::with(['user', 'user.divisions', 'approvals.approver'])
            ->whereHas('user', fn($q) => $q->where('location', $user->location))
            ->get()
            ->filter(fn($request) => $request->canBePaid())
            ->values();

        // Request yang siap dibayar (all approvals complete)
        $paidRequests = ExpenseRequest::with(['user', 'payment'])
            ->whereHas('user', fn($q) => $q->where('location', $user->location)) // Tambahkan ini
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

        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        $request = ExpenseRequest::with(['user', 'user.divisions', 'approvals.approver'])
            ->whereHas('user', fn($q) => $q->where('location', $user->location))
            ->find($id);

        // Access protection
        if (!$request) {
            flash()->error('Data tidak ditemukan atau Anda tidak memiliki akses (Beda Lokasi)');
            return redirect()->route('expense.payments');
        }

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

        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki wewenang untuk memproses pembayaran');
            return redirect()->back();
        }

        $expenseRequest = ExpenseRequest::whereHas('user', fn($q) => $q->where('location', $user->location))
            ->find($id);

        // Access protection
        if (!$expenseRequest) {
            flash()->error('Data tidak ditemukan atau Anda tidak memiliki akses');
            return redirect()->route('expense.payments');
        }

        // Validasi Status
        if (!$expenseRequest->canBePaid()) {
            flash()->error('Request ini belum bisa dibayar.');
            return redirect()->route('expense.payments');
        }

        $request->validate([
            'payment_method' => 'required|in:cash,transfer',
            'reference_number' => 'required_if:payment_method,transfer|nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        // Create payment record
        Payment::create([
            'request_id' => $expenseRequest->id,
            'amount' => $expenseRequest->amount,
            'payment_method' => $request->input('payment_method'),
            'status' => 'completed',
            'reference_number' => $request->input('reference_number'),
            'paid_at' => now(),
        ]);

        // Update request status
        if ($expenseRequest->type === 'advance' && $expenseRequest->status === 'lpj_verified') {
            $expenseRequest->status = 'lpj_paid';
            
            $expenseRequest->is_closed = true; 
        } else {
            $expenseRequest->status = 'paid';

            // Logic asli: Jika bukan advance, tutup request setelah dibayar
            if ($expenseRequest->type !== 'advance') {
                $expenseRequest->is_closed = true;
            }
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

        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        $payments = Payment::with(['request.user'])
            ->whereHas('request.user', function ($q) use ($user) {
                $q->where('location', $user->location);
            })
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