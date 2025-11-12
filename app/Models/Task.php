<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = [
        'division_id',
        'title',
        'description',
        'assigned_to',
        'priority',
        'deadline',
        'status',
        'completed_at',
        'created_by',
        'is_personal',
    ];

    protected $casts = [
        'is_personal' => 'boolean',
        'deadline' => 'date',
        'completed_at' => 'datetime',
    ];

    /*
      |--------------------------------------------------------------------------
      | RELATIONSHIPS
      |--------------------------------------------------------------------------
      */

    /**
     * Task milik divisi tertentu
     */
    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    /**
     * Task diassign ke user tertentu
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * User yang membuat task ini
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Daftar notifikasi terkait task ini
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(TaskNotification::class);
    }
}