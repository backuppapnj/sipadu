<?php

namespace App\Notifications;

use App\Channels\WhatsAppChannel;
use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComplaintSubmittedNotification extends Notification implements ShouldQueue
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
        $channels = ['mail'];

        if ($notifiable->routeNotificationForWhatsApp()) {
            $channels[] = WhatsAppChannel::class;
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Pengaduan #{$this->complaint->ticket_no} Diterima — SIPADU PA Penajam")
            ->greeting("Yth. {$notifiable->name}")
            ->line("Pengaduan Anda dengan nomor tiket **{$this->complaint->ticket_no}** telah diterima.")
            ->line("**Judul:** {$this->complaint->title}")
            ->line("**Kategori:** {$this->complaint->category->name}")
            ->line("**Tenggat SLA:** {$this->complaint->sla_deadline->format('d M Y')}")
            ->action('Cek Status Pengaduan', url("/pengaduan/cek?ticket={$this->complaint->ticket_no}"))
            ->line('Kami akan memproses pengaduan Anda sesuai tenggat waktu yang ditentukan.')
            ->salutation('Salam, Tim SIPADU Pengadilan Agama Penajam');
    }

    public function toWhatsApp(object $notifiable): string
    {
        return "📋 *SIPADU PA Penajam*\n\n"
            . "Pengaduan Anda telah diterima.\n\n"
            . "📌 No. Tiket: *{$this->complaint->ticket_no}*\n"
            . "📝 Judul: {$this->complaint->title}\n"
            . "📁 Kategori: {$this->complaint->category->name}\n"
            . "⏰ Tenggat SLA: {$this->complaint->sla_deadline->format('d M Y')}\n\n"
            . "Cek status di: " . url("/pengaduan/cek?ticket={$this->complaint->ticket_no}");
    }
}
