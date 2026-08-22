<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IzinCuti extends Model
{
    protected $table = 'izin_cuti';

    protected $fillable = [
        'operator_id',
        'jenis',
        'tanggal_mulai',
        'tanggal_selesai',
        'jumlah_hari',
        'alasan',
        'lampiran',
        'status',
        'catatan_approval',
        'diproses_oleh',
        'diproses_pada',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'jumlah_hari' => 'decimal:1',
            'diproses_pada' => 'datetime',
        ];
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }

    public function pemroses(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diproses_oleh');
    }
}
