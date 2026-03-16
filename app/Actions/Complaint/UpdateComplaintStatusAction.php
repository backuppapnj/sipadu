<?php

namespace App\Actions\Complaint;

use App\Enums\ComplaintStatusEnum;
use App\Models\Complaint;
use App\Notifications\ComplaintStatusChangedNotification;
use App\Services\AuditService;

class UpdateComplaintStatusAction
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    /**
     * Memperbarui status pengaduan beserta riwayat dan notifikasi.
     */
    public function execute(Complaint $complaint, ComplaintStatusEnum $newStatus, ?string $note = null): Complaint
    {
        $oldStatus = $complaint->status;

        // Validasi transisi status
        if (! $oldStatus->canTransitionTo($newStatus)) {
            throw new \InvalidArgumentException(
                "Transisi dari status '{$oldStatus->label()}' ke '{$newStatus->label()}' tidak diperbolehkan."
            );
        }

        $oldValues = ['status' => $oldStatus->value];

        $updateData = ['status' => $newStatus];

        // Set resolved_at jika status berubah menjadi resolved
        if ($newStatus === ComplaintStatusEnum::RESOLVED) {
            $updateData['resolved_at'] = now();
        }

        $complaint->update($updateData);

        // Membuat entri riwayat status
        $complaint->statusHistory()->create([
            'status' => $newStatus,
            'note' => $note,
            'updated_by' => auth()->id(),
        ]);

        // Mencatat ke audit log (SPBE)
        $this->auditService->log('update_status', $complaint, $oldValues, [
            'status' => $newStatus->value,
        ]);

        // Mengirim notifikasi perubahan status ke pelapor
        try {
            if ($complaint->user) {
                $complaint->user->notify(new ComplaintStatusChangedNotification($complaint, $oldStatus, $newStatus));
            }
        } catch (\Exception) {
            // Notifikasi gagal tidak boleh menggagalkan proses
        }

        return $complaint->fresh();
    }
}
