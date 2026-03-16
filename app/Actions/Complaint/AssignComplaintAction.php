<?php

namespace App\Actions\Complaint;

use App\Enums\ComplaintStatusEnum;
use App\Models\Complaint;
use App\Models\User;
use App\Notifications\ComplaintAssignedNotification;
use App\Services\AuditService;

class AssignComplaintAction
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    /**
     * Menugaskan pengaduan ke petugas.
     */
    public function execute(Complaint $complaint, User $assignee, ?string $note = null): Complaint
    {
        $oldValues = [
            'assigned_to' => $complaint->assigned_to,
            'status' => $complaint->status->value,
        ];

        $complaint->update([
            'assigned_to' => $assignee->id,
            'status' => ComplaintStatusEnum::ASSIGNED,
        ]);

        // Membuat entri riwayat status
        $complaint->statusHistory()->create([
            'status' => ComplaintStatusEnum::ASSIGNED,
            'note' => $note ?? "Ditugaskan kepada {$assignee->name}",
            'updated_by' => auth()->id(),
        ]);

        // Mencatat ke audit log (SPBE)
        $this->auditService->log('assign', $complaint, $oldValues, [
            'assigned_to' => $assignee->id,
            'status' => ComplaintStatusEnum::ASSIGNED->value,
        ]);

        // Mengirim notifikasi ke petugas yang ditugaskan
        try {
            $assignee->notify(new ComplaintAssignedNotification($complaint));
        } catch (\Exception) {
            // Notifikasi gagal tidak boleh menggagalkan proses
        }

        return $complaint->fresh();
    }
}
