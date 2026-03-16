<?php

namespace App\Listeners;

use App\Services\AuditService;
use Illuminate\Auth\Events\Logout;

/**
 * Listener: mencatat logout ke audit_logs.
 * Sesuai persyaratan BSSN 4/2021.
 */
class LogSuccessfulLogout
{
    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    /**
     * Handle event logout.
     */
    public function handle(Logout $event): void
    {
        if ($event->user) {
            $this->auditService->logLogout($event->user);
        }
    }
}
