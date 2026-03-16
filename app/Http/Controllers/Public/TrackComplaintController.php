<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Services\AuditService;
use App\Services\SlaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackComplaintController extends Controller
{
    public function __construct(
        private SlaService $slaService,
        private AuditService $auditService,
    ) {}

    /**
     * Menampilkan halaman cek status pengaduan dan hasil pencarian.
     */
    public function show(Request $request): Response
    {
        $complaint = null;
        $timeline = [];
        $slaInfo = null;
        $ticketNo = $request->input('ticket');

        if ($ticketNo) {
            $complaint = Complaint::where('ticket_no', $ticketNo)
                ->with(['category', 'statusHistory.updater'])
                ->first();

            if ($complaint) {
                $timeline = $complaint->statusHistory
                    ->map(fn ($status) => [
                        'status' => $status->status->value,
                        'label' => $status->status->label(),
                        'color' => $status->status->color(),
                        'note' => $status->note,
                        'updated_by' => $status->updater->name ?? 'Sistem',
                        'created_at' => $status->created_at->format('d M Y H:i'),
                    ]);

                $slaInfo = [
                    'deadline' => $complaint->sla_deadline->format('d M Y'),
                    'is_overdue' => $this->slaService->isOverdue($complaint),
                    'remaining_days' => $this->slaService->getRemainingDays($complaint),
                    'percentage_used' => $this->slaService->getPercentageUsed($complaint),
                ];

                // Audit log: pelacakan pengaduan (SPBE)
                $this->auditService->log('track', $complaint);

                // Sembunyikan data sensitif untuk publik
                $complaint = [
                    'ticket_no' => $complaint->ticket_no,
                    'title' => $complaint->title,
                    'category' => $complaint->category->name,
                    'status' => $complaint->status->value,
                    'status_label' => $complaint->status->label(),
                    'status_color' => $complaint->status->color(),
                    'created_at' => $complaint->created_at->format('d M Y H:i'),
                ];
            }
        }

        return Inertia::render('Pengaduan/Cek', [
            'complaint' => $complaint,
            'timeline' => $timeline,
            'slaInfo' => $slaInfo,
            'ticket' => $ticketNo,
        ]);
    }
}
