<?php

namespace App\Enums;

enum PriorityEnum: string
{
    case LOW = 'low';
    case NORMAL = 'normal';
    case HIGH = 'high';
    case URGENT = 'urgent';

    /**
     * Mendapatkan label dalam Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::LOW => 'Rendah',
            self::NORMAL => 'Normal',
            self::HIGH => 'Tinggi',
            self::URGENT => 'Mendesak',
        };
    }

    /**
     * Mendapatkan warna indikator untuk UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::LOW => 'gray',
            self::NORMAL => 'blue',
            self::HIGH => 'orange',
            self::URGENT => 'red',
        };
    }
}
