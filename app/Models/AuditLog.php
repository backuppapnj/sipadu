<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model AuditLog — IMMUTABLE (SPBE).
 *
 * Tabel ini bersifat immutable sesuai persyaratan SPBE (Perpres 95/2018).
 * Tidak ada operasi update atau delete yang diperbolehkan.
 * Tidak menggunakan SoftDeletes.
 */
class AuditLog extends Model
{
    // Tidak ada updated_at — log bersifat immutable
    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'user_ip',
        'user_agent',
        'action',
        'subject_type',
        'subject_id',
        'old_values',
        'new_values',
        'session_id',
        'request_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'subject_id' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Mencegah update pada model ini (immutable).
     */
    public static function boot(): void
    {
        parent::boot();

        // Mencegah update — audit log bersifat immutable (SPBE)
        static::updating(function () {
            throw new \RuntimeException('Audit log bersifat immutable dan tidak boleh diubah (SPBE).');
        });

        // Mencegah delete — audit log tidak boleh dihapus (SPBE)
        static::deleting(function () {
            throw new \RuntimeException('Audit log tidak boleh dihapus (SPBE).');
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mendapatkan model subject secara polimorfik.
     */
    public function subject(): ?\Illuminate\Database\Eloquent\Relations\MorphTo
    {
        if ($this->subject_type && $this->subject_id) {
            $class = $this->subject_type;
            if (class_exists($class)) {
                return $this->morphTo('subject', 'subject_type', 'subject_id');
            }
        }

        return null;
    }

    /**
     * Scope: filter berdasarkan aksi.
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: filter berdasarkan rentang tanggal.
     */
    public function scopeBetweenDates($query, $from, $to)
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }
}
