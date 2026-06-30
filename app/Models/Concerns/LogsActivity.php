<?php

namespace App\Models\Concerns;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Mencatat perubahan model (created/updated/deleted) ke tabel audit_logs.
 * Pasang trait ini pada model yang ingin diaudit.
 */
trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            $model->writeAuditLog('created', null, $model->getAttributes());
        });

        static::updated(function (Model $model) {
            $changes = $model->getChanges();
            unset($changes['updated_at']);
            if (empty($changes)) {
                return;
            }
            $old = array_intersect_key($model->getOriginal(), $changes);
            $model->writeAuditLog('updated', $old, $changes);
        });

        static::deleted(function (Model $model) {
            $model->writeAuditLog('deleted', $model->getOriginal(), null);
        });
    }

    protected function writeAuditLog(string $event, ?array $old, ?array $new): void
    {
        $hidden = ['password', 'remember_token'];
        $clean = function (?array $values) use ($hidden) {
            if ($values === null) {
                return null;
            }
            foreach ($hidden as $key) {
                if (array_key_exists($key, $values)) {
                    $values[$key] = '••••••';
                }
            }
            return $values;
        };

        $user = Auth::user();
        $label = class_basename($this);

        AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'event' => $event,
            'auditable_type' => static::class,
            'auditable_id' => $this->getKey(),
            'description' => ucfirst($event) . ' ' . $label . ' #' . $this->getKey(),
            'old_values' => $clean($old),
            'new_values' => $clean($new),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
