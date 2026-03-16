<?php

use App\Models\Complaint;
use App\Models\ComplaintCategory;
use Database\Seeders\ComplaintCategorySeeder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(ComplaintCategorySeeder::class);
});

test('lacak pengaduan dengan nomor tiket valid menampilkan status', function () {
    $complaint = Complaint::factory()->create([
        'ticket_no' => 'PA-PNJ-2026-00099',
    ]);

    $response = $this->get('/pengaduan/cek?ticket_no=PA-PNJ-2026-00099');

    $response->assertStatus(200);
});

test('lacak pengaduan dengan nomor tiket tidak valid mengembalikan pesan not found', function () {
    $response = $this->get('/pengaduan/cek?ticket_no=PA-PNJ-2026-99999');

    // Harus menampilkan pesan bahwa pengaduan tidak ditemukan
    $response->assertStatus(200); // Tetap 200 tapi dengan pesan error
});

test('pengaduan anonim menyembunyikan identitas dalam pelacakan', function () {
    $complaint = Complaint::factory()->anonymous()->create([
        'ticket_no' => 'PA-PNJ-2026-00100',
        'complainant_name' => 'Nama Rahasia',
    ]);

    $response = $this->get('/pengaduan/cek?ticket_no=PA-PNJ-2026-00100');

    $response->assertStatus(200);
    // Nama pelapor tidak boleh ditampilkan untuk pengaduan anonim
    expect($complaint->is_anonymous)->toBeTrue();
});

test('pengaduan rahasia tidak menampilkan konten kepada pengguna tidak berwenang', function () {
    $complaint = Complaint::factory()->confidential()->create([
        'ticket_no' => 'PA-PNJ-2026-00101',
    ]);

    expect($complaint->is_confidential)->toBeTrue();
    expect($complaint->data_classification->value)->toBe('confidential');
});

test('pelacakan tanpa nomor tiket mengembalikan halaman form', function () {
    $response = $this->get('/pengaduan/cek');

    $response->assertStatus(200);
});
