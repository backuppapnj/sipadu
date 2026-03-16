<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\AuditService;
use Illuminate\Auth\Events\Failed;

/**
 * Listener: mencatat login gagal ke audit_logs.
 *
 * Menambah failed_login_count dan mengunci akun jika >= 5 kali gagal.
 * Sesuai persyaratan BSSN 4/2021 dan kebijakan lockout SPBE.
 */
class LogFailedLogin
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Handle event login gagal.
     */
    public function handle(Failed $event): void
    {
        $email = $event->credentials['email'] ?? 'unknown';

        // Catat ke audit_logs
        $this->auditService->logLoginAttempt(
            email: $email,
            success: false,
            ip: request()->ip(),
        );

        // Increment failed login count pada user
        $user = User::where('email', $email)->first();

        if ($user) {
            $user->incrementFailedLogin();
        }
    }
}
