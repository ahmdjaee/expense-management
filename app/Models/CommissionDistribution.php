<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionDistribution extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'commission_layer_id', 
        'user_id', 
        'login_code', 
        'deal_id', 
        'symbol', 
        'lot_size', 
        'commission_amount', 
        'deal_time'
    ];
    
    protected $casts = [
        'deal_time' => 'datetime',
        'commission_amount' => 'decimal:2',
        'lot_size' => 'decimal:2',
    ];
    
    public function commissionLayer(): BelongsTo
    {
        return $this->belongsTo(CommissionLayer::class);
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
