<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    protected $fillable = [
        'notifiable_type',
        'notifiable_id',
        'channel',
        'subject',
        'message',
        'sent_at',
        'read_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'read_at' => 'datetime',
        ];
    }

    /**
     * Relasi polimorfik ke penerima notifikasi.
     */
    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Menandai notifikasi sebagai sudah dibaca.
     */
    public function markAsRead(): void
    {
        $this->update(['read_at' => now()]);
    }

    /**
     * Scope: notifikasi yang belum dibaca.
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
