<?php

namespace App\Notifications;

use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SlaWarningNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Complaint $complaint,
        private string $level, // 'warning_75', 'warning_90', 'overdue'
    ) {}

    /**
     * @return array<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = match ($this->level) {
            'warning_75' => "⚠️ Peringatan SLA 75% — Pengaduan #{$this->complaint->ticket_no}",
            'warning_90' => "🔴 Peringatan SLA 90% — Pengaduan #{$this->complaint->ticket_no}",
            'overdue' => "🚨 SLA TERLEWAT — Pengaduan #{$this->complaint->ticket_no}",
            default => "Peringatan SLA — Pengaduan #{$this->complaint->ticket_no}",
        };

        $message = match ($this->level) {
            'warning_75' => 'Pengaduan ini telah menggunakan 75% dari waktu SLA yang ditentukan.',
            'warning_90' => 'Pengaduan ini telah menggunakan 90% dari waktu SLA. Segera selesaikan!',
            'overdue' => 'Pengaduan ini telah MELEWATI tenggat SLA. Diperlukan tindakan segera.',
            default => 'Pengaduan memerlukan perhatian terkait SLA.',
        };

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Yth. {$notifiable->name}")
            ->line($message)
            ->line("**No. Tiket:** {$this->complaint->ticket_no}")
            ->line("**Judul:** {$this->complaint->title}")
            ->line("**Tenggat SLA:** {$this->complaint->sla_deadline->format('d M Y')}")
            ->line("**Ditugaskan ke:** " . ($this->complaint->assignee?->name ?? 'Belum ditugaskan'))
            ->action('Lihat Pengaduan', url("/admin/dashboard"))
            ->salutation('Sistem SIPADU PA Penajam');
    }
}
