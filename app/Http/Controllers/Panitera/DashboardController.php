<?php

namespace App\Http\Controllers\Panitera;

use App\Enums\ComplaintStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\User;
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
     * Menampilkan dashboard panitera dengan semua pengaduan dan peringatan eskalasi.
     */
    public function index(Request $request): Response
    {
        $complaints = Complaint::with(['category', 'assignee'])
            ->orderByDesc('created_at')
            ->paginate(15)
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
                'assigned_to_name' => $complaint->assignee?->name ?? 'Belum ditugaskan',
                'sla_deadline' => $complaint->sla_deadline->format('d M Y'),
                'is_overdue' => $complaint->isOverdue(),
                'remaining_days' => $this->slaService->getRemainingDays($complaint),
                'percentage_used' => $this->slaService->getPercentageUsed($complaint),
                'created_at' => $complaint->created_at->format('d M Y H:i'),
            ]);

        // Pengaduan yang memerlukan eskalasi
        $escalations = Complaint::overdue()
            ->with(['category', 'assignee'])
            ->get()
            ->map(fn ($complaint) => [
                'id' => $complaint->id,
                'ticket_no' => $complaint->ticket_no,
                'title' => $complaint->title,
                'sla_deadline' => $complaint->sla_deadline->format('d M Y'),
                'assigned_to_name' => $complaint->assignee?->name ?? 'Belum ditugaskan',
            ]);

        // Daftar petugas untuk assignment
        $petugas = User::role('petugas')->where('is_active', true)->get(['id', 'name']);

        $this->auditService->log('read', null, null, ['page' => 'panitera_dashboard']);

        return Inertia::render('Panitera/Dashboard', [
            'complaints' => $complaints,
            'escalations' => $escalations,
            'petugas' => $petugas,
        ]);
    }
}
