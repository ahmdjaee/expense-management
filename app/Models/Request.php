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
        'actual_amount',
        'title',
        'description',
        'status',
        'payment_method',
        'attachment',
        'lpj_attachment',
        'lpj_notes',
        'lpj_submitted_at',
        'lpj_verified_at',
        'lpj_verified_by',
        'lpj_verification_notes',
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
        'lpj_submitted_at' => 'datetime',
        'lpj_verified_at' => 'datetime',
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
     * Get LPJ verifier
     */
    public function lpjVerifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lpj_verified_by');
    }

    /**
     * Get approval flow based on requester position
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

        return null;
    }

    /**
     * Check if request can be approved by specific position
     */
    public function canBeApprovedBy(string $position): bool
    {
        if (in_array($this->status, ['rejected', 'paid', 'closed'])) {
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
        $nextPosition = $this->getNextApproverPosition();
        return $nextPosition === null && $this->status !== 'paid' && $this->status !== 'rejected' && $this->status !== 'closed';
    }

    /**
     * Check if request needs LPJ (only for advance/kasbon)
     */
    public function needsLPJ(): bool
    {
        return $this->type === 'advance' && $this->status === 'paid';
    }

    /**
     * Check if LPJ can be submitted
     */
    public function canSubmitLPJ(): bool
    {
        return $this->type === 'advance' && $this->status === 'paid' && !$this->lpj_submitted_at;
    }

    /**
     * Check if LPJ can be verified
     */
    public function canVerifyLPJ(): bool
    {
        return $this->type === 'advance' && $this->status === 'paid' && $this->lpj_submitted_at && !$this->lpj_verified_at;
    }

    /**
     * Get difference amount (actual - requested)
     */
    public function getDifferenceAmount(): ?float
    {
        if (!$this->actual_amount) {
            return null;
        }
        return $this->actual_amount - $this->amount;
    }

    /**
     * Get current status based on approvals
     */
    public function getCurrentStatus(): string
    {
        if ($this->status === 'rejected') {
            return 'rejected';
        }

        if ($this->status === 'closed') {
            return 'closed';
        }

        if ($this->status === 'paid') {
            return 'paid';
        }

        $nextPosition = $this->getNextApproverPosition();

        if ($nextPosition === null) {
            return 'director_approved';
        }

        $approvedPositions = $this->approvals()
            ->where('status', 'approved')
            ->pluck('approver_position')
            ->toArray();

        if (in_array('direktur', $approvedPositions)) {
            return 'director_approved';
        }

        if (in_array('head', $approvedPositions)) {
            return 'head_approved';
        }

        return 'submitted';
    }

    /**
     * Check if specific position is in approval flow
     */
    public function needsApprovalFrom(string $position): bool
    {
        return in_array($position, $this->getApprovalFlow());
    }
}