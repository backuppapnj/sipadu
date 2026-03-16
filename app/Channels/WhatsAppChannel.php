<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Channel notifikasi WhatsApp menggunakan Fonnte API.
 */
class WhatsAppChannel
{
    /**
     * Mengirim notifikasi via WhatsApp (Fonnte).
     */
    public function send(object $notifiable, Notification $notification): void
    {
        $message = $notification->toWhatsApp($notifiable);
        $phone = $notifiable->routeNotificationForWhatsApp();

        if (! $phone || ! $message) {
            return;
        }

        $token = config('services.fonnte.token');

        if (! $token) {
            Log::warning('Fonnte token belum dikonfigurasi. Notifikasi WhatsApp tidak terkirim.');

            return;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $phone,
                'message' => $message,
                'countryCode' => '62',
            ]);

            if (! $response->successful()) {
                Log::error('Gagal mengirim notifikasi WhatsApp via Fonnte', [
                    'phone' => $phone,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Exception saat mengirim WhatsApp via Fonnte: ' . $e->getMessage());
        }
    }
}
