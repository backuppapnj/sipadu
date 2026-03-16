<?php

namespace App\Actions\Complaint;

use App\Enums\ComplaintStatusEnum;
use App\Models\Complaint;
use App\Models\User;
use App\Notifications\SlaWarningNotification;
use App\Services\AuditService;

class EscalateComplaintAction
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    /**
     * Mengeskalasi pengaduan yang melewati SLA.
     * Mengirim notifikasi ke panitera dan admin.
     */
    public function execute(Complaint $complaint, string $escalationLevel = 'warning'): void
    {
        // Mencatat eskalasi ke audit log
        $this->auditService->log('escalate', $complaint, null, [
            'escalation_level' => $escalationLevel,
            'sla_deadline' => $complaint->sla_deadline?->toDateString(),
        ]);

        // Mengirim notifikasi ke panitera
        $paniteras = User::role('panitera')->get();
        foreach ($paniteras as $panitera) {
            try {
                $panitera->notify(new SlaWarningNotification($complaint, $escalationLevel));
            } catch (\Exception) {
                // Lanjutkan ke penerima berikutnya
            }
        }

        // Jika sudah overdue, notifikasi juga ke admin
        if ($escalationLevel === 'overdue') {
            $admins = User::role('admin')->get();
            foreach ($admins as $admin) {
                try {
                    $admin->notify(new SlaWarningNotification($complaint, $escalationLevel));
                } catch (\Exception) {
                    // Lanjutkan ke penerima berikutnya
                }
            }
        }
    }
}
