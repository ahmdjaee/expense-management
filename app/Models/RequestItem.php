<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestItem extends Model
{
    protected $fillable = [
        'request_id',
        'description',
        'amount',
        'actual_amount',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }
}
