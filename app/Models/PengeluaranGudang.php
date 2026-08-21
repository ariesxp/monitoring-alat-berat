<?php

namespace App\Models;

use App\Traits\HasDocumentNumber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PengeluaranGudang extends Model
{
    use HasDocumentNumber;

    protected static string $numberColumn = 'nomor_pengeluaran';
    protected $table = 'pengeluaran_gudang';

    protected $fillable = [
        'nomor_pengeluaran',
        'tanggal_keluar',
        'spk_id',
        'alat_berat_id',
        'tujuan',
        'sumber_input',
        'jenis_pengeluaran',
        'foto',
        'catatan',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_keluar' => 'date',
        ];
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailPengeluaran::class);
    }

    public function spk(): BelongsTo
    {
        return $this->belongsTo(Spk::class);
    }

    public function alatBerat(): BelongsTo
    {
        return $this->belongsTo(AlatBerat::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
