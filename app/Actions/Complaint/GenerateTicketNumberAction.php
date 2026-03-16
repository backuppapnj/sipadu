<?php

namespace App\Actions\Complaint;

use App\Models\Complaint;
use Illuminate\Support\Facades\DB;

class GenerateTicketNumberAction
{
    /**
     * Membuat nomor tiket unik dengan format PA-PNJ-{YYYY}-{5-digit-seq}.
     * Menggunakan lockForUpdate() untuk mencegah race condition.
     */
    public function execute(): string
    {
        $year = now()->year;
        $prefix = "PA-PNJ-{$year}-";

        return DB::transaction(function () use ($prefix) {
            $lastComplaint = Complaint::withTrashed()
                ->where('ticket_no', 'like', $prefix . '%')
                ->lockForUpdate()
                ->orderByDesc('ticket_no')
                ->first();

            if ($lastComplaint) {
                $lastSequence = (int) substr($lastComplaint->ticket_no, -5);
                $newSequence = $lastSequence + 1;
            } else {
                $newSequence = 1;
            }

            return $prefix . str_pad($newSequence, 5, '0', STR_PAD_LEFT);
        });
    }
}
