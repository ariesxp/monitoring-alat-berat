<?php

namespace App\Models;

use App\Traits\HasDocumentNumber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Spk extends Model
{
    use SoftDeletes, HasDocumentNumber;

    protected static string $numberColumn = 'nomor_spk';

    protected $table = 'spk';

    protected $fillable = [
        'nomor_spk',
        'kontrak_kerja_id',
        'alat_berat_id',
        'operator_id',
        'tanggal_spk',
        'tanggal_mulai',
        'tanggal_selesai',
        'jenis_pekerjaan',
        'lokasi_kerja',
        'deskripsi',
        'status',
        'approved_by',
        'approved_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_spk' => 'date',
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    public function kontrakKerja(): BelongsTo
    {
        return $this->belongsTo(KontrakKerja::class);
    }

    public function alatBerat(): BelongsTo
    {
        return $this->belongsTo(AlatBerat::class);
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function laporanHarian(): HasMany
    {
        return $this->hasMany(LaporanHarian::class);
    }

    public function pengeluaranGudang(): HasMany
    {
        return $this->hasMany(PengeluaranGudang::class);
    }
}
