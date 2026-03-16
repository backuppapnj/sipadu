<?php

namespace App\Http\Controllers\Masyarakat;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    /**
     * Menampilkan dashboard masyarakat dengan daftar pengaduan milik sendiri.
     */
    public function index(Request $request): Response
    {
        $complaints = $request->user()
            ->complaints()
            ->with(['category'])
            ->orderByDesc('created_at')
            ->paginate(10)
            ->through(fn ($complaint) => [
                'id' => $complaint->id,
                'ticket_no' => $complaint->ticket_no,
                'title' => $complaint->title,
                'category' => $complaint->category->name,
                'status' => $complaint->status->value,
                'status_label' => $complaint->status->label(),
                'status_color' => $complaint->status->color(),
                'priority' => $complaint->priority->value,
                'sla_deadline' => $complaint->sla_deadline->format('d M Y'),
                'is_overdue' => $complaint->isOverdue(),
                'created_at' => $complaint->created_at->format('d M Y H:i'),
            ]);

        $this->auditService->log('read', null, null, ['page' => 'masyarakat_dashboard']);

        return Inertia::render('Dashboard/Index', [
            'complaints' => $complaints,
        ]);
    }
}
