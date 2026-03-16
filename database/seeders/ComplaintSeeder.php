<?php

namespace Database\Seeders;

use App\Enums\ComplaintStatusEnum;
use App\Enums\PriorityEnum;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\ComplaintStatus;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Seeder;

class ComplaintSeeder extends Seeder
{
    /**
     * Membuat 30 pengaduan realistis untuk PA Penajam.
     */
    public function run(): void
    {
        $masyarakat = User::role('masyarakat')->get();
        $petugas = User::role('petugas_layanan')->get();
        $admin = User::role('admin')->first();
        $panitera = User::role('panitera')->first();
        $categories = ComplaintCategory::all()->keyBy('code');

        $complaints = $this->getComplaintData();
        $ticketCounter = 1;

        foreach ($complaints as $index => $data) {
            $category = $categories[$data['category_code']];
            $complainant = $masyarakat[$index % $masyarakat->count()];
            $assignedPetugas = $petugas[$index % $petugas->count()];

            // Hitung tanggal berdasarkan SLA state
            $createdAt = $this->calculateCreatedAt($data['sla_state'], $category->sla_days);
            $slaDeadline = $this->calculateSlaDeadline($createdAt, $category->sla_days);

            $complaint = Complaint::create([
                'ticket_no' => sprintf('PA-PNJ-%d-%05d', now()->year, $ticketCounter++),
                'user_id' => $data['is_anonymous'] ? null : $complainant->id,
                'category_id' => $category->id,
                'title' => $data['title'],
                'description' => $data['description'],
                'reported_party' => $data['reported_party'] ?? null,
                'incident_date' => $createdAt->copy()->subDays(rand(1, 5)),
                'incident_location' => $data['location'] ?? 'Kantor PA Penajam, Jl. Provinsi KM. 9',
                'status' => $data['status'],
                'priority' => $data['priority'] ?? PriorityEnum::NORMAL,
                'assigned_to' => in_array($data['status'], ['assigned', 'in_progress', 'responded', 'resolved'])
                    ? $assignedPetugas->id : null,
                'sla_deadline' => $slaDeadline,
                'resolved_at' => $data['status'] === 'resolved' ? now() : null,
                'is_anonymous' => $data['is_anonymous'] ?? false,
                'is_confidential' => $data['is_confidential'] ?? false,
                'data_classification' => ($data['is_confidential'] ?? false) ? 'confidential' : 'internal',
                'complainant_name' => $complainant->name,
                'complainant_nik' => encrypt('64' . str_pad((string) ($index + 1), 14, '0', STR_PAD_LEFT)),
                'complainant_phone' => $complainant->phone ?? '081200000000',
                'complainant_email' => $complainant->email,
                'complainant_address' => $complainant->address,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Buat riwayat status
            $this->createStatusHistory($complaint, $data['status'], $admin, $panitera, $assignedPetugas, $createdAt);
        }
    }

    /**
     * Menghitung tanggal pembuatan berdasarkan kondisi SLA.
     */
    private function calculateCreatedAt(string $slaState, int $slaDays): CarbonInterface
    {
        return match ($slaState) {
            'on_track' => now()->subDays(rand(1, max(1, (int) ($slaDays * 0.5)))),
            'near_deadline' => now()->subDays(max(1, (int) ($slaDays * 0.8))),
            'overdue' => now()->subDays($slaDays + rand(5, 20)),
        };
    }

    /**
     * Menghitung deadline SLA dari tanggal pembuatan (hari kerja).
     */
    private function calculateSlaDeadline(CarbonInterface $createdAt, int $slaDays): CarbonInterface
    {
        $deadline = $createdAt->toMutable();
        $counted = 0;

        while ($counted < $slaDays) {
            $deadline->addDay();
            if (!$deadline->isWeekend()) {
                $counted++;
            }
        }

        return $deadline;
    }

    /**
     * Membuat riwayat status sesuai status akhir pengaduan.
     */
    private function createStatusHistory(
        Complaint $complaint,
        string $finalStatus,
        User $admin,
        User $panitera,
        User $petugas,
        CarbonInterface $createdAt
    ): void {
        $statusFlow = [
            'submitted' => ['submitted'],
            'verified' => ['submitted', 'verified'],
            'assigned' => ['submitted', 'verified', 'assigned'],
            'in_progress' => ['submitted', 'verified', 'assigned', 'in_progress'],
            'responded' => ['submitted', 'verified', 'assigned', 'in_progress', 'responded'],
            'resolved' => ['submitted', 'verified', 'assigned', 'in_progress', 'responded', 'resolved'],
        ];

        $flow = $statusFlow[$finalStatus] ?? ['submitted'];
        $currentDate = Carbon::parse($createdAt);

        foreach ($flow as $status) {
            $updater = match ($status) {
                'submitted' => $admin,
                'verified' => $admin,
                'assigned' => $panitera,
                'in_progress', 'responded' => $petugas,
                'resolved' => $panitera,
                default => $admin,
            };

            $note = match ($status) {
                'submitted' => 'Pengaduan baru diterima oleh sistem.',
                'verified' => 'Pengaduan telah diverifikasi kelengkapannya.',
                'assigned' => "Pengaduan ditugaskan kepada {$petugas->name}.",
                'in_progress' => 'Pengaduan sedang dalam proses penanganan.',
                'responded' => 'Tanggapan telah diberikan kepada pelapor.',
                'resolved' => 'Pengaduan telah selesai ditangani.',
                default => null,
            };

            ComplaintStatus::create([
                'complaint_id' => $complaint->id,
                'status' => $status,
                'note' => $note,
                'updated_by' => $updater->id,
                'created_at' => $currentDate,
                'updated_at' => $currentDate,
            ]);

            $currentDate = $currentDate->copy()->addHours(rand(2, 48));
        }
    }

    /**
     * Data pengaduan realistis PA Penajam.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getComplaintData(): array
    {
        return [
            // 5 submitted
            ['category_code' => 'ADM', 'status' => 'submitted', 'sla_state' => 'on_track', 'title' => 'Keterlambatan penerbitan akta cerai', 'description' => 'Saya sudah menunggu akta cerai selama 2 minggu sejak putusan dijatuhkan pada tanggal 1 Maret 2026. Padahal seharusnya akta cerai sudah bisa diambil dalam waktu 7 hari kerja setelah putusan berkekuatan hukum tetap.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'PTSP', 'status' => 'submitted', 'sla_state' => 'on_track', 'title' => 'Petugas PTSP tidak memberikan informasi jelas', 'description' => 'Pada saat saya datang ke loket PTSP untuk menanyakan prosedur pendaftaran cerai gugat, petugas tidak memberikan penjelasan yang lengkap dan mempersulit proses. Saya diminta bolak-balik tanpa arahan yang jelas mengenai persyaratan yang dibutuhkan.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'INFO', 'status' => 'submitted', 'sla_state' => 'near_deadline', 'title' => 'Website PA Penajam tidak menampilkan jadwal sidang', 'description' => 'Saya sudah mengecek website PA Penajam dan SIPP namun jadwal sidang perkara saya dengan nomor 45/Pdt.G/2026/PA.Pnj tidak tampil. Hal ini menyulitkan saya untuk mengetahui kapan sidang berikutnya akan dilaksanakan dan mempersiapkan diri.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'FAS', 'status' => 'submitted', 'sla_state' => 'on_track', 'title' => 'AC ruang tunggu PTSP tidak berfungsi', 'description' => 'Sudah beberapa kali saya datang ke PA Penajam dan AC di ruang tunggu PTSP selalu mati. Ruang tunggu menjadi sangat panas terutama di siang hari, membuat para pengunjung tidak nyaman saat menunggu antrian pelayanan.', 'is_anonymous' => true, 'is_confidential' => false],
            ['category_code' => 'KET', 'status' => 'submitted', 'sla_state' => 'near_deadline', 'title' => 'Perkara cerai sudah 4 bulan belum selesai', 'description' => 'Perkara cerai gugat saya dengan nomor 30/Pdt.G/2025/PA.Pnj sudah berjalan selama 4 bulan lebih namun belum ada kejelasan kapan akan diputus. Setiap kali sidang selalu ditunda tanpa alasan yang jelas. Hal ini sangat merugikan saya.', 'is_anonymous' => false, 'is_confidential' => true],

            // 5 verified
            ['category_code' => 'NIK', 'status' => 'verified', 'sla_state' => 'on_track', 'title' => 'Kesalahan nama di akta cerai', 'description' => 'Terdapat kesalahan penulisan nama saya di akta cerai nomor 22/AC/2026/PA.Pnj. Nama tertulis "Rahmat Hidayat" seharusnya "Rachmat Hidayat" sesuai KTP. Mohon segera diperbaiki karena diperlukan untuk mengurus dokumen lainnya.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'ADM', 'status' => 'verified', 'sla_state' => 'near_deadline', 'title' => 'Salinan putusan belum diterima setelah 1 bulan', 'description' => 'Saya telah mengajukan permohonan salinan putusan perkara nomor 18/Pdt.G/2026/PA.Pnj sejak satu bulan yang lalu namun sampai saat ini belum diterima. Salinan putusan tersebut sangat saya perlukan untuk proses administrasi lanjutan.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'PTSP', 'status' => 'verified', 'sla_state' => 'on_track', 'title' => 'Antrian panjang di loket pendaftaran', 'description' => 'Loket pendaftaran perkara di PTSP PA Penajam selalu memiliki antrian yang sangat panjang. Pada tanggal 10 Maret 2026 saya harus menunggu lebih dari 3 jam hanya untuk mendaftarkan perkara. Mohon ditambah petugas atau diperbaiki sistem antriannya.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'LAIN', 'status' => 'verified', 'sla_state' => 'overdue', 'title' => 'Permintaan mediasi yang tidak ditindaklanjuti', 'description' => 'Saya dan mantan istri sudah sepakat untuk melakukan mediasi terkait hak asuh anak namun permohonan kami yang disampaikan melalui PTSP pada bulan Februari belum ditindaklanjuti hingga saat ini. Mohon bantuan untuk mempercepat proses ini.', 'is_anonymous' => false, 'is_confidential' => true],
            ['category_code' => 'INFO', 'status' => 'verified', 'sla_state' => 'on_track', 'title' => 'Informasi biaya perkara tidak transparan', 'description' => 'Pada saat pendaftaran perkara cerai gugat, saya tidak diberikan rincian biaya perkara yang jelas. Petugas hanya menyebutkan total biaya tanpa memberikan rincian komponen biayanya. Seharusnya biaya perkara ditampilkan secara transparan.', 'is_anonymous' => false, 'is_confidential' => false],

            // 5 assigned
            ['category_code' => 'PEG', 'status' => 'assigned', 'sla_state' => 'on_track', 'title' => 'Petugas loket bersikap tidak ramah', 'description' => 'Pada hari Senin 9 Maret 2026, saat saya mengurus berkas di loket PTSP, petugas dengan inisial SS bersikap kasar dan tidak sabar ketika saya bertanya mengenai kelengkapan berkas. Petugas tersebut membentak dan membuat saya merasa dipermalukan di depan pengunjung lain.', 'reported_party' => 'Petugas PTSP berinisial SS', 'is_anonymous' => false, 'is_confidential' => true],
            ['category_code' => 'ADM', 'status' => 'assigned', 'sla_state' => 'near_deadline', 'title' => 'Panggilan sidang tidak sampai', 'description' => 'Relaas panggilan sidang untuk perkara nomor 55/Pdt.G/2026/PA.Pnj tidak pernah sampai ke alamat saya. Akibatnya saya tidak hadir di persidangan dan putusan dijatuhkan secara verstek. Saya merasa dirugikan karena bukan kelalaian saya.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'KET', 'status' => 'assigned', 'sla_state' => 'overdue', 'title' => 'Minutasi perkara sangat lambat', 'description' => 'Perkara saya nomor 12/Pdt.G/2025/PA.Pnj sudah diputus sejak 3 bulan yang lalu namun proses minutasi belum selesai. Akibatnya saya tidak bisa mendapatkan salinan putusan dan akta cerai untuk melanjutkan pengurusan dokumen administrasi.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'FAS', 'status' => 'assigned', 'sla_state' => 'on_track', 'title' => 'Toilet pengunjung tidak terawat', 'description' => 'Toilet yang disediakan untuk pengunjung PA Penajam dalam kondisi tidak terawat. Air tidak mengalir dengan lancar, kebersihan kurang terjaga, dan tidak tersedia sabun cuci tangan. Kondisi ini tidak sesuai dengan standar pelayanan publik yang baik.', 'is_anonymous' => true, 'is_confidential' => false],
            ['category_code' => 'NIK', 'status' => 'assigned', 'sla_state' => 'near_deadline', 'title' => 'Permohonan dispensasi nikah berbelit-belit', 'description' => 'Proses permohonan dispensasi nikah untuk anak saya sangat berbelit-belit. Setiap kali datang selalu diminta dokumen tambahan yang sebelumnya tidak disebutkan. Sudah 3 kali bolak-balik namun berkas tetap belum diterima lengkap oleh petugas pendaftaran.', 'is_anonymous' => false, 'is_confidential' => false],

            // 5 in_progress
            ['category_code' => 'PTSP', 'status' => 'in_progress', 'sla_state' => 'on_track', 'title' => 'Proses e-Court tidak berfungsi dengan baik', 'description' => 'Saya sudah mendaftar e-Court untuk pendaftaran perkara online namun sistem selalu error saat upload berkas. Sudah dicoba berkali-kali dengan browser berbeda namun tetap gagal. Petugas PTSP menyarankan datang langsung padahal tujuan e-Court untuk mempermudah.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'ADM', 'status' => 'in_progress', 'sla_state' => 'overdue', 'title' => 'SKUM dengan nominal berbeda dari yang dibayar', 'description' => 'Surat Kuasa Untuk Membayar (SKUM) yang saya terima memiliki nominal yang berbeda dari jumlah yang sebenarnya saya bayarkan. Di SKUM tertulis Rp 541.000 tetapi saya membayar Rp 591.000. Mohon klarifikasi dan perbaikan atas selisih biaya ini.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'PEG', 'status' => 'in_progress', 'sla_state' => 'on_track', 'title' => 'Dugaan pungli oleh oknum petugas', 'description' => 'Saya dimintai biaya tambahan diluar resmi oleh oknum petugas saat pengurusan akta cerai dengan dalih untuk mempercepat proses. Biaya yang diminta sebesar Rp 500.000 dan tidak disertai kuitansi resmi. Saya menolak dan proses menjadi lambat setelahnya.', 'reported_party' => 'Oknum petugas bagian perkara', 'is_anonymous' => true, 'is_confidential' => true],
            ['category_code' => 'KET', 'status' => 'in_progress', 'sla_state' => 'near_deadline', 'title' => 'Sidang selalu ditunda tanpa pemberitahuan', 'description' => 'Sidang perkara saya nomor 38/Pdt.G/2026/PA.Pnj sudah 3 kali ditunda tanpa pemberitahuan sebelumnya. Saya harus menempuh perjalanan jauh dari Sepaku ke Penajam namun setiap kali sampai baru diberitahu bahwa sidang ditunda. Hal ini sangat merugikan.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'LAIN', 'status' => 'in_progress', 'sla_state' => 'overdue', 'title' => 'Posbakum tidak beroperasi sesuai jadwal', 'description' => 'Pos Bantuan Hukum (Posbakum) di PA Penajam seringkali tutup pada jam operasional. Saya sudah 2 kali datang pada hari dan jam kerja namun Posbakum tidak beroperasi. Padahal saya sangat membutuhkan bantuan hukum gratis untuk perkara cerai saya.', 'is_anonymous' => false, 'is_confidential' => false],

            // 5 responded
            ['category_code' => 'INFO', 'status' => 'responded', 'sla_state' => 'on_track', 'title' => 'Permohonan informasi perkara tidak dijawab', 'description' => 'Saya telah mengirimkan surat permohonan informasi terkait perkara waris nomor 5/Pdt.G/2025/PA.Pnj melalui email PA Penajam sejak 2 minggu yang lalu namun belum mendapat jawaban. Padahal berdasarkan UU KIP, informasi harus diberikan dalam waktu 10 hari kerja.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'ADM', 'status' => 'responded', 'sla_state' => 'near_deadline', 'title' => 'Kesalahan data di SIPP online', 'description' => 'Data perkara saya di SIPP online PA Penajam menampilkan informasi yang tidak akurat. Status perkara masih tertulis "proses" padahal sudah diputus minggu lalu. Ini membingungkan dan menyulitkan saya untuk melacak perkembangan perkara secara online.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'FAS', 'status' => 'responded', 'sla_state' => 'on_track', 'title' => 'Tidak ada area parkir yang memadai', 'description' => 'Area parkir PA Penajam sangat terbatas sehingga pengunjung terpaksa memarkirkan kendaraan di bahu jalan. Hal ini menimbulkan risiko keamanan dan ketertiban. Mohon dipertimbangkan untuk memperluas area parkir atau menyediakan petugas parkir.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'NIK', 'status' => 'responded', 'sla_state' => 'overdue', 'title' => 'Isbat nikah ditolak tanpa alasan jelas', 'description' => 'Permohonan isbat nikah saya ditolak di tahap pendaftaran tanpa penjelasan yang memadai. Petugas hanya mengatakan berkas tidak lengkap tapi tidak menjelaskan berkas apa yang kurang. Saya sudah membawa semua dokumen sesuai daftar persyaratan yang tertera di website.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'PTSP', 'status' => 'responded', 'sla_state' => 'near_deadline', 'title' => 'Pelayanan prodeo (gratis) dipersulit', 'description' => 'Saya mengajukan perkara secara prodeo karena termasuk keluarga tidak mampu namun prosesnya sangat dipersulit. Diminta surat keterangan tidak mampu dari 3 instansi berbeda padahal di website hanya disebutkan perlu SKTM dari kelurahan saja.', 'is_anonymous' => false, 'is_confidential' => false],

            // 5 resolved
            ['category_code' => 'ADM', 'status' => 'resolved', 'sla_state' => 'on_track', 'title' => 'Biaya pendaftaran tidak sesuai PNBP', 'description' => 'Biaya pendaftaran perkara cerai talak yang dikenakan kepada saya tidak sesuai dengan tarif PNBP yang berlaku. Setelah saya konfirmasi ke bagian keuangan ternyata ada komponen biaya yang seharusnya tidak dikenakan. Mohon pengembalian kelebihan biaya tersebut.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'PEG', 'status' => 'resolved', 'sla_state' => 'on_track', 'title' => 'Jurusita tidak profesional saat panggilan', 'description' => 'Jurusita pengganti PA Penajam datang ke rumah saya pada pukul 20.00 malam untuk menyampaikan relaas panggilan sidang. Waktu tersebut tidak sesuai etika dan mengganggu ketenangan keluarga. Seharusnya panggilan disampaikan pada jam kerja.', 'reported_party' => 'Jurusita Pengganti', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'KET', 'status' => 'resolved', 'sla_state' => 'near_deadline', 'title' => 'Eksekusi putusan tidak dilaksanakan', 'description' => 'Putusan perkara harta gono gini nomor 8/Pdt.G/2025/PA.Pnj sudah berkekuatan hukum tetap sejak 6 bulan lalu namun eksekusi belum dilaksanakan. Pihak tergugat tidak kooperatif dan pengadilan belum mengambil tindakan tegas untuk melaksanakan eksekusi.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'INFO', 'status' => 'resolved', 'sla_state' => 'on_track', 'title' => 'Prosedur banding tidak dijelaskan', 'description' => 'Setelah putusan perkara saya dijatuhkan, panitera pengganti tidak menjelaskan hak saya untuk mengajukan banding beserta prosedur dan batas waktunya. Saya baru mengetahui dari pengacara bahwa ada tenggat waktu 14 hari untuk banding yang hampir terlewat.', 'is_anonymous' => false, 'is_confidential' => false],
            ['category_code' => 'LAIN', 'status' => 'resolved', 'sla_state' => 'overdue', 'title' => 'Sidang keliling tidak sesuai jadwal', 'description' => 'Jadwal sidang keliling di Kecamatan Sepaku yang telah diumumkan ternyata dibatalkan tanpa pemberitahuan. Saya dan beberapa warga lain sudah datang ke lokasi sidang keliling namun tidak ada hakim atau petugas yang hadir. Mohon penjadwalan ulang.', 'is_anonymous' => false, 'is_confidential' => false],
        ];
    }
}
