<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ApiToken extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'token',
        'device',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Membuat token acak baru untuk sebuah user dan mengembalikan instance-nya.
     */
    public static function issue(User $user, ?string $device = null, string $name = 'android'): self
    {
        return static::create([
            'user_id'   => $user->id,
            'name'      => $name,
            'token'     => Str::random(72),
            'device'    => $device,
            'last_used_at' => now(),
        ]);
    }
}
