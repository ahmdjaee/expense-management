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
        'head_approved_at' => 'datetime',
        'director_approved_at' => 'datetime',
        'paid_at' => 'datetime',
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
     * Get approval flow based on requester position
     * Returns array of positions that need to approve
     */
    public function getApprovalFlow(): array
    {
        $requesterPosition = $this->user->position;

        switch ($requesterPosition) {
            case 'karyawan':
                return ['head', 'direktur', 'finance'];
            case 'head':
                return ['direktur', 'finance'];
            case 'direktur':
                return ['finance'];
            case 'finance':
                return ['direktur'];
            default:
                return [];
        }
    }

    /**
     * Get next approver position in flow
     */
    public function getNextApproverPosition(): ?string
    {
        $flow = $this->getApprovalFlow();
        $approvedPositions = $this->approvals()
            ->where('status', 'approved')
            ->pluck('approver_position')
            ->toArray();

        foreach ($flow as $position) {
            if (!in_array($position, $approvedPositions)) {
                return $position;
            }
        }

        return null; // All approved
    }

    /**
     * Check if request can be approved by specific position
     */
    public function canBeApprovedBy(string $position): bool
    {
        // Check if already rejected or paid
        if (in_array($this->status, ['rejected', 'paid'])) {
            return false;
        }

        $nextPosition = $this->getNextApproverPosition();
        return $nextPosition === $position;
    }

    /**
     * Check if request can be paid
     */
    public function canBePaid(): bool
    {
        // Only finance can pay
        // All approvals must be complete
        $nextPosition = $this->getNextApproverPosition();
        return $nextPosition === null && $this->status !== 'paid' && $this->status !== 'rejected';
    }

    /**
     * Get current status based on approvals
     */
    public function getCurrentStatus(): string
    {
        if ($this->status === 'rejected') {
            return 'rejected';
        }

        if ($this->status === 'paid') {
            return 'paid';
        }

        $nextPosition = $this->getNextApproverPosition();

        if ($nextPosition === null) {
            // All approvals complete, ready for payment
            return 'director_approved';
        }

        // Check what's been approved
        $approvedPositions = $this->approvals()
            ->where('status', 'approved')
            ->pluck('approver_position')
            ->toArray();

        if (in_array('head', $approvedPositions)) {
            return 'head_approved';
        }

        return 'submitted';
    }

    /**
     * Check if request can be approved by head
     */
    public function canBeApprovedByHead(): bool
    {
        return $this->canBeApprovedBy('head');
    }

    /**
     * Check if request can be approved by director
     */
    public function canBeApprovedByDirector(): bool
    {
        return $this->canBeApprovedBy('direktur');
    }

    /**
     * Check if specific position is in approval flow
     */
    public function needsApprovalFrom(string $position): bool
    {
        return in_array($position, $this->getApprovalFlow());
    }
}