<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barang extends Model
{
    use SoftDeletes;

    protected $table = 'barang';

    protected $fillable = [
        'kategori_barang_id',
        'kode_barang',
        'barcode',
        'nama_barang',
        'satuan',
        'stok_minimum',
        'stok_saat_ini',
        'harga_satuan',
        'lokasi_gudang',
        'gambar',
    ];

    protected function casts(): array
    {
        return [
            'stok_minimum' => 'decimal:2',
            'stok_saat_ini' => 'decimal:2',
            'harga_satuan' => 'decimal:2',
        ];
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriBarang::class, 'kategori_barang_id');
    }

    public function detailPenerimaan(): HasMany
    {
        return $this->hasMany(DetailPenerimaan::class);
    }

    public function detailPengeluaran(): HasMany
    {
        return $this->hasMany(DetailPengeluaran::class);
    }

    public function scopeStokMenipis($query)
    {
        return $query->whereColumn('stok_saat_ini', '<=', 'stok_minimum');
    }
}
