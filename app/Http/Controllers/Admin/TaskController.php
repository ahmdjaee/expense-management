<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TaskAssignedMail;
use App\Models\Division;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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

               // 🔹 2. Simpan ke database dan kirim email
        $createdTasks = [];
        
        foreach ($validated['users'] as $userId) {
            $task = Task::create([
                'division_id' => $validated['division_id'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'assigned_to' => $userId,
                'priority' => $validated['priority'],
                'deadline' => $validated['deadline'] ?? null,
                'status' => $validated['status'],
                'created_by' => auth()->id(),
            ]);

            $createdTasks[] = $task;

            // 🔹 3. Kirim email ke user yang ditugaskan
            try {
                $user = User::find($userId);
                
                if ($user && $user->email) {
                    Mail::to($user->email)->send(new TaskAssignedMail($task, $user));
                }
            } catch (\Exception $e) {
                // Log error tapi jangan stop proses
                Log::error('Failed to send task email: ' . $e->getMessage());
            }
        }

        flash()->success('Task berhasil dibuat dan email notifikasi telah dikirim!');

        // 🔹 4. Redirect atau kembalikan response
        return redirect()->route('tasks');
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

        flash()->success('Task berhasil ditambahkan!');

        // 🔹 3. Redirect
        return redirect()->route('tasks');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $task = Task::findOrFail($id);
        $task->delete();

        flash()->success('Task berhasil dihapus!');
        return redirect()->route('tasks');
    }
}