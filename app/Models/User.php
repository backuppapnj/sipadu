<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Crypt;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, LogsActivity, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'nik',
        'phone',
        'address',
        'role',
        'is_active',
        'last_login_at',
        'last_login_ip',
        'failed_login_count',
        'locked_until',
        'password_changed_at',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'nik',
    ];

    /**
     * Mendapatkan konfigurasi cast atribut.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'locked_until' => 'datetime',
            'password_changed_at' => 'datetime',
            'failed_login_count' => 'integer',
        ];
    }

    /**
     * Konfigurasi Spatie Activitylog.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'phone', 'role', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('user')
            ->setDescriptionForEvent(fn (string $eventName) => match ($eventName) {
                'created' => 'Pengguna baru dibuat',
                'updated' => 'Data pengguna diperbarui',
                'deleted' => 'Pengguna dihapus (soft delete)',
                default => "Pengguna {$eventName}",
            });
    }

    /**
     * Mengenkripsi NIK sebelum disimpan ke database.
     */
    public function setNikAttribute(?string $value): void
    {
        $this->attributes['nik'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Mendekripsi NIK saat diambil dari database.
     */
    public function getNikAttribute(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Exception) {
            return null;
        }
    }

    /**
     * Mengecek apakah akun sedang terkunci.
     */
    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    /**
     * Tambah jumlah percobaan login gagal.
     * Kunci akun jika sudah >= 5 kali gagal.
     */
    public function incrementFailedLogin(): void
    {
        $this->increment('failed_login_count');

        if ($this->failed_login_count >= 5) {
            $this->lockAccount();
        }
    }

    /**
     * Reset percobaan login gagal setelah login berhasil.
     */
    public function resetFailedLogin(): void
    {
        $this->update([
            'failed_login_count' => 0,
            'locked_until' => null,
        ]);
    }

    /**
     * Kunci akun selama 30 menit.
     */
    public function lockAccount(): void
    {
        $this->update([
            'locked_until' => now()->addMinutes(30),
        ]);
    }

    /**
     * Routing notifikasi WhatsApp via Fonnte.
     */
    public function routeNotificationForWhatsApp(): ?string
    {
        return $this->phone;
    }

    // === Relasi ===

    /**
     * Pengaduan yang dibuat oleh pengguna.
     */
    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'user_id');
    }

    /**
     * Pengaduan yang ditugaskan ke pengguna (petugas).
     */
    public function assignedComplaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'assigned_to');
    }

    /**
     * Audit log yang terkait pengguna.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }
}
