<?php

namespace App\Models;

use App\Traits\HasDocumentNumber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRequest extends Model
{
    use HasDocumentNumber;

    protected static string $numberColumn = 'nomor_pr';

    protected $fillable = [
        'nomor_pr',
        'domisili',
        'jenis_pr',
        'kode_site',
        'nama_site',
        'posting_date',
        'lokasi_gudang',
        'keterangan',
        'lampiran',
        'requested_by',
        'status',
        'approved_by',
        'approved_at',
        'approval_note',
    ];

    protected function casts(): array
    {
        return [
            'posting_date' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    public function details(): HasMany
    {
        return $this->hasMany(PurchaseRequestDetail::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
