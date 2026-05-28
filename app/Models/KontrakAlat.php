<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KontrakAlat extends Model
{
    protected $table = 'kontrak_alat';

    protected $fillable = [
        'kontrak_kerja_id',
        'alat_berat_id',
        'operator_id',
        'tarif_harian',
        'tarif_bulanan',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tarif_harian' => 'decimal:2',
            'tarif_bulanan' => 'decimal:2',
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
}
