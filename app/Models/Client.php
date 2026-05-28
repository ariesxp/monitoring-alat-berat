<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'nama_perusahaan',
        'nama_pic',
        'no_hp_pic',
        'email',
        'alamat',
        'npwp',
    ];

    public function kontrakKerja(): HasMany
    {
        return $this->hasMany(KontrakKerja::class);
    }
}
