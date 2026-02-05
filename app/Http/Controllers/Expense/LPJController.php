<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use App\Models\Request as ExpenseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LPJController extends Controller
{
    /**
     * Show LPJ submission form
     */
    public function create(string $id)
    {
        $user = auth()->user();
        $request = ExpenseRequest::with(['user', 'user.divisions'])
            ->findOrFail($id);

        // Check authorization - only request owner can submit LPJ
        if ($request->user_id !== $user->id) {
            flash()->error('Anda tidak memiliki akses untuk submit LPJ ini');
            return redirect()->route('expense.requestIndex');
        }

        // Check if can submit LPJ
        if (!$request->canSubmitLPJ()) {
            flash()->error('LPJ tidak dapat disubmit untuk request ini');
            return redirect()->route('expense.requestDetail', $id);
        }

        return Inertia::render('expense/lpj/create', [
            'request' => $request,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * Store LPJ submission
     */
    public function store(Request $request, string $id)
    {
        $user = auth()->user();
        $expenseRequest = ExpenseRequest::findOrFail($id);

        // Check authorization
        if ($expenseRequest->user_id !== $user->id) {
            flash()->error('Anda tidak memiliki akses untuk submit LPJ ini');
            return redirect()->back();
        }

        // Check if can submit LPJ
        if (!$expenseRequest->canSubmitLPJ()) {
            flash()->error('LPJ tidak dapat disubmit untuk request ini');
            return redirect()->back();
        }

        $request->validate([
            'actual_amount' => 'required|numeric|min:0',
            'lpj_notes' => 'required|string|max:1000',
            'lpj_attachment' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png',
        ]);

        // Handle file upload
        if ($request->hasFile('lpj_attachment')) {
            $file = $request->file('lpj_attachment');
            $filePath = $file->store('lpj_attachments', 'public');
            $expenseRequest->lpj_attachment = $filePath;
        }

        // Update request with LPJ data
        $expenseRequest->actual_amount = $request->input('actual_amount');
        $expenseRequest->lpj_notes = $request->input('lpj_notes');
        $expenseRequest->lpj_submitted_at = now();
        $expenseRequest->status = 'lpj_made';
        $expenseRequest->save();

        flash()->success('LPJ berhasil disubmit. Menunggu verifikasi dari Finance.');

        return redirect()->route('expense.requestDetail', $id);
    }

    /**
     * Show LPJ verification list (Finance only)
     */
    public function index()
    {
        $user = auth()->user();

        // Only finance can access
        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        // Get requests that need LPJ verification
        $requests = ExpenseRequest::with(['user', 'user.divisions'])
            ->whereHas('user', fn($q) => $q->where('location', $user->location))
            ->where('type', 'advance')
            ->where('status', 'lpj_made')
            ->whereNotNull('lpj_submitted_at')
            ->whereNull('lpj_verified_at')
            ->orderBy('lpj_submitted_at', 'desc')
            ->get();

        return Inertia::render('expense/lpj/index', [
            'requests' => $requests,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * Show LPJ verification detail
     */
    public function show(string $id)
    {
        $user = auth()->user();

        // Only finance can access
        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        // TAMBAHAN: Gunakan 'find' dan filter 'whereHas' location
        $request = ExpenseRequest::with(['user', 'user.divisions', 'payment'])
            ->whereHas('user', fn($q) => $q->where('location', $user->location))
            ->find($id);

        // LOGIKA PENCEGAHAN: Redirect jika null (ID salah atau Lokasi beda)
        if (!$request) {
            flash()->error('Anda tidak memiliki akses ke halaman ini');
            return redirect()->route('expense.expenseDashboard');
        }

        // Check if can verify LPJ
        if (!$request->canVerifyLPJ()) {
            flash()->error('LPJ tidak dapat diverifikasi untuk request ini');
            return redirect()->route('expense.lpj.index');
        }

        return Inertia::render('expense/lpj/show', [
            'request' => $request,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * Verify LPJ
     */
    public function verify(Request $request, string $id)
    {
        $user = auth()->user();

        // Only finance can verify
        if ($user->position !== 'finance') {
            flash()->error('Anda tidak memiliki wewenang untuk verifikasi LPJ');
            return redirect()->back();
        }

        $expenseRequest = ExpenseRequest::findOrFail($id);

        // Check if can verify LPJ
        if (!$expenseRequest->canVerifyLPJ()) {
            flash()->error('LPJ tidak dapat diverifikasi untuk request ini');
            return redirect()->back();
        }

        $request->validate([
            'verification_notes' => 'nullable|string|max:500',
        ]);

        // Update LPJ verification
        $expenseRequest->lpj_verified_at = now();
        $expenseRequest->lpj_verified_by = $user->id;
        $expenseRequest->lpj_verification_notes = $request->input('verification_notes');
        $expenseRequest->status = 'lpj_verified';
        $expenseRequest->is_closed = true;
        $expenseRequest->save();

        // Check if there's difference and create additional payment/refund if needed
        $difference = $expenseRequest->getDifferenceAmount();

        if ($difference != 0) {
            // You can create additional payment record here if needed
            // For now, just log it in verification notes
            flash()->success(
                "LPJ berhasil diverifikasi. " .
                ($difference > 0 ? "Kelebihan: Rp " . number_format($difference, 0, ',', '.') :
                    "Kekurangan: Rp " . number_format(abs($difference), 0, ',', '.'))
            );
        } else {
            flash()->success('LPJ berhasil diverifikasi. Request telah ditutup.');
        }

        return redirect()->route('expense.lpj.index');
    }
}