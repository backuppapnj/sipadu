<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

/**
 * Response kustom setelah login berhasil.
 * Mengarahkan pengguna ke dashboard sesuai role.
 */
class LoginResponse implements LoginResponseContract
{
    /**
     * Buat response untuk request login berhasil.
     */
    public function toResponse($request): JsonResponse|\Symfony\Component\HttpFoundation\Response
    {
        $user = $request->user();
        $redirectTo = $this->getRedirectUrl($user);

        return $request->wantsJson()
            ? new JsonResponse(['two_factor' => false], 200)
            : redirect()->intended($redirectTo);
    }

    /**
     * Tentukan URL redirect berdasarkan role pengguna.
     */
    private function getRedirectUrl($user): string
    {
        if ($user->hasRole('admin')) {
            return '/admin/dashboard';
        }

        if ($user->hasRole('panitera')) {
            return '/panitera/dashboard';
        }

        if ($user->hasRole('petugas_layanan')) {
            return '/petugas/dashboard';
        }

        return '/dashboard';
    }
}
