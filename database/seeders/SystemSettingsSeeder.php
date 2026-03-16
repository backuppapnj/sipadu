<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Membuat pengaturan sistem default SIPADU.
     */
    public function run(): void
    {
        $settings = [
            // Pengaturan SLA
            ['key' => 'sla_default_days', 'value' => '14', 'group' => 'sla'],

            // Pengaturan keamanan
            ['key' => 'lockout_duration_minutes', 'value' => '30', 'group' => 'security'],
            ['key' => 'max_login_attempts', 'value' => '5', 'group' => 'security'],
            ['key' => 'password_expiry_days', 'value' => '90', 'group' => 'security'],

            // Pengaturan notifikasi
            ['key' => 'notification_email_enabled', 'value' => 'true', 'group' => 'notification'],
            ['key' => 'notification_whatsapp_enabled', 'value' => 'false', 'group' => 'notification'],
            ['key' => 'fonnte_token', 'value' => '', 'group' => 'notification'],

            // Pengaturan aplikasi
            ['key' => 'app_name', 'value' => 'SIPADU - PA Penajam', 'group' => 'general'],
            ['key' => 'app_description', 'value' => 'Sistem Informasi Pengaduan Layanan Pengadilan Agama Penajam', 'group' => 'general'],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
