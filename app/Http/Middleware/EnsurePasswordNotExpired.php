<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware untuk memeriksa apakah password sudah lebih dari 90 hari.
 * Jika ya, tampilkan peringatan (tidak memblokir akses).
 *
 * Durasi konfigurasi via system_settings (key: password_expiry_days).
 */
class EnsurePasswordNotExpired
{
    /**
     * Handle request — periksa umur password.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $expiryDays = $this->getExpiryDays();
            $passwordChangedAt = $user->password_changed_at ?? $user->created_at;

            if ($passwordChangedAt && $passwordChangedAt->diffInDays(now()) >= $expiryDays) {
                session()->flash(
                    'warning',
                    "Password Anda sudah lebih dari {$expiryDays} hari tidak diubah. Demi keamanan akun, silakan ubah password Anda."
                );
            }
        }

        return $next($request);
    }

    /**
     * Ambil jumlah hari expiry dari system_settings, default 90 hari.
     */
    private function getExpiryDays(): int
    {
        try {
            $setting = \App\Models\SystemSetting::where('key', 'password_expiry_days')->first();

            return $setting ? (int) $setting->value : 90;
        } catch (\Exception) {
            return 90;
        }
    }
}
