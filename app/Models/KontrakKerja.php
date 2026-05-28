<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KontrakKerja extends Model
{
    use SoftDeletes;

    protected $table = 'kontrak_kerja';

    protected $fillable = [
        'nomor_kontrak',
        'client_id',
        'nama_proyek',
        'lokasi_proyek',
        'deskripsi',
        'tanggal_mulai',
        'tanggal_selesai',
        'nilai_kontrak',
        'status',
        'approved_by',
        'approved_at',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'approved_at' => 'datetime',
            'nilai_kontrak' => 'decimal:2',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function kontrakAlat(): HasMany
    {
        return $this->hasMany(KontrakAlat::class);
    }

    public function spk(): HasMany
    {
        return $this->hasMany(Spk::class);
    }

    public function biayaOperasional(): HasMany
    {
        return $this->hasMany(BiayaOperasional::class);
    }

    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }
}
