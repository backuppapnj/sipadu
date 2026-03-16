<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AuditService
{
    /**
     * Mencatat aktivitas ke tabel audit_logs (immutable — SPBE).
     */
    public function log(
        string $action,
        ?Model $subject = null,
        ?array $oldValues = null,
        ?array $newValues = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => auth()->id(),
            'user_ip' => request()->ip() ?? '0.0.0.0',
            'user_agent' => Str::limit(request()->userAgent() ?? 'unknown', 500),
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'session_id' => session()->getId(),
            'request_id' => request()->header('X-Request-ID', Str::uuid()->toString()),
        ]);
    }

    /**
     * Mencatat percobaan login (berhasil/gagal) — BSSN 4/2021.
     */
    public function logLoginAttempt(string $email, bool $success, ?string $ip = null): AuditLog
    {
        $user = User::where('email', $email)->first();

        return AuditLog::create([
            'user_id' => $user?->id,
            'user_ip' => $ip ?? request()->ip() ?? '0.0.0.0',
            'user_agent' => Str::limit(request()->userAgent() ?? 'unknown', 500),
            'action' => $success ? 'login_success' : 'login_failed',
            'subject_type' => User::class,
            'subject_id' => $user?->id,
            'old_values' => null,
            'new_values' => ['email' => $email, 'success' => $success],
            'session_id' => session()->getId(),
            'request_id' => request()->header('X-Request-ID', Str::uuid()->toString()),
        ]);
    }

    /**
     * Mencatat logout pengguna — BSSN 4/2021.
     */
    public function logLogout(User $user): AuditLog
    {
        return AuditLog::create([
            'user_id' => $user->id,
            'user_ip' => request()->ip() ?? '0.0.0.0',
            'user_agent' => Str::limit(request()->userAgent() ?? 'unknown', 500),
            'action' => 'logout',
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'old_values' => null,
            'new_values' => null,
            'session_id' => session()->getId(),
            'request_id' => request()->header('X-Request-ID', Str::uuid()->toString()),
        ]);
    }
}
