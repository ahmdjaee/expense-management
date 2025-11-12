<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $authUser = auth()->user();

        // Superadmin -> lihat semua user
        // Admin -> lihat hanya user di divisinya
        if ($authUser->role === 'superadmin') {
            $users = User::with('divisions')->get();
        } else {
            $divisionIds = $authUser->divisions->pluck('id');
            $users = User::with('divisions')
                ->whereHas('divisions', fn($q) => $q->whereIn('divisions.id', $divisionIds))
                ->get();
        }
        return Inertia::render('user/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $authUser = auth()->user();

        $divisions = $authUser->role === 'superadmin'
            ? Division::all()
            : $authUser->divisions;

        return inertia('user/create', [
            'divisions' => $divisions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $authUser = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:superadmin,admin,user',
            'divisions' => 'required|array|min:1',
        ]);

        // Cegah admin membuat superadmin
        if ($authUser->role === 'admin' && $validated['role'] === 'superadmin') {
            abort(403, 'Admin tidak dapat membuat superadmin');
        }

        // Jika admin, pastikan hanya memilih divisi miliknya
        if ($authUser->role === 'admin') {
            $validDivisions = $authUser->divisions->pluck('id')->toArray();
            foreach ($validated['divisions'] as $divisionId) {
                if (!in_array($divisionId, $validDivisions)) {
                    abort(403, 'Kamu tidak berhak menambahkan user ke divisi ini');
                }
            }
        }

        $user = new User();
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->password = Hash::make($validated['password']);
        $user->role = $validated['role'];
        $user->email_verified_at = now();
        $user->save();

        $user->divisions()->sync($validated['divisions']);

        return redirect()->route('users')->with('success', 'User berhasil dibuat.');
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
