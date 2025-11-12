<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tasks = Task::with(['division', 'assignedTo'])->get();

        return Inertia::render('task/index', [
            'tasks' => $tasks,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::all();
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
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'required|in:low,medium,high',
            'deadline' => 'nullable|date|after_or_equal:today',
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        // 🔹 2. Simpan ke database
        $task = Task::create([
            'division_id' => $validated['division_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'priority' => $validated['priority'],
            'deadline' => $validated['deadline'] ?? null,
            'status' => $validated['status'],
            'created_by' => auth()->id(),
            'is_personal' => false, // Task dari admin bukan personal
        ]);

        // 🔹 3. (Opsional) Kirim notifikasi jika task punya deadline
        if ($task->deadline) {
            // Jika deadline dalam 7 hari, bisa langsung kirim notifikasi awal
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
        $task = Task::with(['division', 'assignedTo'])->findOrFail($id);
        $users = User::all();
        $divisions = Division::all();

        // Format data task untuk frontend
        $formattedTask = [
            'id' => $task->id,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'priority' => $task->priority,
            'deadline' => $task->deadline,
            'division_id' => $task->division_id,
            'assigned_to' => $task->assigned_to,
            'is_personal' => $task->is_personal,
            'division' => $task->division,
            'assigned_to_user' => $task->assignedTo, // Pastikan nama key sesuai dengan yang diharapkan frontend
        ];

        return Inertia::render('task/edit', [
            'task' => $formattedTask,
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

        $validated = $request->validate([
            'division_id' => 'required|exists:divisions,id',
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'priority' => 'required|in:low,medium,high',
            'deadline' => 'nullable|date|after_or_equal:today',
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        // Handle empty assigned_to
        $assignedTo = $validated['assigned_to'] === '' ? null : $validated['assigned_to'];

        $task->update([
            'division_id' => $validated['division_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'assigned_to' => $assignedTo,
            'priority' => $validated['priority'],
            'deadline' => $validated['deadline'],
            'status' => $validated['status'],
        ]);

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