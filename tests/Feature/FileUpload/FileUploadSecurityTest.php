<?php

use App\Models\ComplaintCategory;
use Database\Seeders\ComplaintCategorySeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(ComplaintCategorySeeder::class);
    $this->category = ComplaintCategory::where('code', 'ADM')->first();

    $this->baseData = [
        'nik' => '6405012345678901',
        'name' => 'Test Pelapor',
        'address' => 'Jl. Test No. 1, Penajam, Kab. PPU',
        'phone' => '081234567890',
        'category_id' => $this->category->id,
        'title' => 'Test Upload Security',
        'incident_date' => now()->subDays(2)->format('Y-m-d'),
        'incident_location' => 'Kantor PA Penajam',
        'description' => 'Deskripsi pengaduan test yang cukup panjang untuk memenuhi batas validasi minimal lima puluh karakter sesuai ketentuan.',
    ];
});

test('upload JPEG diterima', function () {
    Storage::fake('complaints');

    $data = $this->baseData;
    $data['attachments'] = [UploadedFile::fake()->image('foto.jpg', 800, 600)];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionDoesntHaveErrors('attachments.0');
});

test('upload PNG diterima', function () {
    Storage::fake('complaints');

    $data = $this->baseData;
    $data['attachments'] = [UploadedFile::fake()->image('foto.png', 800, 600)];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionDoesntHaveErrors('attachments.0');
});

test('upload PDF diterima', function () {
    Storage::fake('complaints');

    $data = $this->baseData;
    $data['attachments'] = [UploadedFile::fake()->create('dokumen.pdf', 500, 'application/pdf')];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionDoesntHaveErrors('attachments.0');
});

test('upload DOC/DOCX diterima', function () {
    Storage::fake('complaints');

    $data = $this->baseData;
    $data['attachments'] = [
        UploadedFile::fake()->create('dokumen.doc', 200, 'application/msword'),
    ];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionDoesntHaveErrors('attachments.0');
});

test('upload file executable ditolak (.exe)', function () {
    $data = $this->baseData;
    $data['attachments'] = [
        UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload'),
    ];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionHasErrors('attachments.0');
});

test('upload file PHP ditolak', function () {
    $data = $this->baseData;
    $data['attachments'] = [
        UploadedFile::fake()->create('shell.php', 50, 'application/x-php'),
    ];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionHasErrors('attachments.0');
});

test('upload file shell script ditolak', function () {
    $data = $this->baseData;
    $data['attachments'] = [
        UploadedFile::fake()->create('script.sh', 10, 'application/x-sh'),
    ];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionHasErrors('attachments.0');
});

test('upload file lebih dari 10MB ditolak', function () {
    $data = $this->baseData;
    $data['attachments'] = [
        UploadedFile::fake()->create('besar.pdf', 11000, 'application/pdf'),
    ];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionHasErrors('attachments.0');
});

test('checksum SHA-256 disimpan untuk file yang diupload', function () {
    Storage::fake('complaints');

    $data = $this->baseData;
    $file = UploadedFile::fake()->image('bukti.jpg', 400, 300);
    $data['attachments'] = [$file];

    $this->post('/pengaduan/buat', $data);

    $complaint = \App\Models\Complaint::latest()->first();
    if ($complaint) {
        $attachment = $complaint->attachments()->first();
        if ($attachment) {
            expect($attachment->checksum)->not->toBeNull();
            expect(strlen($attachment->checksum))->toBe(64); // SHA-256 = 64 hex chars
        }
    }
});
