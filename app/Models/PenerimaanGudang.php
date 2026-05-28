<?php

namespace App\Models;

use App\Traits\HasDocumentNumber;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PenerimaanGudang extends Model
{
    use HasDocumentNumber;

    protected static string $numberColumn = 'nomor_penerimaan';
    protected $table = 'penerimaan_gudang';

    protected $fillable = [
        'nomor_penerimaan',
        'tanggal_terima',
        'supplier',
        'nomor_surat_jalan',
        'catatan',
        'sumber_input',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_terima' => 'date',
        ];
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailPenerimaan::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
