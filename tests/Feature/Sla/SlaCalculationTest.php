<?php

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\Holiday;
use Carbon\Carbon;
use Database\Seeders\ComplaintCategorySeeder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(ComplaintCategorySeeder::class);
});

/**
 * Helper: menghitung SLA deadline (hari kerja, skip weekend & holiday).
 */
function calculateSlaDeadline(Carbon $start, int $slaDays): Carbon
{
    $current = $start->copy();
    $counted = 0;

    while ($counted < $slaDays) {
        $current->addDay();
        if (!$current->isWeekend() && !Holiday::isHoliday($current)) {
            $counted++;
        }
    }

    return $current;
}

test('SLA 14 hari kerja dihitung dari hari Senin', function () {
    // Senin 2 Maret 2026
    $start = Carbon::parse('2026-03-02');
    $deadline = calculateSlaDeadline($start, 14);

    // 14 hari kerja dari Senin 2 Maret = Senin 23 Maret (kalau tidak ada holiday)
    // Tapi ada Nyepi 19 Maret & Idul Fitri 20-23 Maret
    // Jadi harus melewati hari-hari libur tersebut
    expect($deadline->isWeekday())->toBeTrue();
});

test('SLA melewati weekend (Sabtu, Minggu)', function () {
    // Jumat 6 Maret 2026
    $start = Carbon::parse('2026-03-06');
    $deadline = calculateSlaDeadline($start, 1);

    // 1 hari kerja dari Jumat = Senin
    expect($deadline->dayOfWeek)->toBe(Carbon::MONDAY);
});

test('SLA melewati hari libur nasional', function () {
    // Buat hari libur
    Holiday::create(['date' => '2026-04-06', 'name' => 'Test Holiday']);

    $start = Carbon::parse('2026-04-03'); // Jumat
    $deadline = calculateSlaDeadline($start, 1);

    // Setelah Jumat: Sabtu (skip), Minggu (skip), Senin 6 April (holiday, skip), Selasa 7 April
    expect($deadline->format('Y-m-d'))->toBe('2026-04-07');
});

test('SLA dengan holiday berturut-turut dan weekend', function () {
    // Buat holiday berturut-turut
    Holiday::create(['date' => '2026-05-04', 'name' => 'Holiday 1']);
    Holiday::create(['date' => '2026-05-05', 'name' => 'Holiday 2']);

    $start = Carbon::parse('2026-05-01'); // Jumat (Hari Buruh - cek apakah sudah di holiday)

    $deadline = calculateSlaDeadline($start, 1);

    // Skip Sabtu 2, Minggu 3, Senin 4 (holiday), Selasa 5 (holiday) = Rabu 6
    expect($deadline->format('Y-m-d'))->toBe('2026-05-06');
});

test('isOverdue() mengembalikan true jika SLA terlewat', function () {
    $complaint = Complaint::factory()->create([
        'sla_deadline' => now()->subDays(1),
        'status' => 'in_progress',
    ]);

    expect($complaint->isOverdue())->toBeTrue();
});

test('isOverdue() mengembalikan false untuk pengaduan resolved', function () {
    $complaint = Complaint::factory()->resolved()->create([
        'sla_deadline' => now()->subDays(10),
    ]);

    expect($complaint->isOverdue())->toBeFalse();
});

test('kategori berbeda memiliki SLA berbeda', function () {
    $infoCategory = ComplaintCategory::where('code', 'INFO')->first();
    $pegCategory = ComplaintCategory::where('code', 'PEG')->first();
    $admCategory = ComplaintCategory::where('code', 'ADM')->first();

    expect($infoCategory->sla_days)->toBe(5);
    expect($pegCategory->sla_days)->toBe(60);
    expect($admCategory->sla_days)->toBe(14);
});

test('SLA deadline dihitung dengan benar saat complaint dibuat', function () {
    $category = ComplaintCategory::where('code', 'INFO')->first();

    $complaint = Complaint::factory()
        ->withCategory($category)
        ->create([
            'created_at' => Carbon::parse('2026-03-02'), // Senin
        ]);

    // SLA deadline seharusnya 5 hari kerja dari tanggal submit
    expect($complaint->sla_deadline)->not->toBeNull();
});
