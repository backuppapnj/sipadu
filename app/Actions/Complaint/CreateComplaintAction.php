<?php

namespace App\Actions\Complaint;

use App\Actions\Attachment\StoreAttachmentsAction;
use App\Enums\ComplaintStatusEnum;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Notifications\ComplaintSubmittedNotification;
use App\Services\AuditService;
use App\Services\SlaService;
use Illuminate\Support\Facades\DB;

class CreateComplaintAction
{
    public function __construct(
        private GenerateTicketNumberAction $generateTicket,
        private StoreAttachmentsAction $storeAttachments,
        private SlaService $slaService,
        private AuditService $auditService,
    ) {}

    /**
     * Membuat pengaduan baru beserta lampiran, SLA, dan audit log.
     *
     * @param  array  $validated  Data form yang sudah divalidasi
     * @return Complaint
     */
    public function execute(array $validated): Complaint
    {
        return DB::transaction(function () use ($validated) {
            // Menghasilkan nomor tiket unik
            $ticketNo = $this->generateTicket->execute();

            // Menghitung tenggat SLA berdasarkan kategori
            $category = ComplaintCategory::findOrFail($validated['category_id']);
            $slaDeadline = $this->slaService->calculateDeadline(now(), $category->sla_days);

            // Membuat pengaduan
            $complaint = Complaint::create([
                'ticket_no' => $ticketNo,
                'user_id' => auth()->id(),
                'category_id' => $validated['category_id'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'reported_party' => $validated['reported_party'] ?? null,
                'incident_date' => $validated['incident_date'],
                'incident_location' => $validated['incident_location'] ?? null,
                'status' => ComplaintStatusEnum::SUBMITTED,
                'priority' => $validated['priority'] ?? 'normal',
                'sla_deadline' => $slaDeadline,
                'is_anonymous' => $validated['is_anonymous'] ?? false,
                'is_confidential' => $validated['is_confidential'] ?? false,
                'data_classification' => ($validated['is_confidential'] ?? false) ? 'confidential' : 'internal',
                'complainant_name' => $validated['complainant_name'],
                'complainant_nik' => $validated['complainant_nik'],
                'complainant_phone' => $validated['complainant_phone'],
                'complainant_email' => $validated['complainant_email'] ?? null,
                'complainant_address' => $validated['complainant_address'] ?? null,
            ]);

            // Membuat entri riwayat status awal
            $complaint->statusHistory()->create([
                'status' => ComplaintStatusEnum::SUBMITTED,
                'note' => 'Pengaduan baru dikirim oleh pelapor',
                'updated_by' => auth()->id() ?? 1,
            ]);

            // Menyimpan lampiran jika ada
            if (! empty($validated['attachments'])) {
                $this->storeAttachments->execute($complaint, $validated['attachments']);
            }

            // Mencatat ke audit log (SPBE)
            $this->auditService->log('create', $complaint, null, $complaint->toArray());

            // Mengirim notifikasi
            if ($complaint->complainant_email || $complaint->complainant_phone) {
                try {
                    $complaint->user
                        ? $complaint->user->notify(new ComplaintSubmittedNotification($complaint))
                        : null;
                } catch (\Exception) {
                    // Notifikasi gagal tidak boleh menggagalkan pembuatan pengaduan
                }
            }

            return $complaint;
        });
    }
}
