<?php

namespace App\Models;

use App\Traits\HasDocumentNumber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PettyCash extends Model
{
    use HasDocumentNumber;

    protected $table = 'petty_cash';

    protected static string $numberColumn = 'voucher_number';

    protected $fillable = [
        'posting_date',
        'voucher_number',
        'description',
        'remark',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'posting_date' => 'date',
        ];
    }

    public function details(): HasMany
    {
        return $this->hasMany(PettyCashDetail::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getTotalDebitAttribute(): float
    {
        return $this->details->sum('debit');
    }

    public function getTotalCreditAttribute(): float
    {
        return $this->details->sum('credit');
    }
}
