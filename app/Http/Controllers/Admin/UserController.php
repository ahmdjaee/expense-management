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
            'position' => 'nullable|in:head,karyawan,direktur,finance',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'rekening' => 'nullable|string|max:50',
            'bank' => 'nullable|string|max:50',
            'rekening_name' => 'nullable|string|max:150',
            'divisions' => 'required|array|min:1',
        ]);

        // Cegah admin membuat superadmin
        if ($authUser->role === 'admin' && $validated['role'] === 'superadmin') {
            flash()->error('Admin tidak dapat membuat superadmin');
            return redirect()->back();
        }

        // Jika admin, pastikan hanya memilih divisi miliknya
        if ($authUser->role === 'admin') {
            $validDivisions = $authUser->divisions->pluck('id')->toArray();
            foreach ($validated['divisions'] as $divisionId) {
                if (!in_array($divisionId, $validDivisions)) {
                    flash()->error('Kamu tidak berhak menambahkan user ke divisi ini');
                    return redirect()->back();
                }
            }
        }

        $user = new User();
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->password = Hash::make($validated['password']);
        $user->role = $validated['role'];
        $user->position = $validated['position'] ?? 'karyawan'; // Default karyawan
        $user->phone = $validated['phone'] ?? null;
        $user->address = $validated['address'] ?? null;
        $user->rekening = $validated['rekening'] ?? null;
        $user->bank = $validated['bank'] ?? null;
        $user->rekening_name = $validated['rekening_name'] ?? null;
        $user->email_verified_at = now();
        $user->save();

        $user->divisions()->sync($validated['divisions']);

        flash()->success('User berhasil dibuat');
        return redirect()->route('users');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $authUser = auth()->user();
        $user = User::with('divisions')->findOrFail($id);

        // Cek authorization
        if ($authUser->role === 'admin') {
            // Admin hanya bisa edit user di divisinya
            $authDivisionIds = $authUser->divisions->pluck('id')->toArray();
            $userDivisionIds = $user->divisions->pluck('id')->toArray();

            if (empty(array_intersect($authDivisionIds, $userDivisionIds))) {
                flash()->error('Kamu tidak berhak mengedit user ini');
                return redirect()->route('users');
            }

            // Admin tidak bisa edit superadmin
            if ($user->role === 'superadmin') {
                flash()->error('Admin tidak dapat mengedit superadmin');
                return redirect()->route('users');
            }
        }

        // Get divisions based on role
        $divisions = $authUser->role === 'superadmin'
            ? Division::all()
            : $authUser->divisions;

        return inertia('user/edit', [
            'user' => $user,
            'divisions' => $divisions,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $authUser = auth()->user();
        $user = User::findOrFail($id);

        // Cek authorization
        if ($authUser->role === 'admin') {
            // Admin hanya bisa edit user di divisinya
            $authDivisionIds = $authUser->divisions->pluck('id')->toArray();
            $userDivisionIds = $user->divisions->pluck('id')->toArray();

            if (empty(array_intersect($authDivisionIds, $userDivisionIds))) {
                flash()->error('Kamu tidak berhak mengedit user ini');
                return redirect()->route('users');
            }

            // Admin tidak bisa edit superadmin
            if ($user->role === 'superadmin') {
                flash()->error('Admin tidak dapat mengedit superadmin');
                return redirect()->route('users');
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|min:6',
            'role' => 'required|in:superadmin,admin,user',
            'position' => 'nullable|in:head,karyawan,direktur,finance',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'rekening' => 'nullable|string|max:50',
            'bank' => 'nullable|string|max:50',
            'rekening_name' => 'nullable|string|max:150',
            'divisions' => 'required|array|min:1',
        ]);

        // Cegah admin membuat/mengubah jadi superadmin
        if ($authUser->role === 'admin' && $validated['role'] === 'superadmin') {
            flash()->error('Admin tidak dapat mengubah role menjadi superadmin');
            return redirect()->back();
        }

        // Jika admin, pastikan hanya memilih divisi miliknya
        if ($authUser->role === 'admin') {
            $validDivisions = $authUser->divisions->pluck('id')->toArray();
            foreach ($validated['divisions'] as $divisionId) {
                if (!in_array($divisionId, $validDivisions)) {
                    flash()->error('Kamu tidak berhak menambahkan user ke divisi ini');
                    return redirect()->back();
                }
            }
        }

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        // Update password hanya jika diisi
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->role = $validated['role'];

        // Hanya superadmin yang bisa mengubah position
        if ($authUser->role === 'superadmin') {
            $user->position = $validated['position'] ?? 'karyawan';
        }

        // Update informasi tambahan
        $user->phone = $validated['phone'] ?? null;
        $user->address = $validated['address'] ?? null;
        $user->rekening = $validated['rekening'] ?? null;
        $user->bank = $validated['bank'] ?? null;
        $user->rekening_name = $validated['rekening_name'] ?? null;

        $user->save();

        $user->divisions()->sync($validated['divisions']);

        flash()->success('User berhasil diupdate');
        return redirect()->route('users');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $authUser = auth()->user();
        $user = User::findOrFail($id);

        // Cegah user menghapus dirinya sendiri
        if ($authUser->id === $user->id) {
            flash()->error('Kamu tidak dapat menghapus akun sendiri');
            return redirect()->back();
        }

        // Cek authorization
        if ($authUser->role === 'admin') {
            // Admin hanya bisa hapus user di divisinya
            $authDivisionIds = $authUser->divisions->pluck('id')->toArray();
            $userDivisionIds = $user->divisions->pluck('id')->toArray();

            if (empty(array_intersect($authDivisionIds, $userDivisionIds))) {
                flash()->error('Kamu tidak berhak menghapus user ini');
                return redirect()->back();
            }

            // Admin tidak bisa hapus superadmin
            if ($user->role === 'superadmin') {
                flash()->error('Admin tidak dapat menghapus superadmin');
                return redirect()->back();
            }
        }

        // Hapus relasi divisions
        $user->divisions()->detach();

        // Hapus user
        $user->delete();

        flash()->success('User berhasil dihapus');
        return redirect()->route('users');
    }
}