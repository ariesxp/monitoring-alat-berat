<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absensi extends Model
{
    protected $table = 'absensi';

    protected $fillable = [
        'operator_id',
        'tanggal',
        'jam_masuk',
        'jam_pulang',
        'status',
        'keterangan',
        'sumber_input',
        'metode',
        'lokasi',
        'foto_masuk',
        'lat_masuk',
        'lng_masuk',
        'jarak_masuk',
        'foto_pulang',
        'lat_pulang',
        'lng_pulang',
        'jarak_pulang',
        'disetujui_oleh',
        'disetujui_pada',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'lat_masuk' => 'decimal:7',
            'lng_masuk' => 'decimal:7',
            'lat_pulang' => 'decimal:7',
            'lng_pulang' => 'decimal:7',
            'jarak_masuk' => 'integer',
            'jarak_pulang' => 'integer',
            'disetujui_pada' => 'datetime',
        ];
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }

    public function penyetuju(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }
}
