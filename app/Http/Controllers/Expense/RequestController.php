<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('expense/request/index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('expense/request/new/index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'category' => 'required',
            'description' => 'nullable|string',
            'payment_method' => 'required|in:cash,transfer',
            'type' => 'required|in:reimbursement,advance',
            'attachment' => 'required|file|max:10240',
        ]);

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $filePath = $file->store('attachments', 'public');
        } else {
            $filePath = null;
        }

        // Create the request
        $expenseRequest = new \App\Models\Request();
        $expenseRequest->user_id = auth()->id();
        $expenseRequest->title = $request->input('title');
        $expenseRequest->amount = $request->input('amount');
        $expenseRequest->category = $request->input('category');
        $expenseRequest->description = $request->input('description');
        $expenseRequest->payment_method = $request->input('payment_method');
        $expenseRequest->type = $request->input('type');
        $expenseRequest->attachment = $filePath;
        $expenseRequest->save();

        flash()->success('Pengajuan berhasil dibuat.');

        return redirect()->route('expense.requestIndex');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
