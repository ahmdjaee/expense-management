<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LoginCode extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the users that have this login code.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'login_code_user')
                    ->withTimestamps();
    }

    /**
     * Scope a query to only include codes assigned to a specific user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->whereHas('users', function($q) use ($userId) {
            $q->where('users.id', $userId);
        });
    }

    /**
     * Scope a query to search codes.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('code', 'like', "%{$search}%")
                    ->orWhereHas('users', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
    }

    /**
     * Check if this code is assigned to any user.
     */
    public function hasUsers(): bool
    {
        return $this->users()->exists();
    }

    /**
     * Get user names as comma-separated string.
     */
    public function getUserNamesAttribute(): string
    {
        return $this->users->pluck('name')->join(', ');
    }
}