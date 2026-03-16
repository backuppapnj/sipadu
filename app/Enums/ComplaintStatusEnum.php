<?php

namespace App\Enums;

enum ComplaintStatusEnum: string
{
    case SUBMITTED = 'submitted';
    case VERIFIED = 'verified';
    case REJECTED = 'rejected';
    case ASSIGNED = 'assigned';
    case IN_PROGRESS = 'in_progress';
    case RESPONDED = 'responded';
    case RESOLVED = 'resolved';
    case REOPENED = 'reopened';

    /**
     * Mendapatkan label dalam Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::SUBMITTED => 'Dikirim',
            self::VERIFIED => 'Terverifikasi',
            self::REJECTED => 'Ditolak',
            self::ASSIGNED => 'Ditugaskan',
            self::IN_PROGRESS => 'Sedang Diproses',
            self::RESPONDED => 'Telah Dijawab',
            self::RESOLVED => 'Selesai',
            self::REOPENED => 'Dibuka Kembali',
        };
    }

    /**
     * Mendapatkan warna indikator untuk UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::SUBMITTED => 'gray',
            self::VERIFIED => 'blue',
            self::REJECTED => 'red',
            self::ASSIGNED => 'indigo',
            self::IN_PROGRESS => 'yellow',
            self::RESPONDED => 'purple',
            self::RESOLVED => 'green',
            self::REOPENED => 'orange',
        };
    }

    /**
     * Mendapatkan daftar status yang diperbolehkan untuk transisi dari status saat ini.
     *
     * @return array<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::SUBMITTED => [self::VERIFIED, self::REJECTED],
            self::VERIFIED => [self::ASSIGNED, self::REJECTED],
            self::REJECTED => [],
            self::ASSIGNED => [self::IN_PROGRESS],
            self::IN_PROGRESS => [self::RESPONDED],
            self::RESPONDED => [self::RESOLVED, self::REOPENED],
            self::RESOLVED => [self::REOPENED],
            self::REOPENED => [self::IN_PROGRESS],
        };
    }

    /**
     * Mengecek apakah transisi ke status target diperbolehkan.
     */
    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
