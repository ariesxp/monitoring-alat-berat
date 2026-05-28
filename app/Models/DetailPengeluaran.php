<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailPengeluaran extends Model
{
    protected $table = 'detail_pengeluaran';

    protected $fillable = [
        'pengeluaran_gudang_id',
        'barang_id',
        'jumlah',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'decimal:2',
        ];
    }

    public function pengeluaranGudang(): BelongsTo
    {
        return $this->belongsTo(PengeluaranGudang::class);
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }
}
