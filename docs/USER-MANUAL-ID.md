# Panduan Pengguna SIPADU

**Sistem Informasi Pengaduan Layanan — Pengadilan Agama Penajam**

---

## Daftar Isi

1. [Untuk Masyarakat](#1-untuk-masyarakat)
2. [Untuk Petugas Layanan](#2-untuk-petugas-layanan)
3. [Untuk Panitera](#3-untuk-panitera)
4. [Untuk Admin](#4-untuk-admin)
5. [FAQ (Pertanyaan yang Sering Diajukan)](#5-faq)

---

## 1. Untuk Masyarakat

### 1.1 Cara Mengajukan Pengaduan

Pengaduan dapat diajukan **tanpa perlu login** melalui halaman publik.

**Langkah-langkah:**

1. Buka halaman utama SIPADU di browser Anda.
2. Klik tombol **"Ajukan Pengaduan"** atau akses langsung ke `/pengaduan/buat`.
3. Isi formulir pengaduan dengan lengkap:

   | Field | Keterangan | Wajib |
   |-------|-----------|-------|
   | NIK | Nomor Induk Kependudukan (16 digit sesuai KTP) | Ya |
   | Nama Lengkap | Nama sesuai KTP | Ya |
   | Alamat | Alamat domisili lengkap | Ya |
   | Nomor HP | Nomor telepon yang aktif (format: 08xx) | Ya |
   | Email | Alamat email untuk notifikasi | Tidak |
   | Kategori Pengaduan | Pilih kategori yang sesuai dari dropdown | Ya |
   | Judul Pengaduan | Ringkasan singkat pengaduan | Ya |
   | Tanggal Kejadian | Tanggal peristiwa yang diadukan | Ya |
   | Lokasi Kejadian | Tempat peristiwa terjadi | Ya |
   | Uraian Lengkap | Penjelasan detail (minimal 50 karakter) | Ya |
   | Pihak yang Dilaporkan | Nama/jabatan pihak yang diadukan | Tidak |
   | Bukti Pendukung | File pendukung (maks 5 file, masing-masing maks 10MB) | Tidak |

4. **Opsi tambahan:**
   - **Laporan Anonim**: Centang jika Anda ingin identitas Anda dirahasiakan dari pihak yang dilaporkan.
   - **Laporan Rahasia**: Centang jika seluruh isi pengaduan bersifat rahasia dan tidak boleh diakses publik.

5. Klik tombol **"Kirim Pengaduan"**.
6. Sistem akan menampilkan **nomor tiket** dengan format `PA-PNJ-2026-XXXXX`. **Simpan nomor ini** untuk melacak status pengaduan Anda.
7. Anda akan menerima konfirmasi melalui email dan/atau WhatsApp (jika nomor HP terdaftar).

**Format file yang diterima:** JPG, JPEG, PNG, PDF, DOC, DOCX

### 1.2 Cara Melacak Status Pengaduan

1. Buka halaman utama SIPADU.
2. Klik **"Cek Status Pengaduan"** atau akses `/pengaduan/cek`.
3. Masukkan **nomor tiket** pengaduan Anda (contoh: PA-PNJ-2026-00001).
4. Klik **"Lacak"**.
5. Sistem akan menampilkan:
   - Status terkini pengaduan
   - Timeline perubahan status
   - Indikator SLA (apakah masih dalam batas waktu)
   - Tanggapan dari petugas (jika sudah ada)

**Status Pengaduan:**

| Status | Keterangan |
|--------|-----------|
| Dikirim | Pengaduan baru diterima sistem |
| Terverifikasi | Admin telah memverifikasi kelengkapan data |
| Ditolak | Pengaduan tidak valid atau duplikat |
| Ditugaskan | Sudah ditugaskan ke petugas penanganan |
| Sedang Diproses | Petugas sedang menangani pengaduan |
| Telah Dijawab | Tanggapan telah diberikan |
| Selesai | Pengaduan telah diselesaikan |
| Dibuka Kembali | Pelapor membuka kembali karena belum puas |

### 1.3 Cara Mendaftar Akun

1. Klik **"Daftar"** di halaman utama.
2. Isi formulir pendaftaran:
   - Nama Lengkap
   - Email
   - Password (minimal 8 karakter, harus mengandung huruf besar, angka, dan simbol)
   - Konfirmasi Password
3. Klik **"Daftar"**.
4. Verifikasi email Anda melalui link yang dikirim ke inbox.

**Keuntungan memiliki akun:**
- Melihat riwayat semua pengaduan yang pernah diajukan
- Data diri otomatis terisi saat mengajukan pengaduan baru
- Mendapat notifikasi perubahan status secara langsung

### 1.4 Cara Login dan Melihat Riwayat Pengaduan

1. Klik **"Login"** di halaman utama.
2. Masukkan email dan password.
3. Setelah login, Anda akan diarahkan ke **Dashboard**.
4. Di dashboard, Anda dapat melihat:
   - Daftar semua pengaduan yang pernah Anda ajukan
   - Status terkini setiap pengaduan
   - Detail lengkap dan timeline setiap pengaduan

---

## 2. Untuk Petugas Layanan

### 2.1 Cara Melihat Pengaduan yang Ditugaskan

1. Login dengan akun petugas layanan.
2. Anda akan diarahkan ke **Dashboard Petugas** (`/petugas/dashboard`).
3. Dashboard menampilkan:
   - Daftar pengaduan yang ditugaskan kepada Anda
   - Indikator SLA untuk setiap pengaduan:
     - **Hijau**: masih dalam batas waktu
     - **Kuning**: mendekati batas waktu (>75% SLA)
     - **Merah**: sudah melewati batas waktu (overdue)
   - Filter berdasarkan status dan kategori

### 2.2 Cara Merespons Pengaduan

1. Klik pengaduan yang ingin ditanggapi dari daftar.
2. Baca detail pengaduan dan bukti pendukung.
3. Klik tombol **"Beri Tanggapan"**.
4. Tulis tanggapan Anda dalam kotak teks.
5. Klik **"Kirim Tanggapan"**.
6. Status pengaduan akan berubah menjadi **"Telah Dijawab"**.
7. Pelapor akan menerima notifikasi tentang tanggapan Anda.

### 2.3 Cara Memperbarui Status Pengaduan

1. Buka detail pengaduan.
2. Klik tombol **"Ubah Status"**.
3. Pilih status baru yang sesuai:
   - **Sedang Diproses**: saat Anda mulai menangani
   - **Telah Dijawab**: saat tanggapan sudah diberikan
4. Tambahkan catatan (opsional) untuk menjelaskan perubahan status.
5. Klik **"Simpan"**.

### 2.4 Memahami Indikator SLA

- Setiap pengaduan memiliki batas waktu penyelesaian (SLA) berdasarkan kategori.
- SLA dihitung dalam **hari kerja** (tidak termasuk Sabtu, Minggu, dan hari libur nasional).
- Batas waktu SLA per kategori:

| Kategori | SLA (Hari Kerja) |
|----------|:----------------:|
| Pelayanan Administrasi Perkara | 14 |
| Keterlambatan Penanganan Perkara | 14 |
| Perilaku Pegawai/Aparat Pengadilan | 60 |
| Pelayanan PTSP | 14 |
| Pelayanan Informasi | 5 |
| Fasilitas dan Sarana Pengadilan | 14 |
| Administrasi Pernikahan/Perceraian | 14 |
| Lainnya | 14 |

---

## 3. Untuk Panitera

### 3.1 Cara Melihat Semua Pengaduan

1. Login dengan akun panitera.
2. Anda akan diarahkan ke **Dashboard Panitera** (`/panitera/dashboard`).
3. Dashboard menampilkan:
   - Ringkasan statistik: total pengaduan, per status, per kategori
   - Daftar semua pengaduan dengan filter dan pencarian
   - Pengaduan yang mendekati atau melewati SLA (ditandai warna)

### 3.2 Cara Menugaskan Pengaduan ke Petugas

1. Buka pengaduan yang berstatus **"Terverifikasi"**.
2. Klik tombol **"Tugaskan"**.
3. Pilih petugas layanan dari dropdown.
4. Tambahkan catatan disposisi (opsional).
5. Klik **"Simpan Penugasan"**.
6. Status pengaduan berubah menjadi **"Ditugaskan"**.
7. Petugas yang ditunjuk akan menerima notifikasi email.

### 3.3 Cara Melakukan Disposisi

Disposisi digunakan untuk meneruskan pengaduan antar unit atau antar petugas:

1. Buka detail pengaduan.
2. Klik **"Disposisi"**.
3. Pilih petugas tujuan.
4. Tulis catatan disposisi (alasan pemindahan).
5. Klik **"Kirim Disposisi"**.
6. Riwayat disposisi tercatat dalam timeline pengaduan.

### 3.4 Cara Mengelola Eskalasi

Pengaduan yang melewati SLA akan otomatis muncul di dashboard dengan tanda peringatan:

1. Lihat daftar **"Pengaduan Overdue"** di dashboard.
2. Klik pengaduan untuk melihat detail.
3. Opsi tindakan:
   - **Re-assign** ke petugas lain jika petugas saat ini tidak responsif
   - **Eskalasi** ke Ketua Pengadilan untuk pengaduan yang sangat terlambat
   - **Hubungi petugas** untuk meminta update

### 3.5 Memahami Dashboard Panitera

Dashboard menampilkan:

- **Statistik Ringkasan**: Total pengaduan, diselesaikan, dalam proses, overdue
- **Grafik SLA Compliance**: Persentase pengaduan yang selesai tepat waktu
- **Daftar Pengaduan Terbaru**: Pengaduan baru yang perlu diverifikasi/ditugaskan
- **Peringatan SLA**: Pengaduan yang mendekati atau melewati deadline
- **Distribusi per Petugas**: Beban kerja setiap petugas layanan

---

## 4. Untuk Admin

### 4.1 Manajemen Pengguna

1. Akses menu **Admin → Pengguna** (`/admin/users`).
2. Fitur yang tersedia:
   - **Tambah Pengguna**: Buat akun baru untuk petugas/panitera
   - **Edit Pengguna**: Ubah data, peran, atau status aktif
   - **Nonaktifkan Pengguna**: Menonaktifkan akun (soft delete, tidak menghapus data)
   - **Reset Password**: Mengirim link reset password ke email pengguna

**Peran yang tersedia:**

| Peran | Deskripsi |
|-------|-----------|
| admin | Akses penuh ke semua fitur sistem |
| panitera | Kelola semua pengaduan, assign, disposisi |
| petugas_layanan | Tangani pengaduan yang ditugaskan |
| masyarakat | Ajukan dan lacak pengaduan sendiri |

### 4.2 Manajemen Kategori

1. Akses menu **Admin → Kategori** (`/admin/categories`).
2. Fitur:
   - Tambah kategori pengaduan baru
   - Edit nama, kode, dan SLA days
   - Aktifkan/nonaktifkan kategori

### 4.3 Pengaturan Sistem

1. Akses menu **Admin → Pengaturan** (`/admin/settings`).
2. Pengaturan yang dapat diubah:

| Pengaturan | Deskripsi |
|------------|-----------|
| SLA Default (hari) | Batas waktu default jika kategori tidak memiliki SLA spesifik |
| Durasi Lockout (menit) | Lama akun terkunci setelah gagal login |
| Maks Percobaan Login | Jumlah percobaan login sebelum akun terkunci |
| Masa Berlaku Password (hari) | Masa berlaku password sebelum harus diganti |
| Notifikasi Email | Aktifkan/nonaktifkan notifikasi email |
| Notifikasi WhatsApp | Aktifkan/nonaktifkan notifikasi WhatsApp |
| Token Fonnte | Token API untuk integrasi WhatsApp |

### 4.4 Melihat Audit Log

1. Akses menu **Admin → Audit Log** (`/admin/audit-logs`).
2. Filter yang tersedia:
   - Berdasarkan pengguna
   - Berdasarkan aksi (login, logout, create, update, delete)
   - Berdasarkan rentang tanggal
   - Berdasarkan model/entitas
3. Setiap entri menampilkan: siapa, kapan, apa yang dilakukan, nilai sebelum dan sesudah.

**Catatan:** Audit log bersifat immutable — tidak bisa diedit atau dihapus oleh siapapun, termasuk admin.

### 4.5 Dashboard dan Statistik

Dashboard admin (`/admin/dashboard`) menampilkan:

- **Ringkasan Total**: Jumlah pengaduan keseluruhan dan per status
- **SLA Compliance Rate**: Persentase pengaduan yang diselesaikan tepat waktu
- **Grafik Tren**: Tren pengaduan per bulan
- **Distribusi Kategori**: Jumlah pengaduan per kategori
- **Distribusi Status**: Jumlah pengaduan per status
- **Top Petugas**: Petugas dengan kinerja penanganan terbaik

### 4.6 Export Laporan

1. Akses menu **Admin → Laporan**.
2. Pilih jenis laporan:
   - Laporan Pengaduan (semua atau berdasarkan filter)
   - Laporan SLA Compliance
   - Laporan Kinerja Petugas
3. Pilih format: PDF atau Excel.
4. Pilih rentang tanggal.
5. Klik **"Download Laporan"**.

---

## 5. FAQ

### Umum

**T: Apakah saya harus mendaftar akun untuk mengajukan pengaduan?**
J: Tidak. Pengaduan dapat diajukan tanpa login melalui halaman pengaduan publik. Namun, jika Anda mendaftar akun, Anda dapat melihat riwayat semua pengaduan yang pernah diajukan.

**T: Bagaimana cara melacak pengaduan saya?**
J: Gunakan nomor tiket (contoh: PA-PNJ-2026-00001) di halaman "Cek Status Pengaduan". Nomor tiket diberikan setelah pengaduan berhasil diajukan.

**T: Berapa lama pengaduan saya akan diproses?**
J: Tergantung pada kategori pengaduan. Sebagian besar pengaduan diproses dalam 14 hari kerja. Pengaduan terkait pelayanan informasi diproses dalam 5 hari kerja. Pengaduan terkait perilaku pegawai memerlukan investigasi dan diproses dalam 60 hari kerja.

**T: Apakah identitas saya aman?**
J: Ya. Data identitas Anda (termasuk NIK) dienkripsi dan hanya dapat diakses oleh petugas berwenang. Anda juga dapat memilih opsi "Laporan Anonim" untuk menyembunyikan identitas dari pihak yang dilaporkan.

**T: File apa saja yang bisa diupload sebagai bukti?**
J: Format yang diterima: JPG, JPEG, PNG, PDF, DOC, DOCX. Maksimal 5 file, masing-masing tidak lebih dari 10MB.

### Teknis

**T: Browser apa yang didukung?**
J: Chrome 90+, Firefox 90+, Safari 14+, dan Microsoft Edge 90+.

**T: Apakah SIPADU bisa diakses dari HP?**
J: Ya. SIPADU dirancang responsif dan dapat diakses melalui browser di perangkat mobile.

**T: Saya lupa password, bagaimana cara reset?**
J: Klik "Lupa Password" di halaman login, masukkan email Anda, dan ikuti instruksi yang dikirim ke email.

**T: Akun saya terkunci, apa yang harus dilakukan?**
J: Akun terkunci otomatis setelah 5 kali gagal login. Tunggu 30 menit dan coba lagi, atau hubungi admin untuk membuka kunci akun.
