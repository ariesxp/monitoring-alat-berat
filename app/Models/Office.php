<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Lokasi kantor untuk validasi radius absensi (multi-office).
 */
class Office extends Model
{
    protected $fillable = [
        'nama',
        'lat',
        'lng',
        'radius_m',
        'jam_masuk',
        'batas_terlambat',
        'jam_pulang',
        'aktif',
    ];

    protected function casts(): array
    {
        return [
            'lat'      => 'float',
            'lng'      => 'float',
            'radius_m' => 'integer',
            'aktif'    => 'boolean',
        ];
    }

    public function scopeAktif($query)
    {
        return $query->where('aktif', true);
    }
}
