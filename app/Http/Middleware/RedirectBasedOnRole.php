<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware untuk mengarahkan pengguna ke dashboard sesuai role-nya
 * setelah login berhasil.
 */
class RedirectBasedOnRole
{
    /**
     * Handle request — redirect ke dashboard sesuai role.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Hanya redirect jika mengakses halaman generik /dashboard
        // dan user memiliki role yang spesifik
        if ($request->routeIs('dashboard')) {
            if ($user->hasRole('admin')) {
                return redirect('/admin/dashboard');
            }

            if ($user->hasRole('panitera')) {
                return redirect('/panitera/dashboard');
            }

            if ($user->hasRole('petugas_layanan')) {
                return redirect('/petugas/dashboard');
            }
        }

        return $next($request);
    }
}
