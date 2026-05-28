<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailGaji extends Model
{
    protected $table = 'detail_gaji';

    protected $fillable = [
        'penggajian_id',
        'operator_id',
        'gaji_pokok',
        'tunjangan',
        'hari_kerja',
        'hari_hadir',
        'lembur_jam',
        'upah_lembur',
        'potongan',
        'keterangan_potongan',
        'total_gaji',
    ];

    protected function casts(): array
    {
        return [
            'gaji_pokok' => 'decimal:2',
            'tunjangan' => 'decimal:2',
            'lembur_jam' => 'decimal:2',
            'upah_lembur' => 'decimal:2',
            'potongan' => 'decimal:2',
            'total_gaji' => 'decimal:2',
        ];
    }

    public function penggajian(): BelongsTo
    {
        return $this->belongsTo(Penggajian::class);
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }
}
