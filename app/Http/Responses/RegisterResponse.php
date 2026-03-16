<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

/**
 * Response kustom setelah registrasi berhasil.
 * Masyarakat diarahkan ke dashboard.
 */
class RegisterResponse implements RegisterResponseContract
{
    /**
     * Buat response untuk request registrasi berhasil.
     */
    public function toResponse($request): JsonResponse|\Symfony\Component\HttpFoundation\Response
    {
        return $request->wantsJson()
            ? new JsonResponse([], 201)
            : redirect('/dashboard');
    }
}
