<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'request_id',
        'amount',
        'payment_method',
        'status',
        'reference_number',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'date',
    ];

    /**
     * Relasi ke Request
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }
}