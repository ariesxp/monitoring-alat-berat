<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LaporanHarian extends Model
{
    protected $table = 'laporan_harian';

    protected $fillable = [
        'spk_id',
        'alat_berat_id',
        'operator_id',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'jam_kerja',
        'bbm_liter',
        'jenis_bbm',
        'ritase',
        'rp_per_ritase',
        'status_verifikasi',
        'ritase_koreksi',
        'bbm_koreksi',
        'verified_by',
        'verified_at',
        'hm_awal',
        'hm_akhir',
        'km_awal',
        'km_akhir',
        'jenis_pekerjaan',
        'volume_pekerjaan',
        'satuan_volume',
        'kondisi_alat',
        'catatan',
        'foto',
        'foto_awal',
        'foto_akhir',
        'sumber_input',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'jam_kerja' => 'decimal:2',
            'bbm_liter' => 'decimal:2',
            'bbm_koreksi' => 'decimal:2',
            'ritase' => 'integer',
            'ritase_koreksi' => 'integer',
            'verified_at' => 'datetime',
            'hm_awal' => 'decimal:2',
            'hm_akhir' => 'decimal:2',
        ];
    }

    public function spk(): BelongsTo
    {
        return $this->belongsTo(Spk::class);
    }

    public function alatBerat(): BelongsTo
    {
        return $this->belongsTo(AlatBerat::class);
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
