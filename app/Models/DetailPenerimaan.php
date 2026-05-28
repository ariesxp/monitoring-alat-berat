<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailPenerimaan extends Model
{
    protected $table = 'detail_penerimaan';

    protected $fillable = [
        'penerimaan_gudang_id',
        'barang_id',
        'jumlah',
        'harga_satuan',
        'total_harga',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'decimal:2',
            'harga_satuan' => 'decimal:2',
            'total_harga' => 'decimal:2',
        ];
    }

    public function penerimaanGudang(): BelongsTo
    {
        return $this->belongsTo(PenerimaanGudang::class);
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class);
    }
}
