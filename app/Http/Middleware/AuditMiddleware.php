<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware untuk mencatat setiap request ke audit_logs (SPBE wajib).
 */
class AuditMiddleware
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Membuat request_id unik untuk traceability
        $requestId = $request->header('X-Request-ID', Str::uuid()->toString());
        $request->headers->set('X-Request-ID', $requestId);

        $response = $next($request);

        // Menambahkan request_id ke response header
        $response->headers->set('X-Request-ID', $requestId);

        // Mencatat request ke audit log (hanya untuk request yang mengubah data)
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            try {
                $this->auditService->log(
                    action: strtolower($request->method()) . ':' . $request->path(),
                );
            } catch (\Exception) {
                // Kegagalan audit log tidak boleh menggagalkan request
            }
        }

        return $response;
    }
}
