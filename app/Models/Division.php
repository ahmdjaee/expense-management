<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Division extends Model
{
    protected $fillable = ['name', 'description'];

    /**
     * Users that belong to the division
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role_in_division')
            ->withTimestamps();
    }

    /**
     * Tasks that belong to the division
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the primary users (those with division_id set) - for backward compatibility
     */
    public function primaryUsers(): HasMany
    {
        return $this->hasMany(User::class, 'division_id');
    }
}