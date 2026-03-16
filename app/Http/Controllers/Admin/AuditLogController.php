<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    /**
     * Menampilkan daftar audit log (read-only — SPBE).
     */
    public function index(Request $request): Response
    {
        $query = AuditLog::with('user')
            ->orderByDesc('created_at');

        // Filter berdasarkan aksi
        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        // Filter berdasarkan pengguna
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        // Filter berdasarkan rentang tanggal
        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->input('from'));
        }
        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->input('to') . ' 23:59:59');
        }

        $logs = $query->paginate(25)
            ->through(fn ($log) => [
                'id' => $log->id,
                'user_name' => $log->user?->name ?? 'Anonim',
                'user_ip' => $log->user_ip,
                'action' => $log->action,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id' => $log->subject_id,
                'request_id' => $log->request_id,
                'created_at' => $log->created_at->format('d M Y H:i:s'),
            ]);

        $this->auditService->log('read', null, null, ['page' => 'admin_audit_logs']);

        return Inertia::render('Admin/AuditLog/Index', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'user_id', 'from', 'to']),
        ]);
    }
}
