<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    protected $fillable = [
        'account_number',
        'account_description',
        'main_account_id',
        'account_type',
        'financial_statement_type_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function mainAccount(): BelongsTo
    {
        return $this->belongsTo(MainAccount::class);
    }

    public function financialStatementType(): BelongsTo
    {
        return $this->belongsTo(FinancialStatementType::class);
    }

    public function pettyCashDetails(): HasMany
    {
        return $this->hasMany(PettyCashDetail::class);
    }
}
