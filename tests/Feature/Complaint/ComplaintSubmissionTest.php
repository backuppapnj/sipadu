<?php

use App\Enums\ComplaintStatusEnum;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use Database\Seeders\ComplaintCategorySeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(ComplaintCategorySeeder::class);
    $this->category = ComplaintCategory::where('code', 'ADM')->first();
});

/**
 * Helper: data pengaduan valid.
 */
function validComplaintData(int $categoryId): array
{
    return [
        'nik' => '6405012345678901',
        'name' => 'Test Pelapor',
        'address' => 'Jl. Test No. 1, Penajam, Kab. PPU',
        'phone' => '081234567890',
        'email' => 'pelapor@test.com',
        'category_id' => $categoryId,
        'title' => 'Judul Pengaduan Test',
        'incident_date' => now()->subDays(2)->format('Y-m-d'),
        'incident_location' => 'Kantor PA Penajam',
        'description' => 'Deskripsi pengaduan test yang cukup panjang untuk memenuhi validasi minimum lima puluh karakter agar lolos validasi.',
    ];
}

test('pengaduan valid dengan semua field berhasil disimpan', function () {
    $data = validComplaintData($this->category->id);
    $data['reported_party'] = 'Petugas PTSP';

    $response = $this->post('/pengaduan/buat', $data);

    $complaint = Complaint::latest()->first();
    expect($complaint)->not->toBeNull();
    expect($complaint->title)->toBe('Judul Pengaduan Test');
    expect($complaint->status)->toBe(ComplaintStatusEnum::SUBMITTED);
    expect($complaint->category_id)->toBe($this->category->id);
});

test('pengaduan valid hanya dengan field wajib berhasil disimpan', function () {
    $data = validComplaintData($this->category->id);
    unset($data['email']);

    $response = $this->post('/pengaduan/buat', $data);

    expect(Complaint::count())->toBeGreaterThanOrEqual(1);
});

test('validasi: field wajib kosong ditolak', function () {
    $response = $this->post('/pengaduan/buat', []);

    $response->assertSessionHasErrors(['nik', 'name', 'address', 'phone', 'category_id', 'title', 'incident_date', 'description']);
});

test('validasi: NIK harus 16 digit', function () {
    $data = validComplaintData($this->category->id);
    $data['nik'] = '12345'; // Kurang dari 16 digit

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionHasErrors('nik');
});

test('validasi: deskripsi minimal 50 karakter', function () {
    $data = validComplaintData($this->category->id);
    $data['description'] = 'Terlalu pendek.';

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionHasErrors('description');
});

test('upload file: MIME type valid diterima', function () {
    Storage::fake('complaints');

    $data = validComplaintData($this->category->id);
    $data['attachments'] = [
        UploadedFile::fake()->image('bukti.jpg', 800, 600),
        UploadedFile::fake()->create('dokumen.pdf', 500, 'application/pdf'),
    ];

    $response = $this->post('/pengaduan/buat', $data);

    // Tidak ada error untuk attachments
    $response->assertSessionDoesntHaveErrors('attachments');
    $response->assertSessionDoesntHaveErrors('attachments.0');
    $response->assertSessionDoesntHaveErrors('attachments.1');
});

test('upload file: MIME type tidak valid ditolak', function () {
    $data = validComplaintData($this->category->id);
    $data['attachments'] = [
        UploadedFile::fake()->create('malware.exe', 100, 'application/x-msdownload'),
    ];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionHasErrors('attachments.0');
});

test('upload file: file lebih dari 10MB ditolak', function () {
    $data = validComplaintData($this->category->id);
    $data['attachments'] = [
        UploadedFile::fake()->create('besar.pdf', 11000, 'application/pdf'), // 11MB
    ];

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionHasErrors('attachments.0');
});

test('upload file: maksimal 5 file', function () {
    $data = validComplaintData($this->category->id);
    $data['attachments'] = [];
    for ($i = 0; $i < 6; $i++) {
        $data['attachments'][] = UploadedFile::fake()->image("bukti{$i}.jpg", 200, 200);
    }

    $response = $this->post('/pengaduan/buat', $data);

    $response->assertSessionHasErrors('attachments');
});

test('pengaduan anonim berhasil disimpan', function () {
    $data = validComplaintData($this->category->id);
    $data['is_anonymous'] = true;

    $response = $this->post('/pengaduan/buat', $data);

    $complaint = Complaint::latest()->first();
    expect($complaint)->not->toBeNull();
    expect($complaint->is_anonymous)->toBeTrue();
});

test('pengaduan rahasia berhasil disimpan', function () {
    $data = validComplaintData($this->category->id);
    $data['is_confidential'] = true;

    $response = $this->post('/pengaduan/buat', $data);

    $complaint = Complaint::latest()->first();
    expect($complaint)->not->toBeNull();
    expect($complaint->is_confidential)->toBeTrue();
});

test('nomor tiket mengikuti format PA-PNJ-YYYY-XXXXX', function () {
    $data = validComplaintData($this->category->id);

    $this->post('/pengaduan/buat', $data);

    $complaint = Complaint::latest()->first();
    expect($complaint)->not->toBeNull();
    expect($complaint->ticket_no)->toMatch('/^PA-PNJ-' . now()->year . '-\d{5}$/');
});

test('nomor tiket unik untuk setiap pengaduan', function () {
    $data = validComplaintData($this->category->id);

    $this->post('/pengaduan/buat', $data);
    $this->post('/pengaduan/buat', $data);

    $tickets = Complaint::pluck('ticket_no')->toArray();
    expect(count($tickets))->toBe(count(array_unique($tickets)));
});
