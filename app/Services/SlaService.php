<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\Holiday;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class SlaService
{
    /**
     * Menghitung tenggat SLA dari tanggal mulai, melewati akhir pekan dan hari libur.
     */
    public function calculateDeadline(CarbonInterface $startDate, int $slaDays): Carbon
    {
        $deadline = Carbon::parse($startDate);
        $addedDays = 0;

        while ($addedDays < $slaDays) {
            $deadline->addDay();

            // Lewati akhir pekan (Sabtu dan Minggu)
            if ($deadline->isWeekend()) {
                continue;
            }

            // Lewati hari libur nasional
            if (Holiday::isHoliday($deadline)) {
                continue;
            }

            $addedDays++;
        }

        return $deadline;
    }

    /**
     * Mengecek apakah pengaduan sudah melewati tenggat SLA.
     */
    public function isOverdue(Complaint $complaint): bool
    {
        return $complaint->isOverdue();
    }

    /**
     * Menghitung sisa hari kerja sebelum tenggat SLA.
     */
    public function getRemainingDays(Complaint $complaint): int
    {
        if (! $complaint->sla_deadline) {
            return 0;
        }

        $today = now()->startOfDay();
        $deadline = $complaint->sla_deadline->copy()->startOfDay();

        if ($today->greaterThan($deadline)) {
            return -$this->countWorkingDays($deadline, $today);
        }

        return $this->countWorkingDays($today, $deadline);
    }

    /**
     * Menghitung persentase SLA yang sudah terpakai.
     */
    public function getPercentageUsed(Complaint $complaint): float
    {
        if (! $complaint->sla_deadline || ! $complaint->category) {
            return 0.0;
        }

        $totalDays = $complaint->category->sla_days;
        $remaining = $this->getRemainingDays($complaint);
        $used = $totalDays - $remaining;

        if ($totalDays <= 0) {
            return 100.0;
        }

        return min(100.0, max(0.0, round(($used / $totalDays) * 100, 1)));
    }

    /**
     * Menghitung jumlah hari kerja antara dua tanggal.
     */
    private function countWorkingDays(CarbonInterface $from, CarbonInterface $to): int
    {
        $count = 0;
        $current = Carbon::parse($from);

        while ($current->lessThan($to)) {
            $current->addDay();

            if ($current->isWeekend()) {
                continue;
            }

            if (Holiday::isHoliday($current)) {
                continue;
            }

            $count++;
        }

        return $count;
    }
}
