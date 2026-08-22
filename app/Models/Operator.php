<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Operator extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'kode_karyawan',
        'nik_karyawan',
        'nama',
        'nik',
        'jenis_kelamin',
        'tempat_lahir',
        'tanggal_lahir',
        'no_hp',
        'alamat',
        'jabatan',
        'departemen',
        'golongan_id',
        'gaji_pokok',
        'tunjangan',
        'tanggal_masuk',
        'status',
        'status_perkawinan',
        'pendidikan',
        'foto',
    ];

    protected function casts(): array
    {
        return [
            'gaji_pokok' => 'decimal:2',
            'tunjangan' => 'decimal:2',
            'tanggal_masuk' => 'date',
            'tanggal_lahir' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function golongan(): BelongsTo
    {
        return $this->belongsTo(Golongan::class);
    }

    public function spk(): HasMany
    {
        return $this->hasMany(Spk::class);
    }

    public function laporanHarian(): HasMany
    {
        return $this->hasMany(LaporanHarian::class);
    }

    public function absensi(): HasMany
    {
        return $this->hasMany(Absensi::class);
    }

    public function izinCuti(): HasMany
    {
        return $this->hasMany(IzinCuti::class);
    }

    public function detailGaji(): HasMany
    {
        return $this->hasMany(DetailGaji::class);
    }

    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }
}
