<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappRegisteredNumber extends Model
{
    protected $fillable = [
        'operator_id',
        'user_id',
        'phone_number',
        'is_active',
        'can_input_laporan',
        'can_input_absensi',
        'can_input_penerimaan',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'can_input_laporan' => 'boolean',
            'can_input_absensi' => 'boolean',
            'can_input_penerimaan' => 'boolean',
        ];
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
