# Dokumen Riset: Kepatuhan SPBE untuk SIPADU
## Sistem Informasi Pengaduan Layanan — Pengadilan Agama Penajam

**Tanggal:** 16 Maret 2026
**Versi:** 1.0
**Tujuan:** Panduan kepatuhan regulasi untuk pengembangan aplikasi pengaduan layanan pemerintah

---

## Daftar Isi

1. [Perpres No. 95 Tahun 2018 — Arsitektur & Keamanan SPBE](#1-perpres-no-95-tahun-2018)
2. [SNI ISO/IEC 27001 — Manajemen Keamanan Informasi](#2-sni-isoiec-27001)
3. [Peraturan BSSN — Keamanan Aplikasi Pemerintah](#3-peraturan-bssn)
4. [Persyaratan Residensi Data](#4-persyaratan-residensi-data)
5. [Persyaratan Pencatatan Log (Logging)](#5-persyaratan-pencatatan-log)
6. [DIPA — Kebutuhan Audit Trail Anggaran](#6-dipa-audit-trail)
7. [Tingkat Kematangan e-Government](#7-tingkat-kematangan-e-government)
8. [Permen PANRB No. 59 Tahun 2020 — Evaluasi SPBE](#8-permen-panrb-no-59-tahun-2020)

---

## 1. Perpres No. 95 Tahun 2018

**Sumber:** [Perpres No. 95 Tahun 2018](https://peraturan.bpk.go.id/Details/96913/perpres-no-95-tahun-2018) — Sistem Pemerintahan Berbasis Elektronik

### 1.1 Arsitektur SPBE

Arsitektur SPBE adalah kerangka dasar yang mendeskripsikan integrasi proses bisnis, data dan informasi, infrastruktur SPBE, aplikasi SPBE, dan keamanan SPBE untuk menghasilkan layanan SPBE yang terintegrasi.

**Domain Arsitektur SPBE (6 Domain):**

| No | Domain | Relevansi untuk SIPADU | Prioritas |
|----|--------|----------------------|-----------|
| 1 | Proses Bisnis | Alur penanganan pengaduan harus terdokumentasi dan terstandar | **MUST** |
| 2 | Data dan Informasi | Struktur data pengaduan harus mengikuti standar nasional | **MUST** |
| 3 | Infrastruktur SPBE | Server, jaringan, dan pusat data harus memenuhi standar | **MUST** |
| 4 | Aplikasi SPBE | Aplikasi harus mengikuti standar pembangunan aplikasi terpadu | **MUST** |
| 5 | Keamanan SPBE | Implementasi keamanan menyeluruh (lihat Bagian 3) | **MUST** |
| 6 | Layanan SPBE | Layanan pengaduan harus terintegrasi dengan sistem nasional | **MUST** |

### 1.2 Keamanan SPBE — 5 Pilar

Perpres ini mendefinisikan keamanan sebagai penjaminan terhadap:

| Pilar | Deskripsi | Implementasi di SIPADU | Prioritas |
|-------|-----------|----------------------|-----------|
| **Kerahasiaan** (Confidentiality) | Data hanya dapat diakses oleh pihak berwenang | Kontrol akses berbasis peran (RBAC), enkripsi data sensitif | **MUST** |
| **Keutuhan** (Integrity) | Data tidak berubah tanpa otorisasi | Hash verification, audit trail setiap perubahan data | **MUST** |
| **Ketersediaan** (Availability) | Sistem selalu tersedia saat dibutuhkan | Uptime monitoring, backup & disaster recovery | **MUST** |
| **Keaslian** (Authenticity) | Identitas pengguna terverifikasi | Autentikasi yang kuat, session management | **MUST** |
| **Nonrepudiation** | Tindakan tidak dapat disangkal pelakunya | Logging lengkap dengan timestamp dan identitas pengguna | **MUST** |

### 1.3 Klasifikasi Data

Data pemerintah diklasifikasikan dalam tingkatan:

| Klasifikasi | Deskripsi | Contoh di SIPADU | Perlakuan |
|-------------|-----------|-----------------|-----------|
| **Publik** | Boleh diakses umum | Statistik pengaduan agregat, status layanan | Tanpa enkripsi khusus |
| **Internal** | Hanya untuk internal instansi | Data proses penanganan pengaduan | Enkripsi at-rest, akses terbatas |
| **Rahasia** (Confidential) | Akses sangat terbatas | Data identitas pelapor, detail pengaduan sensitif | Enkripsi end-to-end, audit ketat |

### 1.4 Interoperabilitas & Integrasi

| Persyaratan | Deskripsi | Prioritas |
|-------------|-----------|-----------|
| Sistem Penghubung Layanan | SIPADU harus mampu terhubung dengan sistem penghubung layanan pemerintah | **SHOULD** |
| Integrasi SP4N-LAPOR! | Sebagai aplikasi pengaduan, SIPADU sebaiknya terintegrasi atau kompatibel dengan SP4N-LAPOR! yang merupakan aplikasi umum nasional untuk pengelolaan pengaduan | **SHOULD** |
| API Standar | Menyediakan API yang mengikuti standar interoperabilitas SPBE | **SHOULD** |
| Format Data Standar | Menggunakan format data yang kompatibel dengan standar nasional | **MUST** |

### 1.5 Audit Trail (Perpres 95/2018)

| Persyaratan | Deskripsi | Prioritas |
|-------------|-----------|-----------|
| Pencatatan aktivitas | Setiap aktivitas pada sistem harus tercatat | **MUST** |
| Identitas pelaku | Siapa yang melakukan aksi | **MUST** |
| Waktu kejadian | Kapan aksi dilakukan (timestamp) | **MUST** |
| Kenirsangkalan | Log tidak dapat dimanipulasi atau dihapus oleh pengguna biasa | **MUST** |

---

## 2. SNI ISO/IEC 27001

**Sumber:** SNI ISO/IEC 27001:2022 (adopsi ISO/IEC 27001:2022) — [Google Cloud SNI 27001 Compliance](https://cloud.google.com/security/compliance/sni-27001)

**Dasar Hukum Kewajiban:** Permen Kominfo No. 4/2016 tentang Sistem Manajemen Keamanan Informasi — mewajibkan sertifikasi SMKI untuk penyelenggara sistem elektronik strategis dan tingkat tinggi.

### 2.1 Persyaratan Sistem Manajemen Keamanan Informasi (SMKI)

| Persyaratan | Deskripsi | Relevansi SIPADU | Prioritas |
|-------------|-----------|-----------------|-----------|
| Penetapan Ruang Lingkup | Definisi batas sistem yang dilindungi | Ruang lingkup SIPADU dan data yang dikelola | **MUST** |
| Penilaian Risiko | Identifikasi dan evaluasi risiko keamanan | Analisis risiko data pengaduan | **MUST** |
| Pengendalian Risiko | Implementasi kontrol untuk mitigasi risiko | Kontrol teknis dan organisasi | **MUST** |
| Pemantauan & Tinjauan | Evaluasi berkala efektivitas SMKI | Review keamanan periodik | **SHOULD** |
| Perbaikan Berkelanjutan | Continuous improvement cycle | Audit dan perbaikan berkala | **SHOULD** |

### 2.2 Kontrol Akses (Annex A)

| Kontrol | Implementasi di SIPADU | Prioritas |
|---------|----------------------|-----------|
| Kebijakan kontrol akses | Dokumentasi kebijakan siapa boleh akses apa | **MUST** |
| Manajemen akses pengguna | Registrasi, provisioning, dan de-provisioning akun | **MUST** |
| Tanggung jawab pengguna | Kebijakan kata sandi, lockout policy | **MUST** |
| Kontrol akses sistem & aplikasi | Role-Based Access Control (RBAC) | **MUST** |
| Segregation of duties | Pemisahan tugas (admin, petugas, pimpinan) | **SHOULD** |

### 2.3 Kriptografi

| Kontrol | Implementasi di SIPADU | Prioritas |
|---------|----------------------|-----------|
| Kebijakan penggunaan kriptografi | Enkripsi data sensitif | **MUST** |
| Manajemen kunci | Pengelolaan kunci enkripsi yang aman | **MUST** |
| Enkripsi data at rest | Enkripsi database yang menyimpan data pengaduan | **MUST** |
| Enkripsi data in transit | HTTPS/TLS untuk semua komunikasi | **MUST** |
| Hashing kata sandi | Argon2, bcrypt, atau PBKDF2 | **MUST** |

### 2.4 Keamanan Operasi

| Kontrol | Implementasi di SIPADU | Prioritas |
|---------|----------------------|-----------|
| Prosedur operasional terdokumentasi | SOP pengoperasian sistem | **MUST** |
| Manajemen perubahan | Change management log | **SHOULD** |
| Manajemen kapasitas | Monitoring resource usage | **SHOULD** |
| Pemisahan lingkungan | Development, staging, production terpisah | **SHOULD** |
| Backup | Backup berkala dan pengujian restore | **MUST** |
| Logging & monitoring | Pencatatan event keamanan | **MUST** |
| Vulnerability management | Patching dan vulnerability scanning | **SHOULD** |

### 2.5 Kewajiban vs Rekomendasi untuk Sistem Pengadilan

Untuk sistem peradilan (termasuk Pengadilan Agama), yang **wajib**:
- Kontrol akses berbasis peran (RBAC)
- Enkripsi data sensitif (identitas pelapor, detail pengaduan)
- Audit trail lengkap
- Backup dan disaster recovery
- Kebijakan keamanan terdokumentasi

Yang **direkomendasikan**:
- Sertifikasi SNI ISO 27001 formal (bergantung klasifikasi sistem)
- Penetration testing berkala
- Security Operations Center (SOC)

---

## 3. Peraturan BSSN

### 3.1 Peraturan BSSN No. 4 Tahun 2021

**Sumber:** [Peraturan BSSN No. 4 Tahun 2021](https://peraturan.bpk.go.id/Details/174275/peraturan-bssn-no-4-tahun-2021) — Pedoman Manajemen Keamanan Informasi SPBE dan Standar Teknis Keamanan SPBE

#### Standar Teknis Keamanan Aplikasi Berbasis Web

| Domain Keamanan | Persyaratan | Implementasi di SIPADU | Prioritas |
|----------------|-------------|----------------------|-----------|
| **Autentikasi** | Manajemen kata sandi yang kuat | Minimal 8 karakter, kombinasi huruf-angka-simbol; hashing dengan Argon2/bcrypt/PBKDF2 | **MUST** |
| **Manajemen Sesi** | Pengendali sesi yang aman | Session timeout, secure cookie flags (HttpOnly, Secure, SameSite) | **MUST** |
| **Kontrol Akses** | Otorisasi pengguna berdasarkan peran | RBAC: admin, petugas, pimpinan, pelapor | **MUST** |
| **Validasi Input** | Validasi di sisi server | Sanitasi input untuk mencegah SQL injection, XSS | **MUST** |
| **Penanganan Error & Logging** | Pencatatan log dan penanganan error yang aman | Log event keamanan; pesan error yang tidak mengungkap informasi sensitif | **MUST** |
| **Kriptografi** | Algoritma sesuai standar | TLS 1.2+, AES-256 untuk data at rest | **MUST** |
| **Keamanan API** | Konfigurasi layanan web yang aman | API authentication, rate limiting, input validation | **MUST** |
| **Keamanan Konfigurasi** | Konfigurasi server sesuai rekomendasi | Security headers, disable unnecessary services | **MUST** |
| **Keamanan File** | Validasi upload dan penyimpanan file | File type validation, malware scanning, isolated storage | **MUST** |

### 3.2 Peraturan BSSN No. 8 Tahun 2024 — Audit Keamanan SPBE

**Sumber:** [Peraturan BSSN No. 8 Tahun 2024](https://peraturan.bpk.go.id/Details/309821/peraturan-bssn-no-8-tahun-2024)

| Komponen Audit | Deskripsi | Prioritas |
|---------------|-----------|-----------|
| Objek Audit | Sistem SPBE yang akan diaudit (termasuk SIPADU) | **MUST** |
| Pelaksana Audit | Auditor internal atau pihak ketiga terakreditasi | **MUST** |
| Kriteria Audit | Standar dan regulasi yang digunakan sebagai acuan | **MUST** |
| Bukti Audit | Dokumentasi dan evidence yang harus disiapkan | **MUST** |
| Kesimpulan Audit | Hasil dan rekomendasi | **MUST** |

**Implikasi untuk SIPADU:** Sistem harus siap diaudit kapan saja. Semua dokumentasi, log, dan konfigurasi keamanan harus tersedia untuk pemeriksaan auditor.

### 3.3 Peraturan BSSN No. 10 Tahun 2020 — Tim Tanggap Insiden Siber (CSIRT)

| Persyaratan | Deskripsi | Prioritas |
|-------------|-----------|-----------|
| Pembentukan CSIRT | Setiap instansi harus memiliki atau tergabung dalam CSIRT | **SHOULD** |
| Prosedur pelaporan insiden | Prosedur tertulis untuk melaporkan insiden keamanan | **MUST** |
| Response time | Waktu tanggap terhadap insiden keamanan | **SHOULD** |
| Koordinasi dengan BSSN | Pelaporan insiden serius ke BSSN | **MUST** |

### 3.4 Penetration Testing

| Persyaratan | Deskripsi | Prioritas |
|-------------|-----------|-----------|
| Vulnerability assessment | Pemindaian kerentanan secara berkala | **SHOULD** |
| Penetration testing | Pengujian penetrasi minimal 1x per tahun | **SHOULD** |
| Remediasi | Perbaikan kerentanan yang ditemukan | **MUST** |
| Dokumentasi | Laporan hasil pengujian | **SHOULD** |

---

## 4. Persyaratan Residensi Data

### 4.1 PP No. 71 Tahun 2019

**Sumber:** [PP No. 71 Tahun 2019](https://peraturan.bpk.go.id/Details/122030/pp-no-71-tahun-2019) — Penyelenggaraan Sistem dan Transaksi Elektronik

| Persyaratan | Deskripsi | Relevansi SIPADU | Prioritas |
|-------------|-----------|-----------------|-----------|
| **Data center di Indonesia** | PSE Lingkup Publik **wajib** menempatkan pusat data dan pusat pemulihan bencana di wilayah Indonesia | SIPADU sebagai sistem pemerintah (PSE Publik) wajib hosting di Indonesia | **MUST** |
| **Disaster Recovery Center** | Wajib memiliki DRC di Indonesia | Backup site di lokasi berbeda di Indonesia | **MUST** |
| **Pengawasan** | Data harus dapat diawasi oleh kementerian/lembaga terkait | Akses audit untuk pengawas | **MUST** |

### 4.2 Pusat Data Nasional (PDN)

| Aspek | Deskripsi | Prioritas |
|-------|-----------|-----------|
| Penggunaan PDN | Instansi pemerintah didorong menggunakan Pusat Data Nasional | **SHOULD** |
| Layanan cloud pemerintah | IaaS, PaaS, SaaS tersedia gratis melalui PDN | **MAY** |
| Migrasi data | Transisi bertahap dari data center lokal ke PDN | **SHOULD** |

### 4.3 Persyaratan Data Center

| Persyaratan | Deskripsi | Prioritas |
|-------------|-----------|-----------|
| Lokasi di Indonesia | Server fisik harus berada di wilayah NKRI | **MUST** |
| Sertifikasi data center | Minimal Tier II untuk instansi daerah, Tier III/IV untuk instansi pusat | **SHOULD** |
| Redundansi | Backup power, redundant connectivity | **SHOULD** |
| Keamanan fisik | Akses terbatas, CCTV, biometrik | **SHOULD** |

### 4.4 Cloud Hosting untuk Pemerintah

| Aspek | Ketentuan | Prioritas |
|-------|-----------|-----------|
| Cloud provider | Harus memiliki data center di Indonesia | **MUST** |
| Sertifikasi | Provider harus memiliki SNI 27001 atau ISO 27001 | **SHOULD** |
| Data sovereignty | Data tidak boleh diproses di luar Indonesia | **MUST** |
| Kontrak | SLA harus mencakup data residency clause | **MUST** |

---

## 5. Persyaratan Pencatatan Log (Logging)

### 5.1 Persyaratan Wajib Berdasarkan BSSN No. 4/2021 & Perpres 95/2018

#### A. Log Akses (Access Log)

| Data yang Dicatat | Deskripsi | Prioritas |
|-------------------|-----------|-----------|
| **Identitas pengguna** | User ID, username, nama lengkap | **MUST** |
| **Waktu akses** | Timestamp dengan timezone (WIB/WITA/WIT) | **MUST** |
| **Alamat IP** | IP address sumber akses | **MUST** |
| **User agent** | Browser/device information | **SHOULD** |
| **Resource yang diakses** | URL/endpoint/halaman yang dikunjungi | **MUST** |
| **Hasil akses** | Berhasil/gagal (HTTP status code) | **MUST** |

#### B. Log Autentikasi

| Event | Data yang Dicatat | Prioritas |
|-------|-------------------|-----------|
| **Login berhasil** | User ID, IP, timestamp, metode autentikasi | **MUST** |
| **Login gagal** | User ID/input, IP, timestamp, alasan gagal | **MUST** |
| **Logout** | User ID, IP, timestamp, metode (manual/timeout) | **MUST** |
| **Perubahan kata sandi** | User ID, IP, timestamp | **MUST** |
| **Reset kata sandi** | User ID, IP, timestamp, metode reset | **MUST** |
| **Lockout akun** | User ID, IP, timestamp, jumlah percobaan | **MUST** |

#### C. Log Session

| Data | Deskripsi | Prioritas |
|------|-----------|-----------|
| **Session ID** | Identifier sesi unik (di-hash untuk keamanan) | **MUST** |
| **Durasi sesi** | Waktu mulai dan berakhir sesi | **SHOULD** |
| **Aktivitas dalam sesi** | Ringkasan aktivitas pengguna | **SHOULD** |
| **Session timeout** | Pencatatan sesi yang berakhir karena timeout | **MUST** |

#### D. Log Modifikasi Data (Audit Trail)

| Data | Deskripsi | Prioritas |
|------|-----------|-----------|
| **Tabel/entitas yang diubah** | Nama tabel atau objek data | **MUST** |
| **Record ID** | Identifier record yang dimodifikasi | **MUST** |
| **Jenis operasi** | CREATE, READ, UPDATE, DELETE | **MUST** |
| **Nilai sebelum (before)** | Snapshot data sebelum perubahan | **MUST** |
| **Nilai sesudah (after)** | Snapshot data setelah perubahan | **MUST** |
| **Pelaku perubahan** | User ID dan nama pengguna | **MUST** |
| **Waktu perubahan** | Timestamp | **MUST** |
| **IP address** | Asal permintaan perubahan | **MUST** |
| **Alasan perubahan** | Keterangan/catatan perubahan (jika ada) | **SHOULD** |

#### E. Retensi Log

| Jenis Log | Periode Retensi Minimum | Sumber Regulasi | Prioritas |
|-----------|------------------------|-----------------|-----------|
| Log akses | 1 tahun | PP 71/2019, BSSN 4/2021 | **MUST** |
| Log autentikasi | 1 tahun | BSSN 4/2021 | **MUST** |
| Log modifikasi data | 5 tahun | Standar audit keuangan pemerintah | **SHOULD** |
| Log transaksi keuangan | 10 tahun | Peraturan BPK | **MUST** |
| Backup log | Sesuai jenis log induk | Best practice | **SHOULD** |

#### F. Perlindungan Log

| Persyaratan | Deskripsi | Prioritas |
|-------------|-----------|-----------|
| Immutability | Log tidak boleh dapat diubah atau dihapus oleh pengguna biasa | **MUST** |
| Pemisahan akses | Admin sistem tidak boleh bisa menghapus log | **MUST** |
| Enkripsi | Log yang mengandung data sensitif harus dienkripsi | **SHOULD** |
| Backup terpisah | Salinan log di lokasi terpisah | **SHOULD** |
| Integritas | Mekanisme deteksi modifikasi log (checksums) | **SHOULD** |

---

## 6. DIPA — Audit Trail Anggaran

### 6.1 Konteks DIPA untuk SIPADU

DIPA (Daftar Isian Pelaksanaan Anggaran) adalah dokumen pelaksanaan anggaran yang disusun oleh setiap satuan kerja (satker) pemerintah. SIPADU sebagai sistem yang dibangun dan dioperasikan menggunakan anggaran negara harus memiliki jejak audit yang mendukung pertanggungjawaban DIPA.

### 6.2 Persyaratan Audit Trail Keuangan

| Persyaratan | Deskripsi | Relevansi SIPADU | Prioritas |
|-------------|-----------|-----------------|-----------|
| **Pencatatan biaya operasional** | Biaya hosting, maintenance, lisensi | Log penggunaan resource sistem | **SHOULD** |
| **Pencatatan SLA** | Uptime dan performa layanan | Dashboard monitoring | **SHOULD** |
| **Pelaporan penggunaan** | Statistik penggunaan sistem | Jumlah pengaduan, response time | **MUST** |
| **Akuntabilitas penyelesaian** | Bukti penyelesaian pengaduan | Status dan timeline pengaduan | **MUST** |

### 6.3 Hubungan Sistem Pengaduan dengan Pelaporan DIPA

| Aspek | Kebutuhan | Prioritas |
|-------|-----------|-----------|
| Statistik layanan | Jumlah pengaduan diterima, diproses, diselesaikan per periode | **MUST** |
| Waktu penyelesaian | Rata-rata waktu penyelesaian pengaduan (SLA compliance) | **MUST** |
| Beban kerja | Distribusi pengaduan per petugas/unit | **SHOULD** |
| Kepuasan pelapor | Feedback/rating dari pelapor | **SHOULD** |
| Laporan periodik | Report bulanan/triwulanan untuk LAKIP | **MUST** |

---

## 7. Tingkat Kematangan e-Government

### 7.1 Level Kematangan SPBE

**Sumber:** [Perpres 95/2018](https://peraturan.bpk.go.id/Details/96913/perpres-no-95-tahun-2018) & [Permen PANRB 59/2020](https://peraturan.bpk.go.id/Details/150381/permen-pan-rb-no-59-tahun-2020)

| Level | Nama | Karakteristik | Target SIPADU |
|-------|------|--------------|--------------|
| 1 | **Rintisan** | Sistem ada tapi belum terstandar, belum terdokumentasi | — |
| 2 | **Terkelola** | Sistem terdokumentasi, ada kebijakan internal | Minimum awal |
| 3 | **Terstandardisasi** | Mengikuti standar nasional, terintegrasi parsial | **Target minimum** |
| 4 | **Terintegrasi** | Terintegrasi penuh dengan sistem lain, data sharing | Target ideal |
| 5 | **Optimum** | Inovasi berkelanjutan, adaptif, analitik prediktif | Target jangka panjang |

### 7.2 Indikator Kematangan untuk Sistem Pengaduan

| Indikator | Level 3 (Target Minimum) | Level 4 (Target Ideal) |
|-----------|-------------------------|----------------------|
| Proses bisnis | SOP terstandar dan terdokumentasi | Terintegrasi dengan proses bisnis instansi lain |
| Data | Format data standar, database terstruktur | Data sharing dengan SP4N-LAPOR! |
| Aplikasi | Aplikasi web responsif, fitur lengkap | Terintegrasi API dengan sistem lain |
| Keamanan | Memenuhi standar BSSN | Audit keamanan berkala, CSIRT aktif |
| Layanan | Layanan online 24/7, tracking pengaduan | Multi-channel, analytics, dashboard publik |

### 7.3 SP4N-LAPOR! sebagai Acuan

**Sumber:** [OECD OPSI — SP4N-LAPOR!](https://oecd-opsi.org/innovations/sp4n-lapor-indonesias-national-complaint-handling-management-system/)

SP4N-LAPOR! adalah sistem pengelolaan pengaduan pelayanan publik nasional yang ditetapkan melalui Perpres 95/2018 sebagai aplikasi umum. Implikasi:

| Aspek | Persyaratan | Prioritas |
|-------|-------------|-----------|
| Kompatibilitas | SIPADU sebaiknya kompatibel dengan SP4N-LAPOR! | **SHOULD** |
| Standar data | Mengikuti struktur data SP4N-LAPOR! | **SHOULD** |
| Integrasi | Kemampuan feed data ke SP4N-LAPOR! | **SHOULD** |
| Independensi | SIPADU tetap boleh berdiri sendiri untuk kebutuhan internal PA Penajam | **MAY** |

---

## 8. Permen PANRB No. 59 Tahun 2020

**Sumber:** [Permen PANRB No. 59 Tahun 2020](https://peraturan.bpk.go.id/Details/150381/permen-pan-rb-no-59-tahun-2020) — Pemantauan dan Evaluasi SPBE

### 8.1 Struktur Evaluasi

Evaluasi SPBE terdiri dari **4 domain, 8 aspek, dan 47 indikator**:

| Domain | Aspek | Jumlah Indikator |
|--------|-------|-----------------|
| 1. Kebijakan SPBE | Kebijakan Tata Kelola, Kebijakan Layanan | ~9 |
| 2. Tata Kelola SPBE | Perencanaan Strategis, TIK, Penyelenggara | ~10 |
| 3. Manajemen SPBE | Manajemen Pengetahuan, Manajemen Perubahan, dll. | ~12 |
| 4. Layanan SPBE | Layanan Administrasi Pemerintahan, Layanan Publik | ~16 |

### 8.2 Indikator Relevan untuk SIPADU

| Indikator | Deskripsi | Cara Memenuhi | Prioritas |
|-----------|-----------|--------------|-----------|
| Arsitektur SPBE | Dokumen arsitektur sistem | Dokumentasi arsitektur SIPADU | **MUST** |
| Peta Rencana SPBE | Roadmap pengembangan | Rencana pengembangan SIPADU | **MUST** |
| Keamanan SPBE | Implementasi keamanan sesuai standar | Mengikuti BSSN No. 4/2021 | **MUST** |
| Audit TIK | Kesiapan diaudit | Log, dokumentasi, konfigurasi tersedia | **MUST** |
| Layanan Pengaduan | Kualitas layanan pengaduan online | Fitur lengkap, aksesibilitas, SLA | **MUST** |
| Jaringan Intra | Penggunaan jaringan internal pemerintah | Koneksi ke jaringan intra jika tersedia | **SHOULD** |
| Aplikasi Terpadu | Integrasi dengan aplikasi pemerintah lain | API dan interoperabilitas | **SHOULD** |

### 8.3 Metode Evaluasi

| Tahap | Aktivitas | Implikasi SIPADU |
|-------|-----------|-----------------|
| Penilaian Mandiri | Self-assessment oleh instansi | Pengadilan Agama Penajam melakukan self-assessment | **MUST** |
| Penilaian Dokumen | Review dokumen pendukung | Menyiapkan dokumentasi lengkap | **MUST** |
| Penilaian Wawancara | Wawancara dengan pengelola | Tim IT siap menjelaskan sistem | **SHOULD** |
| Visitasi | Kunjungan lapangan (jika diperlukan) | Demo sistem dan infrastruktur | **MAY** |

### 8.4 Persyaratan Minimum Kepatuhan

Untuk mencapai indeks SPBE minimal "Baik" (skor >= 2.6), SIPADU harus memenuhi:

| Area | Persyaratan Minimum |
|------|---------------------|
| Kebijakan | SK internal tentang pengelolaan SIPADU, kebijakan keamanan informasi |
| Tata Kelola | Arsitektur terdokumentasi, peta rencana ada, tim pengelola ditunjuk |
| Manajemen | SOP operasional, manajemen risiko dasar, pengelolaan aset TIK |
| Layanan | Layanan online berfungsi, dapat diakses publik, ada mekanisme feedback |
| Keamanan | Kontrol akses, logging, backup, enkripsi data sensitif |

---

## Ringkasan Prioritas Implementasi

### MUST (Wajib — Harus Ada Sejak Awal)

1. Kontrol akses berbasis peran (RBAC)
2. Autentikasi yang kuat (hashing kata sandi dengan bcrypt/Argon2)
3. Enkripsi data in transit (HTTPS/TLS)
4. Enkripsi data sensitif at rest
5. Audit trail lengkap (siapa, apa, kapan, dari mana, sebelum/sesudah)
6. Logging autentikasi (login/logout/gagal)
7. Validasi input di sisi server
8. Hosting di Indonesia (data residency)
9. Backup berkala
10. Penanganan error yang aman (tidak expose informasi teknis)
11. Manajemen sesi yang aman
12. Dokumentasi arsitektur dan SOP
13. Retensi log minimal 1 tahun
14. Statistik layanan untuk pelaporan

### SHOULD (Sebaiknya — Target Pengembangan)

1. Integrasi/kompatibilitas dengan SP4N-LAPOR!
2. API standar untuk interoperabilitas
3. Penetration testing berkala
4. Prosedur incident response terdokumentasi
5. Pemisahan lingkungan (dev/staging/production)
6. Vulnerability scanning
7. Log immutability (append-only log)
8. Dashboard monitoring dan analytics
9. Sertifikasi SNI ISO 27001
10. Membership CSIRT

### MAY (Opsional — Nice to Have)

1. Penggunaan Pusat Data Nasional (PDN)
2. Multi-channel pengaduan (WhatsApp, SMS, dll.)
3. Analitik prediktif
4. Integrasi single sign-on (SSO) pemerintah
5. Dashboard publik statistik pengaduan

---

## Referensi Regulasi

| No | Regulasi | Tentang |
|----|----------|---------|
| 1 | [Perpres No. 95/2018](https://peraturan.bpk.go.id/Details/96913/perpres-no-95-tahun-2018) | Sistem Pemerintahan Berbasis Elektronik |
| 2 | [Perpres No. 132/2022](https://peraturan.go.id) | Arsitektur SPBE Nasional |
| 3 | [PP No. 71/2019](https://peraturan.bpk.go.id/Details/122030/pp-no-71-tahun-2019) | Penyelenggaraan Sistem dan Transaksi Elektronik |
| 4 | [Permen PANRB No. 59/2020](https://peraturan.bpk.go.id/Details/150381/permen-pan-rb-no-59-tahun-2020) | Pemantauan dan Evaluasi SPBE |
| 5 | [Permen Kominfo No. 4/2016](https://jdih.komdigi.go.id) | Sistem Manajemen Keamanan Informasi |
| 6 | [Peraturan BSSN No. 4/2021](https://peraturan.bpk.go.id/Details/174275/peraturan-bssn-no-4-tahun-2021) | Pedoman Manajemen Keamanan Informasi SPBE |
| 7 | [Peraturan BSSN No. 8/2024](https://peraturan.bpk.go.id/Details/309821/peraturan-bssn-no-8-tahun-2024) | Audit Keamanan SPBE |
| 8 | [Peraturan BSSN No. 10/2020](https://www.bssn.go.id) | Tim Tanggap Insiden Siber |
| 9 | SNI ISO/IEC 27001:2022 | Sistem Manajemen Keamanan Informasi |
