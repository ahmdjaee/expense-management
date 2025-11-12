<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
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
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'division_id', // Keep this for backward compatibility
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
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
}