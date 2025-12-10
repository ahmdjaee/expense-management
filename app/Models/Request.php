<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Request extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'category',
        'amount',
        'title',
        'description',
        'status',
        'payment_method',
        'attachment',
        'head_approved_at',
        'head_approved_by',
        'director_approved_at',
        'director_approved_by',
        'paid_at',
        'paid_by',
        'rejected_reason',
    ];

    protected $casts = [
        'head_approved_at' => 'date',
        'director_approved_at' => 'date',
        'paid_at' => 'date',
    ];

    /**
     * Relasi ke User (pembuat request)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Approvals
     */
    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class);
    }

    /**
     * Relasi ke Payment
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Get head approver
     */
    public function headApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'head_approved_by');
    }

    /**
     * Get director approver
     */
    public function directorApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'director_approved_by');
    }

    /**
     * Get payment processor
     */
    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    /**
     * Check if request can be approved by head
     */
    public function canBeApprovedByHead(): bool
    {
        return $this->status === 'submitted';
    }

    /**
     * Check if request can be approved by director
     */
    public function canBeApprovedByDirector(): bool
    {
        return $this->status === 'head_approved';
    }

    /**
     * Check if request can be paid
     */
    public function canBePaid(): bool
    {
        return $this->status === 'director_approved';
    }
}
