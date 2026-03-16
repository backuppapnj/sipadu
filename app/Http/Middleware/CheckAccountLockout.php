<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware untuk memblokir login setelah 5 percobaan gagal (BSSN 4/2021).
 */
class CheckAccountLockout
{
    public function handle(Request $request, Closure $next): Response
    {
        // Hanya berlaku untuk request login
        if ($request->is('login') && $request->isMethod('POST')) {
            $email = $request->input('email');

            if ($email) {
                $user = User::where('email', $email)->first();

                if ($user && $user->isLocked()) {
                    $minutesLeft = max(1, (int) ceil(now()->diffInMinutes($user->locked_until, false)));

                    return back()
                        ->withInput($request->only('email'))
                        ->withErrors([
                            'email' => "Akun Anda terkunci karena terlalu banyak percobaan login gagal. Silakan coba lagi dalam {$minutesLeft} menit.",
                        ]);
                }

                // Reset kunci yang sudah expired
                if ($user && $user->locked_until !== null && $user->locked_until->isPast()) {
                    $user->update([
                        'locked_until' => null,
                        'failed_login_count' => 0,
                    ]);
                }
            }
        }

        return $next($request);
    }
}
