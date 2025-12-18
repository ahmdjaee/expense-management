<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommissionLayer extends Model
{
    use HasFactory;
    
    protected $fillable = ['name', 'rate', 'color', 'user_id'];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function commissionDistributions(): HasMany
    {
        return $this->hasMany(CommissionDistribution::class);
    }
}