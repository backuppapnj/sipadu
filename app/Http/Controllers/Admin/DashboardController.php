<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ComplaintStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Services\AuditService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    /**
     * Menampilkan dashboard admin dengan statistik lengkap.
     */
    public function index(): Response
    {
        // Statistik umum
        $stats = [
            'total' => Complaint::count(),
            'submitted' => Complaint::where('status', ComplaintStatusEnum::SUBMITTED)->count(),
            'in_progress' => Complaint::where('status', ComplaintStatusEnum::IN_PROGRESS)->count(),
            'resolved' => Complaint::where('status', ComplaintStatusEnum::RESOLVED)->count(),
            'overdue' => Complaint::overdue()->count(),
        ];

        // Statistik per kategori
        $byCategory = ComplaintCategory::withCount('complaints')
            ->orderByDesc('complaints_count')
            ->get(['id', 'name', 'code', 'complaints_count']);

        // Statistik per status
        $byStatus = collect(ComplaintStatusEnum::cases())
            ->map(fn ($status) => [
                'status' => $status->value,
                'label' => $status->label(),
                'color' => $status->color(),
                'count' => Complaint::where('status', $status)->count(),
            ]);

        // Pengaduan terbaru
        $recentComplaints = Complaint::with(['category', 'assignee'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'ticket_no' => $c->ticket_no,
                'title' => $c->title,
                'category' => $c->category->name,
                'status' => $c->status->value,
                'status_label' => $c->status->label(),
                'status_color' => $c->status->color(),
                'assigned_to_name' => $c->assignee?->name,
                'created_at' => $c->created_at->format('d M Y H:i'),
            ]);

        // Kalkulasi SLA compliance
        $totalResolved = Complaint::where('status', ComplaintStatusEnum::RESOLVED)->count();
        $resolvedOnTime = Complaint::where('status', ComplaintStatusEnum::RESOLVED)
            ->whereColumn('resolved_at', '<=', 'sla_deadline')
            ->count();
        $slaCompliance = $totalResolved > 0 ? round(($resolvedOnTime / $totalResolved) * 100, 1) : 0;

        $stats['sla_compliance'] = $slaCompliance;

        $this->auditService->log('read', null, null, ['page' => 'admin_dashboard']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'byCategory' => $byCategory,
            'byStatus' => $byStatus,
            'recentComplaints' => $recentComplaints,
        ]);
    }
}
