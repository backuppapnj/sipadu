<?php

namespace App\Listeners;

use App\Services\AuditService;
use Illuminate\Auth\Events\Login;

/**
 * Listener: mencatat login berhasil ke audit_logs.
 *
 * Memperbarui: last_login_at, last_login_ip, reset failed_login_count.
 * Sesuai persyaratan BSSN 4/2021 dan Perpres 95/2018.
 */
class LogSuccessfulLogin
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Handle event login berhasil.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        // Update metadata login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
            'failed_login_count' => 0,
            'locked_until' => null,
        ]);

        // Catat ke audit_logs
        $this->auditService->logLoginAttempt(
            email: $user->email,
            success: true,
            ip: request()->ip(),
        );
    }
}
