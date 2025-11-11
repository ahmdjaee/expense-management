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

        return Inertia::render('task/index');
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
