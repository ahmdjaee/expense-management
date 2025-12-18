<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'division_id',
        'role',
        'position',
        'phone',
        'address',
        'rekening',
        'bank',
        'rekening_name',
        'login_code',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'login_code' => 'array', // Otomatis convert array ↔ JSON
        ];
    }

    /*
      |--------------------------------------------------------------------------
      | RELATIONSHIPS
      |--------------------------------------------------------------------------
      */

    /**
     * The divisions that belong to the User (many-to-many)
     */
    public function divisions(): BelongsToMany
    {
        return $this->belongsToMany(Division::class)
            ->withPivot('role_in_division')
            ->withTimestamps();
    }

    /**
     * User's primary division (one-to-many for backward compatibility)
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class, 'division_id');
    }

    /**
     * Tasks assigned to this user
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Tasks created by this user
     */
    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    /**
     * Expense requests created by this user
     */
    public function expenseRequests(): HasMany
    {
        return $this->hasMany(Request::class, 'user_id');
    }

    /**
     * Approvals made by this user
     */
    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class, 'approver_id');
    }

    /**
     * Get user's division name (primary division or first from many-to-many)
     */
    public function getDivisionNameAttribute(): string
    {
        if ($this->division) {
            return $this->division->name;
        }

        if ($this->divisions->isNotEmpty()) {
            return $this->divisions->first()->name;
        }

        return 'No Division';
    }

    /**
     * Get all division names for user
     */
    public function getAllDivisionNamesAttribute(): string
    {
        if ($this->divisions->isNotEmpty()) {
            return $this->divisions->pluck('name')->implode(', ');
        }

        if ($this->division) {
            return $this->division->name;
        }

        return 'No Division';
    }

    /**
     * Check if user is head
     */
    public function isHead(): bool
    {
        return $this->position === 'head';
    }

    /**
     * Check if user is director
     */
    public function isDirector(): bool
    {
        return $this->position === 'direktur';
    }

    /**
     * Check if user is finance
     */
    public function isFinance(): bool
    {
        return $this->position === 'finance';
    }

    /**
     * Check if user can approve requests
     */
    public function canApprove(): bool
    {
        return in_array($this->position, ['head', 'direktur']);
    }

    /**
     * Check if user can process payments
     */
    public function canProcessPayment(): bool
    {
        return $this->position === 'finance';
    }

    /**
     * Get the login codes for the user (Many-to-Many).
     */
    public function loginCodes(): BelongsToMany
    {
        return $this->belongsToMany(LoginCode::class, 'login_code_user')
            ->withTimestamps();
    }

    /**
     * Get the login codes as array of strings (for easy access).
     */
    public function getLoginCodesArrayAttribute()
    {
        return $this->loginCodes()->pluck('code')->toArray();
    }

    /**
     * Check if user has a specific login code.
     */
    public function hasLoginCode($code): bool
    {
        return $this->loginCodes()->where('code', $code)->exists();
    }

    /**
     * Attach a login code to the user.
     */
    public function attachLoginCode($loginCodeId): void
    {
        $this->loginCodes()->attach($loginCodeId);
    }

    /**
     * Detach a login code from the user.
     */
    public function detachLoginCode($loginCodeId): void
    {
        $this->loginCodes()->detach($loginCodeId);
    }

    /**
     * Sync login codes for the user.
     */
    public function syncLoginCodes(array $loginCodeIds): void
    {
        $this->loginCodes()->sync($loginCodeIds);
    }

    // Tambahkan di Model User.php
    public function commissionLayers(): HasMany
    {
        return $this->hasMany(CommissionLayer::class);
    }

    public function commissionDistributions(): HasMany
    {
        return $this->hasMany(CommissionDistribution::class);
    }

    public function totalCommission()
    {
        return $this->commissionDistributions()->sum('commission_amount');
    }
}