<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\LoginCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LoginCodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = LoginCode::with('users:id,name,email')->withCount('users');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $loginCodes = $query->paginate($perPage)->withQueryString();

        return Inertia::render('crm/logincodes/index', [
            'loginCodes' => $loginCodes,
            'filters' => [
                'search' => $request->search ?? '',
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'value' => $user->id,
                    'label' => $user->name . ' (' . $user->email . ')',
                ];
            });

        return Inertia::render('crm/logincodes/create', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Parse codes if it's a JSON string
        $codes = $request->input('codes');
        if (is_string($codes)) {
            $codes = json_decode($codes, true);
        }

        $validator = Validator::make([
            'codes' => $codes,
            'user_ids' => $request->input('user_ids'),
        ], [
            'codes' => ['required', 'array', 'min:1'],
            'codes.*' => ['required', 'string', 'max:255', 'distinct'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['exists:users,id'],
        ], [
            'codes.required' => 'Please add at least one login code.',
            'codes.min' => 'Please add at least one login code.',
            'codes.*.required' => 'Login code cannot be empty.',
            'codes.*.distinct' => 'Duplicate login codes are not allowed.',
            'user_ids.*.exists' => 'One or more selected users do not exist.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();
        $errors = [];
        $successCount = 0;

        foreach ($validated['codes'] as $code) {
            // Check if code already exists
            if (LoginCode::where('code', $code)->exists()) {
                $errors[] = "Code '{$code}' already exists.";
                continue;
            }

            try {
                $loginCode = LoginCode::create([
                    'code' => $code,
                ]);

                // Attach users if provided
                if (!empty($validated['user_ids'])) {
                    $loginCode->users()->attach($validated['user_ids']);
                }

                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Failed to create code '{$code}': " . $e->getMessage();
            }
        }

        if ($successCount > 0) {
            $message = $successCount . ' login code(s) created successfully.';
            if (count($errors) > 0) {
                $message .= ' However, some codes failed: ' . implode(', ', $errors);
            }

            return redirect()->route('login-codes.index')
                ->with('success', $message);
        }

        return redirect()->back()
            ->withErrors(['codes' => implode(' ', $errors)])
            ->withInput();
    }

    /**
     * Display the specified resource.
     */
    public function show(LoginCode $loginCode)
    {
        $loginCode->load('users:id,name,email');

        return Inertia::render('crm/logincodes/show', [
            'loginCode' => $loginCode,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        // Find login code or fail with 404
        $loginCode = LoginCode::findOrFail($id);
        
        // Load users relationship
        $loginCode->load('users:id,name,email');

        // Get all users for dropdown
        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'value' => $user->id,
                    'label' => $user->name . ' (' . $user->email . ')',
                ];
            });

        // Format assigned users for React Select
        $assignedUsers = $loginCode->users->map(function ($user) {
            return [
                'value' => $user->id,
                'label' => $user->name . ' (' . $user->email . ')',
            ];
        })->values()->toArray();

        return Inertia::render('crm/logincodes/edit', [
            'loginCode' => [
                'id' => $loginCode->id,
                'code' => $loginCode->code,
                'users' => $loginCode->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ];
                })->toArray(),
                'created_at' => $loginCode->created_at->toISOString(),
                'updated_at' => $loginCode->updated_at->toISOString(),
            ],
            'users' => $users,
            'assignedUsers' => $assignedUsers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Find login code or fail with 404
        $loginCode = LoginCode::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('login_codes', 'code')->ignore($loginCode->id),
            ],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['exists:users,id'],
        ], [
            'code.required' => 'Login code is required.',
            'code.unique' => 'This login code already exists.',
            'user_ids.*.exists' => 'One or more selected users do not exist.',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            $validated = $validator->validated();

            // Update code
            $loginCode->update([
                'code' => $validated['code'],
            ]);

            // Sync users (will remove old assignments and add new ones)
            if (isset($validated['user_ids']) && is_array($validated['user_ids'])) {
                $loginCode->users()->sync($validated['user_ids']);
            } else {
                // If no users provided, detach all
                $loginCode->users()->detach();
            }

            return redirect()->route('login-codes.index')
                ->with('success', 'Login code updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to update login code: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            // Find login code or fail with 404
            $loginCode = LoginCode::findOrFail($id);
            
            $code = $loginCode->code;
            // When login code is deleted, pivot table entries are automatically deleted (cascadeOnDelete)
            $loginCode->delete();

            return redirect()->back()
                ->with('success', "Login code '{$code}' deleted successfully.");
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete login code: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove multiple resources from storage.
     */
    public function bulkDestroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'exists:login_codes,id'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator);
        }

        try {
            $count = LoginCode::whereIn('id', $request->ids)->delete();

            return redirect()->back()
                ->with('success', "{$count} login code(s) deleted successfully.");
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete login codes: ' . $e->getMessage()]);
        }
    }

    /**
     * Manage user assignments for a login code.
     */
    public function manageUsers(Request $request, $id)
    {
        // Find login code or fail with 404
        $loginCode = LoginCode::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['exists:users,id'],
            'action' => ['required', 'in:attach,detach,sync'],
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator);
        }

        $validated = $validator->validated();

        try {
            switch ($validated['action']) {
                case 'attach':
                    $loginCode->users()->syncWithoutDetaching($validated['user_ids']);
                    $message = 'Users attached to login code successfully.';
                    break;
                case 'detach':
                    $loginCode->users()->detach($validated['user_ids']);
                    $message = 'Users detached from login code successfully.';
                    break;
                case 'sync':
                    $loginCode->users()->sync($validated['user_ids']);
                    $message = 'User assignments synchronized successfully.';
                    break;
            }

            return redirect()->back()
                ->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to manage users: ' . $e->getMessage()]);
        }
    }
}