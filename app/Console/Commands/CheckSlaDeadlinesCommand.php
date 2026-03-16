<?php

namespace App\Console\Commands;

use App\Actions\Complaint\EscalateComplaintAction;
use App\Enums\ComplaintStatusEnum;
use App\Models\Complaint;
use App\Services\SlaService;
use Illuminate\Console\Command;

class CheckSlaDeadlinesCommand extends Command
{
    protected $signature = 'sipadu:check-sla';

    protected $description = 'Memeriksa tenggat SLA semua pengaduan aktif dan mengirim notifikasi peringatan';

    public function __construct(
        private SlaService $slaService,
        private EscalateComplaintAction $escalateAction,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Memeriksa tenggat SLA pengaduan aktif...');

        $activeComplaints = Complaint::active()
            ->with(['category', 'assignee'])
            ->get();

        $warnings = 0;

        foreach ($activeComplaints as $complaint) {
            $percentage = $this->slaService->getPercentageUsed($complaint);

            if ($percentage >= 100) {
                // Sudah melewati SLA — eskalasi
                $this->escalateAction->execute($complaint, 'overdue');
                $this->warn("OVERDUE: {$complaint->ticket_no} ({$percentage}%)");
                $warnings++;
            } elseif ($percentage >= 90) {
                // 90% SLA — peringatan keras
                $this->escalateAction->execute($complaint, 'warning_90');
                $this->warn("WARNING 90%: {$complaint->ticket_no} ({$percentage}%)");
                $warnings++;
            } elseif ($percentage >= 75) {
                // 75% SLA — peringatan awal
                $this->escalateAction->execute($complaint, 'warning_75');
                $this->info("WARNING 75%: {$complaint->ticket_no} ({$percentage}%)");
                $warnings++;
            }
        }

        $this->info("Selesai. {$activeComplaints->count()} pengaduan diperiksa, {$warnings} peringatan dikirim.");

        return self::SUCCESS;
    }
}
