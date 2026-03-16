<?php

namespace Database\Seeders;

use App\Models\Holiday;
use Illuminate\Database\Seeder;

class HolidaySeeder extends Seeder
{
    /**
     * Membuat hari libur nasional Indonesia tahun 2026.
     */
    public function run(): void
    {
        $holidays = [
            ['date' => '2026-01-01', 'name' => 'Tahun Baru 2026 Masehi'],
            ['date' => '2026-01-27', 'name' => 'Isra Mi\'raj Nabi Muhammad SAW'],
            ['date' => '2026-03-19', 'name' => 'Hari Raya Nyepi Tahun Baru Saka'],
            ['date' => '2026-03-20', 'name' => 'Idul Fitri 1447 Hijriah (Hari 1)'],
            ['date' => '2026-03-21', 'name' => 'Idul Fitri 1447 Hijriah (Hari 2)'],
            ['date' => '2026-03-22', 'name' => 'Cuti Bersama Idul Fitri'],
            ['date' => '2026-03-23', 'name' => 'Cuti Bersama Idul Fitri'],
            ['date' => '2026-04-03', 'name' => 'Wafat Isa Almasih'],
            ['date' => '2026-05-01', 'name' => 'Hari Buruh Internasional'],
            ['date' => '2026-05-14', 'name' => 'Kenaikan Isa Almasih'],
            ['date' => '2026-05-16', 'name' => 'Hari Raya Waisak 2570 BE'],
            ['date' => '2026-05-27', 'name' => 'Idul Adha 1447 Hijriah'],
            ['date' => '2026-06-01', 'name' => 'Hari Lahir Pancasila'],
            ['date' => '2026-06-17', 'name' => 'Tahun Baru Islam 1448 Hijriah'],
            ['date' => '2026-08-17', 'name' => 'Hari Kemerdekaan Republik Indonesia'],
            ['date' => '2026-08-26', 'name' => 'Maulid Nabi Muhammad SAW'],
            ['date' => '2026-12-25', 'name' => 'Hari Natal'],
        ];

        foreach ($holidays as $holiday) {
            Holiday::updateOrCreate(
                ['date' => $holiday['date']],
                $holiday
            );
        }
    }
}
