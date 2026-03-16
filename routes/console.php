<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwal pengecekan SLA harian — wajib SPBE untuk monitoring layanan
Schedule::command('sipadu:check-sla')->dailyAt('08:00')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping()
    ->onOneServer();

// Pembersihan activity log Spatie (opsional, retensi 1 tahun)
Schedule::command('activitylog:clean')->daily();
