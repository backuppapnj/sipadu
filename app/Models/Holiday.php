<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'date',
        'name',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    /**
     * Mengecek apakah tanggal tertentu adalah hari libur.
     */
    public static function isHoliday(CarbonInterface $date): bool
    {
        return static::where('date', $date->toDateString())->exists();
    }
}
