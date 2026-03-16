<?php

namespace App\Notifications;

use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComplaintAssignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Complaint $complaint,
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
        return (new MailMessage)
            ->subject("Pengaduan #{$this->complaint->ticket_no} Ditugaskan kepada Anda — SIPADU")
            ->greeting("Yth. {$notifiable->name}")
            ->line("Anda telah ditugaskan untuk menangani pengaduan berikut:")
            ->line("**No. Tiket:** {$this->complaint->ticket_no}")
            ->line("**Judul:** {$this->complaint->title}")
            ->line("**Kategori:** {$this->complaint->category->name}")
            ->line("**Tenggat SLA:** {$this->complaint->sla_deadline->format('d M Y')}")
            ->action('Lihat Pengaduan', url("/petugas/dashboard"))
            ->line('Mohon segera ditindaklanjuti sesuai tenggat waktu SLA.')
            ->salutation('Salam, Sistem SIPADU PA Penajam');
    }
}
