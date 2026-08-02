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
        'parent_id',
        'level',
        'main_account_id',
        'account_type',
        'financial_statement_type_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'level' => 'integer',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    /**
     * Akun "posting level": akun detail/leaf (tidak memiliki sub-account),
     * yaitu satu-satunya jenjang yang boleh diposting transaksi.
     */
    public function scopePostable($query)
    {
        return $query->whereDoesntHave('children');
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
