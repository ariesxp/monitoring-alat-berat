<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlatBerat extends Model
{
    use SoftDeletes;

    protected $table = 'alat_berat';

    protected $fillable = [
        'kode_alat',
        'nama_alat',
        'jenis',
        'merk',
        'tahun',
        'status_kepemilikan',
        'nomor_seri',
        'nomor_polisi',
        'no_mesin',
        'no_chassis',
        'dealer',
        'harga',
        'invoice',
        'hm_awal',
        'hm_sewa_awal',
        'status',
        'lokasi_terakhir',
        'foto',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'harga' => 'decimal:2',
            'hm_awal' => 'decimal:2',
            'hm_sewa_awal' => 'decimal:2',
        ];
    }

    public function kontrakAlat(): HasMany
    {
        return $this->hasMany(KontrakAlat::class);
    }

    public function spk(): HasMany
    {
        return $this->hasMany(Spk::class);
    }

    public function laporanHarian(): HasMany
    {
        return $this->hasMany(LaporanHarian::class);
    }

    public function scopeTersedia($query)
    {
        return $query->where('status', 'tersedia');
    }
}
