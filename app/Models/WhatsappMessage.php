<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WhatsappMessage extends Model
{
    protected $fillable = [
        'sender',
        'sender_name',
        'message',
        'device',
        'direction',
        'parsed_command',
        'parsed_data',
        'processing_status',
        'error_message',
        'related_model_type',
        'related_model_id',
    ];

    protected function casts(): array
    {
        return [
            'parsed_data' => 'array',
        ];
    }

    public function related(): MorphTo
    {
        return $this->morphTo('related', 'related_model_type', 'related_model_id');
    }
}
