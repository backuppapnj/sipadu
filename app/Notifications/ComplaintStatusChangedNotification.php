<?php

namespace App\Notifications;

use App\Channels\WhatsAppChannel;
use App\Enums\ComplaintStatusEnum;
use App\Models\Complaint;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComplaintStatusChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Complaint $complaint,
        private ComplaintStatusEnum $oldStatus,
        private ComplaintStatusEnum $newStatus,
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
            ->subject("Status Pengaduan #{$this->complaint->ticket_no} Diperbarui — SIPADU PA Penajam")
            ->greeting("Yth. {$notifiable->name}")
            ->line("Status pengaduan Anda dengan nomor tiket **{$this->complaint->ticket_no}** telah diperbarui.")
            ->line("**Status sebelumnya:** {$this->oldStatus->label()}")
            ->line("**Status baru:** {$this->newStatus->label()}")
            ->action('Lihat Detail Pengaduan', url("/pengaduan/cek?ticket={$this->complaint->ticket_no}"))
            ->salutation('Salam, Tim SIPADU Pengadilan Agama Penajam');
    }

    public function toWhatsApp(object $notifiable): string
    {
        return "📋 *SIPADU PA Penajam*\n\n"
            . "Status pengaduan Anda telah diperbarui.\n\n"
            . "📌 No. Tiket: *{$this->complaint->ticket_no}*\n"
            . "🔄 Status: {$this->oldStatus->label()} → *{$this->newStatus->label()}*\n\n"
            . "Cek detail di: " . url("/pengaduan/cek?ticket={$this->complaint->ticket_no}");
    }
}
