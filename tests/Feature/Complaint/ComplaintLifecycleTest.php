<?php

use App\Enums\ComplaintStatusEnum;
use App\Models\AuditLog;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\ComplaintStatus;
use App\Models\User;
use Database\Seeders\ComplaintCategorySeeder;
use Database\Seeders\RolePermissionSeeder;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(ComplaintCategorySeeder::class);

    $this->admin = User::factory()->admin()->create();
    $this->admin->assignRole('admin');

    $this->panitera = User::factory()->panitera()->create();
    $this->panitera->assignRole('panitera');

    $this->petugas = User::factory()->petugas()->create();
    $this->petugas->assignRole('petugas_layanan');

    $this->masyarakat = User::factory()->masyarakat()->create();
    $this->masyarakat->assignRole('masyarakat');

    $this->category = ComplaintCategory::where('code', 'ADM')->first();
});

test('siklus lengkap pengaduan dari submit hingga resolved', function () {
    // 1. Submit pengaduan (publik, tanpa auth)
    $complaintData = [
        'nik' => '6405012345678901',
        'name' => 'Test Pelapor',
        'address' => 'Jl. Test No. 1, Penajam',
        'phone' => '081234567890',
        'email' => 'pelapor@test.com',
        'category_id' => $this->category->id,
        'title' => 'Pengaduan Test Lifecycle',
        'incident_date' => now()->subDays(3)->format('Y-m-d'),
        'incident_location' => 'Kantor PA Penajam',
        'description' => str_repeat('Deskripsi pengaduan test yang cukup panjang untuk memenuhi validasi minimum. ', 3),
    ];

    $response = $this->post('/pengaduan/buat', $complaintData);

    // Verifikasi pengaduan tersimpan
    $complaint = Complaint::latest()->first();
    expect($complaint)->not->toBeNull();
    expect($complaint->status)->toBe(ComplaintStatusEnum::SUBMITTED);
    expect($complaint->ticket_no)->toMatch('/^PA-PNJ-\d{4}-\d{5}$/');

    // 2. Login sebagai admin, verifikasi pengaduan terlihat
    $this->actingAs($this->admin);

    // 3. Verifikasi pengaduan
    $this->patch("/admin/complaints/{$complaint->id}/verify");
    $complaint->refresh();
    expect($complaint->status)->toBe(ComplaintStatusEnum::VERIFIED);

    // 4. Assign ke petugas
    $this->patch("/admin/complaints/{$complaint->id}/assign", [
        'assigned_to' => $this->petugas->id,
    ]);
    $complaint->refresh();
    expect($complaint->status)->toBe(ComplaintStatusEnum::ASSIGNED);
    expect($complaint->assigned_to)->toBe($this->petugas->id);

    // 5. Login sebagai petugas, respond
    $this->actingAs($this->petugas);
    $this->patch("/petugas/complaints/{$complaint->id}/respond", [
        'note' => 'Pengaduan telah ditindaklanjuti.',
    ]);
    $complaint->refresh();
    expect($complaint->status)->toBe(ComplaintStatusEnum::RESPONDED);

    // 6. Login sebagai panitera, resolve
    $this->actingAs($this->panitera);
    $this->patch("/panitera/complaints/{$complaint->id}/resolve", [
        'note' => 'Pengaduan telah diselesaikan.',
    ]);
    $complaint->refresh();
    expect($complaint->status)->toBe(ComplaintStatusEnum::RESOLVED);
    expect($complaint->resolved_at)->not->toBeNull();

    // 7. Verifikasi riwayat status lengkap
    $statusHistory = ComplaintStatus::where('complaint_id', $complaint->id)
        ->orderBy('created_at')
        ->pluck('status')
        ->map(fn ($s) => $s->value)
        ->toArray();

    expect($statusHistory)->toContain('submitted');
    expect($statusHistory)->toContain('verified');
    expect($statusHistory)->toContain('assigned');
    expect($statusHistory)->toContain('responded');
    expect($statusHistory)->toContain('resolved');
});

test('transisi status yang tidak valid ditolak', function () {
    $complaint = Complaint::factory()
        ->withCategory($this->category)
        ->submitted()
        ->create();

    // Tidak bisa langsung ke assigned tanpa verified
    expect(ComplaintStatusEnum::SUBMITTED->canTransitionTo(ComplaintStatusEnum::ASSIGNED))->toBeFalse();

    // Bisa ke verified
    expect(ComplaintStatusEnum::SUBMITTED->canTransitionTo(ComplaintStatusEnum::VERIFIED))->toBeTrue();
});

test('pengaduan yang sudah resolved bisa dibuka kembali', function () {
    $complaint = Complaint::factory()
        ->withCategory($this->category)
        ->resolved()
        ->create();

    expect(ComplaintStatusEnum::RESOLVED->canTransitionTo(ComplaintStatusEnum::REOPENED))->toBeTrue();
});
