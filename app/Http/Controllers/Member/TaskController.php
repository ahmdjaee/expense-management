<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of the member's tasks.
     */
    public function index()
    {
        // Ambil task yang di-assign ke user yang login
        $tasks = Task::with(['division', 'assignedTo'])
            ->where('assigned_to', auth()->id())
            ->orderBy('deadline', 'asc')
            ->get();

        return Inertia::render('mytask/index', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Member tidak perlu pilih user, otomatis ke dirinya sendiri
        return Inertia::render('mytask/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 🔹 1. Validasi input (lebih sederhana dari admin)
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'deadline' => 'nullable|date|after_or_equal:today',
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        // 🔹 2. Ambil division_id dari user yang login
        $user = auth()->user();

        // 🔹 3. Validasi: User harus punya division
        if (!$user->division_id) {
            return back()->withErrors([
                'division' => 'Your account is not assigned to any division. Please contact administrator to assign you to a division before creating tasks.'
            ]);
        }

        // 🔹 4. Simpan ke database dengan auto-assign ke member yang login
        $task = Task::create([
            'division_id' => $user->division_id, // Ambil dari user's division
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'assigned_to' => auth()->id(), // Otomatis ke member yang create
            'priority' => $validated['priority'],
            'deadline' => $validated['deadline'] ?? null,
            'status' => $validated['status'],
            'created_by' => auth()->id(), // Yang buat juga member ini
        ]);

        // 🔹 4. (Opsional) Kirim notifikasi jika task punya deadline
        if ($task->deadline) {
            $diffInDays = now()->diffInDays($task->deadline, false);

            if ($diffInDays === 7 && $task->assigned_to) {
                \App\Models\TaskNotification::create([
                    'task_id' => $task->id,
                    'user_id' => $task->assigned_to,
                    'notification_date' => now(),
                    'status' => 'pending',
                ]);
            }
        }

        // 🔹 5. Redirect ke My Tasks
        return redirect()->route('mytasks')->with('success', 'Personal task berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $task = Task::with(['division', 'assignedTo', 'createdBy'])
            ->where('assigned_to', auth()->id())
            ->findOrFail($id);

        return Inertia::render('mytask/show', [
            'task' => $task,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $task = Task::where('assigned_to', auth()->id())
            ->findOrFail($id);

        return Inertia::render('mytask/edit', [
            'task' => $task,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $task = Task::where('assigned_to', auth()->id())
            ->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'deadline' => 'nullable|date|after_or_equal:today',
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $task->update($validated);

        return redirect()->route('mytasks')->with('success', 'Task berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $task = Task::where('assigned_to', auth()->id())
            ->findOrFail($id);

        $task->delete();

        return redirect()->route('mytasks')->with('success', 'Task berhasil dihapus.');
    }
}