<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PettyCashDetail extends Model
{
    protected $fillable = [
        'petty_cash_id',
        'account_id',
        'description',
        'remark',
        'debit',
        'credit',
    ];

    protected function casts(): array
    {
        return [
            'debit' => 'decimal:2',
            'credit' => 'decimal:2',
        ];
    }

    public function pettyCash(): BelongsTo
    {
        return $this->belongsTo(PettyCash::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
