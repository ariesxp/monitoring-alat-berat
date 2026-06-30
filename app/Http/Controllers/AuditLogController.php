<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::query()->with('user:id,name');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('auditable_type', 'like', "%{$search}%");
            });
        }

        if ($event = $request->get('event')) {
            $query->where('event', $event);
        }

        return Inertia::render('AuditLog/Index', [
            'logs' => $query->latest()->paginate(20)->withQueryString()->through(fn ($log) => [
                'id' => $log->id,
                'user_name' => $log->user_name ?? '-',
                'event' => $log->event,
                'description' => $log->description,
                'model' => $log->auditable_type ? class_basename($log->auditable_type) : null,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at?->format('d/m/Y H:i:s'),
            ]),
            'filters' => $request->only(['search', 'event']),
            'events' => ['created', 'updated', 'deleted', 'login', 'logout'],
        ]);
    }

    public function show(AuditLog $auditLog)
    {
        return Inertia::render('AuditLog/Show', [
            'log' => [
                'id' => $auditLog->id,
                'user_name' => $auditLog->user_name ?? '-',
                'event' => $auditLog->event,
                'description' => $auditLog->description,
                'model' => $auditLog->auditable_type ? class_basename($auditLog->auditable_type) : null,
                'auditable_id' => $auditLog->auditable_id,
                'old_values' => $auditLog->old_values,
                'new_values' => $auditLog->new_values,
                'ip_address' => $auditLog->ip_address,
                'user_agent' => $auditLog->user_agent,
                'created_at' => $auditLog->created_at?->format('d/m/Y H:i:s'),
            ],
        ]);
    }
}
