<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Golongan extends Model
{
    protected $fillable = [
        'kode_golongan',
        'nama_golongan',
        'gaji_golongan',
    ];

    protected function casts(): array
    {
        return [
            'gaji_golongan' => 'decimal:2',
        ];
    }

    public function operators(): HasMany
    {
        return $this->hasMany(Operator::class);
    }
}
