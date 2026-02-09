<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $authUser = auth()->user();
        
        $query = User::with('divisions');

        if ($authUser->position !== 'direktur') {
            $query->where('location', $authUser->location);
        }

        // Superadmin -> lihat semua user
        // Admin -> lihat hanya user di divisinya
        if ($authUser->role !== 'superadmin' && $authUser->position !== 'direktur') {
            $divisionIds = $authUser->divisions->pluck('id');
            
            $query->whereHas('divisions', fn($q) => 
                $q->whereIn('divisions.id', $divisionIds)
            );
        }

        $users = $query->get();

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

        // Get divisions based on role
        $divisions = $authUser->role === 'superadmin'
            ? Division::all()
            : $authUser->divisions;

        // Get all available login codes for dropdown
        $loginCodes = \App\Models\LoginCode::orderBy('code')
            ->get()
            ->map(function ($loginCode) {
                return [
                    'value' => $loginCode->id,
                    'label' => $loginCode->code,
                ];
            });

        return inertia('user/create', [
            'divisions' => $divisions,
            'loginCodes' => $loginCodes,
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
            'role' => 'required|in:superadmin,admin,user,marketing',
            'position' => 'nullable|in:head,karyawan,direktur,finance',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|in:jkt,jkt1,sby',
            'address' => 'nullable|string|max:255',
            'rekening' => 'nullable|string|max:50',
            'bank' => 'nullable|string|max:50',
            'rekening_name' => 'nullable|string|max:150',
            'divisions' => 'required|array|min:1',
            'login_code_ids' => 'nullable|array', // Array of login code IDs
            'login_code_ids.*' => 'nullable|exists:login_codes,id', // Validate each ID exists
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

        // Create user
        $user = new User();
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->password = Hash::make($validated['password']);
        $user->role = $validated['role'];
        $user->position = $validated['position'] ?? 'karyawan'; // Default karyawan
        $user->phone = $validated['phone'] ?? null;
        $user->location = $validated['location'] ?? 'jkt'; // Default jakarta
        $user->address = $validated['address'] ?? null;
        $user->rekening = $validated['rekening'] ?? null;
        $user->bank = $validated['bank'] ?? null;
        $user->rekening_name = $validated['rekening_name'] ?? null;
        $user->email_verified_at = now();
        $user->save();

        // Sync divisions
        $user->divisions()->sync($validated['divisions']);

        // Attach login codes using many-to-many relationship
        if (!empty($validated['login_code_ids'])) {
            $user->loginCodes()->attach($validated['login_code_ids']);
        }

        flash()->success('User berhasil dibuat');
        return redirect()->route('users');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $authUser = auth()->user();
        $user = User::with(['divisions', 'loginCodes'])->findOrFail($id);

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

        // Get all available login codes for dropdown
        $allLoginCodes = \App\Models\LoginCode::orderBy('code')
            ->get()
            ->map(function ($loginCode) {
                return [
                    'value' => $loginCode->id,
                    'label' => $loginCode->code,
                ];
            });

        // Format user's assigned login codes for React Select
        $userLoginCodes = $user->loginCodes->map(function ($loginCode) {
            return [
                'value' => $loginCode->id,
                'label' => $loginCode->code,
            ];
        })->toArray();  

        return inertia('user/edit', [
            'user' => $user,
            'divisions' => $divisions,
            'loginCodes' => $allLoginCodes,
            'userLoginCodes' => $userLoginCodes,
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $authUser = auth()->user();
        
        // Build validation rules dynamically
        $rules = [
            'name' => 'required|string|max:150',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|min:6',
            'role' => 'required|in:superadmin,admin,user,marketing',
            'position' => 'nullable|in:head,karyawan,direktur,finance',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|in:jkt,jkt1,sby,all',
            'address' => 'nullable|string|max:255',
            'rekening' => 'nullable|string|max:50',
            'bank' => 'nullable|string|max:50',
            'rekening_name' => 'nullable|string|max:150',
            'divisions' => 'required|array|min:1',
            'login_code_ids' => 'nullable|array',
            'login_code_ids.*' => 'nullable|exists:login_codes,id',
        ];

        $validated = $request->validate($rules);

        // Cegah admin mengubah role menjadi superadmin
        if ($authUser->role === 'admin' && $validated['role'] === 'superadmin') {
            flash()->error('Admin tidak dapat mengubah role menjadi superadmin');
            return redirect()->back()->withInput();
        }

        // Jika admin, pastikan hanya memilih divisi miliknya
        if ($authUser->role === 'admin') {
            $validDivisions = $authUser->divisions->pluck('id')->toArray();
            foreach ($validated['divisions'] as $divisionId) {
                if (!in_array($divisionId, $validDivisions)) {
                    flash()->error('Kamu tidak berhak menambahkan user ke divisi ini');
                    return redirect()->back()->withInput();
                }
            }
        }

        // Update user data - Only update fields that are present
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->position = $validated['position'] ?? 'karyawan';
        $user->phone = $validated['phone'] ?? null;
        $user->location = $validated['location'] ?? 'jkt';
        $user->address = $validated['address'] ?? null;
        $user->rekening = $validated['rekening'] ?? null;
        $user->bank = $validated['bank'] ?? null;
        $user->rekening_name = $validated['rekening_name'] ?? null;

        // Only update password if provided and not empty
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        // If password is empty/null, don't update it at all (keeps existing password)

        $user->save();

        // Sync divisions
        $user->divisions()->sync($validated['divisions']);

        // Sync login codes using many-to-many relationship
        if (isset($validated['login_code_ids']) && is_array($validated['login_code_ids']) && count($validated['login_code_ids']) > 0) {
            // Sync (replace all existing with new ones)
            $user->loginCodes()->sync($validated['login_code_ids']);
        } else {
            // If no codes provided or empty array, detach all
            $user->loginCodes()->detach();
        }

        flash()->success('User berhasil diperbarui');
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