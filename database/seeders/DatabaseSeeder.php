<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Menjalankan semua seeder dalam urutan yang benar.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            ComplaintCategorySeeder::class,
            HolidaySeeder::class,
            SystemSettingsSeeder::class,
            ComplaintSeeder::class,
        ]);
    }
}
