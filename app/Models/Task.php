<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'division_id',
        'title',
        'description',
        'assigned_to',
        'priority',
        'due_date',
        'status',
        'completed_at',
        'created_by',
    ];
}
