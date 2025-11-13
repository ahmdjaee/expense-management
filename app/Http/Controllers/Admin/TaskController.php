<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        // Base query
        $query = Task::with(['division', 'assignedTo']);

        // 🔹 Superadmin → lihat semua task
        if ($user->role === 'superadmin') {
            $tasks = $query->latest()->get();
        }

        // 🔹 Admin → task dari divisinya saja
        elseif ($user->role === 'admin' || $user->role === 'user') {
            $divisionIds = $user->divisions()->pluck('divisions.id');
            $tasks = $query
                ->whereIn('division_id', $divisionIds)
                ->latest()
                ->get();
        }

        return Inertia::render('task/index', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::with('divisions')->get();
        $divisions = Division::all();

        return Inertia::render('task/create', [
            'users' => $users,
            'divisions' => $divisions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 🔹 1. Validasi input
        $validated = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'users' => 'required|array',
            'users.*' => 'exists:users,id',
            'priority' => 'required|in:low,medium,high',
            'deadline' => 'nullable|date|after_or_equal:today',
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        // 🔹 2. Simpan ke database
        foreach ($validated['users'] as $userId) {
            Task::create([
                'division_id' => $validated['division_id'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'assigned_to' => $userId,
                'priority' => $validated['priority'],
                'deadline' => $validated['deadline'] ?? null,
                'status' => $validated['status'],
                'created_by' => auth()->id(),
            ]);
        }

        // 🔹 3. (Opsional) Kirim notifikasi jika task punya deadline
        // if ($task->deadline) {
        //     // Jika deadline dalam 7 hari, bisa langsung kirim notifikasi awal
        //     $diffInDays = now()->diffInDays($task->deadline, false);

        //     if ($diffInDays === 7 && $task->assigned_to) {
        //         \App\Models\TaskNotification::create([
        //             'task_id' => $task->id,
        //             'user_id' => $task->assigned_to,
        //             'notification_date' => now(),
        //             'status' => 'pending',
        //         ]);
        //     }
        // }

        notyf()->success('Task created successfully!');

        // 🔹 4. Redirect atau kembalikan response
        return redirect()->route('tasks')->with('success', 'Task berhasil dibuat.');
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
        $task = Task::findOrFail($id);
        $users = User::with('divisions')->get();
        $divisions = Division::all();

        // Load relasi
        $task->load(['assignedTo', 'division']);

        return Inertia::render('task/edit', [
            'task' => $task,
            'users' => $users,
            'divisions' => $divisions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $task = Task::findOrFail($id);

        // 🔹 1. Validasi input
        $validated = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'assigned_to' => 'required|integer|exists:users,id', // Single user ID
            'priority' => 'required|in:low,medium,high',
            'deadline' => 'nullable|date|after_or_equal:today',
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        // 🔹 2. Update task
        $task->update([
            'division_id' => $validated['division_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'assigned_to' => $validated['assigned_to'],
            'priority' => $validated['priority'],
            'deadline' => $validated['deadline'],
            'status' => $validated['status'],
            // Auto set completed_at jika status = completed
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
        ]);

        flash()->success('Task updated successfully!');

        // 🔹 3. Redirect
        return redirect()->route('tasks')->with('success', 'Task berhasil diupdate.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        return redirect()->route('tasks')->with('success', 'Task berhasil dihapus.');
    }
}