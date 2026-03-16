<?php

namespace App\Http\Controllers\Petugas;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\SlaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private SlaService $slaService,
        private AuditService $auditService,
    ) {}

    /**
     * Menampilkan dashboard petugas dengan pengaduan yang ditugaskan.
     */
    public function index(Request $request): Response
    {
        $complaints = $request->user()
            ->assignedComplaints()
            ->with(['category', 'user'])
            ->orderByDesc('created_at')
            ->paginate(10)
            ->through(fn ($complaint) => [
                'id' => $complaint->id,
                'ticket_no' => $complaint->ticket_no,
                'title' => $complaint->title,
                'category' => $complaint->category->name,
                'complainant_name' => $complaint->is_anonymous ? 'Anonim' : $complaint->complainant_name,
                'status' => $complaint->status->value,
                'status_label' => $complaint->status->label(),
                'status_color' => $complaint->status->color(),
                'priority' => $complaint->priority->value,
                'priority_label' => $complaint->priority->label(),
                'sla_deadline' => $complaint->sla_deadline->format('d M Y'),
                'is_overdue' => $complaint->isOverdue(),
                'remaining_days' => $this->slaService->getRemainingDays($complaint),
                'percentage_used' => $this->slaService->getPercentageUsed($complaint),
                'created_at' => $complaint->created_at->format('d M Y H:i'),
            ]);

        $this->auditService->log('read', null, null, ['page' => 'petugas_dashboard']);

        return Inertia::render('Petugas/Dashboard', [
            'complaints' => $complaints,
        ]);
    }
}
