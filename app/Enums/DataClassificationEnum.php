<?php

namespace App\Enums;

enum DataClassificationEnum: string
{
    case PUBLIC = 'public';
    case INTERNAL = 'internal';
    case CONFIDENTIAL = 'confidential';

    /**
     * Mendapatkan label dalam Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::PUBLIC => 'Publik',
            self::INTERNAL => 'Internal',
            self::CONFIDENTIAL => 'Rahasia',
        };
    }

    /**
     * Mendapatkan warna badge untuk UI.
     */
    public function color(): string
    {
        return match ($this) {
            self::PUBLIC => 'green',
            self::INTERNAL => 'yellow',
            self::CONFIDENTIAL => 'red',
        };
    }
}
