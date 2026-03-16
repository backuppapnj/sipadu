<?php

namespace App\Models;

use App\Enums\ComplaintStatusEnum;
use App\Enums\DataClassificationEnum;
use App\Enums\PriorityEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Complaint extends Model
{
    use LogsActivity, SoftDeletes;

    protected $fillable = [
        'ticket_no',
        'user_id',
        'category_id',
        'title',
        'description',
        'reported_party',
        'incident_date',
        'incident_location',
        'status',
        'priority',
        'assigned_to',
        'sla_deadline',
        'resolved_at',
        'is_anonymous',
        'is_confidential',
        'data_classification',
        'complainant_name',
        'complainant_nik',
        'complainant_phone',
        'complainant_email',
        'complainant_address',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ComplaintStatusEnum::class,
            'priority' => PriorityEnum::class,
            'data_classification' => DataClassificationEnum::class,
            'incident_date' => 'date',
            'sla_deadline' => 'date',
            'resolved_at' => 'datetime',
            'is_anonymous' => 'boolean',
            'is_confidential' => 'boolean',
        ];
    }

    /**
     * Konfigurasi Spatie Activitylog.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'status', 'priority', 'assigned_to', 'data_classification'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('complaint')
            ->setDescriptionForEvent(fn (string $eventName) => match ($eventName) {
                'created' => 'Pengaduan baru dibuat',
                'updated' => 'Pengaduan diperbarui',
                'deleted' => 'Pengaduan dihapus (soft delete)',
                default => "Pengaduan {$eventName}",
            });
    }

    /**
     * Mengenkripsi complainant_nik sebelum disimpan.
     */
    public function setComplainantNikAttribute(?string $value): void
    {
        $this->attributes['complainant_nik'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Mendekripsi complainant_nik saat diambil.
     */
    public function getComplainantNikAttribute(?string $value): ?string
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

    // === Relasi ===

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ComplaintCategory::class, 'category_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ComplaintStatus::class)->orderBy('created_at', 'desc');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ComplaintAttachment::class);
    }

    public function dispositions(): HasMany
    {
        return $this->hasMany(ComplaintDisposition::class);
    }

    // === Scopes ===

    public function scopeOverdue($query)
    {
        return $query->where('sla_deadline', '<', now()->toDateString())
            ->whereNotIn('status', [
                ComplaintStatusEnum::RESOLVED->value,
                ComplaintStatusEnum::REJECTED->value,
            ]);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [
            ComplaintStatusEnum::RESOLVED->value,
            ComplaintStatusEnum::REJECTED->value,
        ]);
    }

    /**
     * Mengecek apakah pengaduan sudah melewati SLA.
     */
    public function isOverdue(): bool
    {
        if (in_array($this->status, [ComplaintStatusEnum::RESOLVED, ComplaintStatusEnum::REJECTED])) {
            return false;
        }

        return $this->sla_deadline && $this->sla_deadline->isPast();
    }
}
