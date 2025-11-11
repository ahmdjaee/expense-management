<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
    ];

    /*
      |--------------------------------------------------------------------------
      | RELATIONSHIPS
      |--------------------------------------------------------------------------
      */

    /**
     * Task milik divisi tertentu
     */
    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    /**
     * Task diassign ke user tertentu
     */
    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * User yang membuat task ini
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Daftar notifikasi terkait task ini
     */
    public function notifications()
    {
        return $this->hasMany(TaskNotification::class);
    }
}
