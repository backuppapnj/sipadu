# Kepatuhan SPBE — SIPADU

Dokumen ini memetakan setiap persyaratan Perpres 95/2018 (SPBE) ke implementasi spesifik dalam kode SIPADU.

---

## Arsitektur Sistem (Text-Based)

```
┌────────────────────────────────────────────────────────────────┐
│                         SIPADU                                  │
├─────────────┬─────────────┬─────────────┬──────────────────────┤
│  Presentation │   Application  │   Domain      │   Infrastructure   │
│  Layer        │   Layer        │   Layer       │   Layer            │
├─────────────┼─────────────┼─────────────┼──────────────────────┤
│ React 19    │ Controllers  │ Actions     │ MySQL 8.0            │
│ Inertia v2  │ Middleware   │ Services    │ Laravel Queue        │
│ Tailwind    │ Form Request │ Models      │ File Storage         │
│ TypeScript  │ Sanctum Auth │ Enums       │ Fonnte API           │
└─────────────┴─────────────┴─────────────┴──────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 │   Audit Trail           │
                 │   (Spatie Activitylog   │
                 │   + Custom AuditLog)    │
                 └─────────────────────────┘
```

## Alur Proses Bisnis

```
Masyarakat                    Sistem                    Petugas/Panitera
    │                           │                           │
    ├── Submit Pengaduan ──────>│                           │
    │                           ├── Generate Ticket No      │
    │                           ├── Set SLA Deadline        │
    │                           ├── Kirim Notifikasi ──────>│
    │<── Terima Ticket No ──────┤                           │
    │                           │                           │
    │                           │<── Verifikasi ────────────┤
    │<── Notifikasi Status ─────┤                           │
    │                           │                           │
    │                           │<── Assign ke Petugas ─────┤
    │<── Notifikasi Assigned ───┤                           │
    │                           │                           │
    │                           │<── Respond ───────────────┤
    │<── Notifikasi Responded ──┤                           │
    │                           │                           │
    │                           │<── Resolve ───────────────┤
    │<── Notifikasi Resolved ───┤                           │
    │                           │                           │
    │── Cek Status (Tracking) ─>│                           │
    │<── Tampilkan Timeline ────┤                           │
```

## Pemetaan Persyaratan SPBE

### Domain 1: Proses Bisnis

| Persyaratan | File/Implementasi | Status |
|-------------|-------------------|--------|
| Alur pengaduan terstandar | `app/Enums/ComplaintStatusEnum.php` — status flow dengan transisi yang divalidasi | Implementasi |
| SOP penanganan pengaduan | `docs/USER-MANUAL-ID.md` — panduan lengkap per peran | Implementasi |
| SLA per kategori | `app/Models/ComplaintCategory.php` — sla_days per kategori | Implementasi |
| Eskalasi otomatis | `app/Console/Commands/CheckSlaDeadlinesCommand.php` — scheduled check | Implementasi |

### Domain 2: Data dan Informasi

| Persyaratan | File/Implementasi | Status |
|-------------|-------------------|--------|
| Klasifikasi data | `app/Enums/DataClassificationEnum.php` — public/internal/confidential | Implementasi |
| Format data standar | `database/migrations/` — skema database terstruktur dengan tipe data yang konsisten | Implementasi |
| Integrasi SP4N-LAPOR! | Fase 1: standalone, field `sp4n_reference` disiapkan | Rencana |

### Domain 3: Infrastruktur SPBE

| Persyaratan | File/Implementasi | Status |
|-------------|-------------------|--------|
| Hosting di Indonesia | Deployment ke data center Indonesia (konfigurasi server) | Rencana |
| Backup berkala | Konfigurasi Supervisor + cron job backup | Rencana |
| Disaster Recovery | DRC di lokasi berbeda di Indonesia | Rencana |

### Domain 4: Aplikasi SPBE

| Persyaratan | File/Implementasi | Status |
|-------------|-------------------|--------|
| Aplikasi web responsif | `resources/js/` — React + Tailwind CSS responsive design | Implementasi |
| Aksesibilitas (WCAG 2.1 AA) | Semantic HTML, aria-labels, contrast ratio, keyboard nav | Implementasi |
| Mobile-friendly | Tailwind responsive classes di semua komponen | Implementasi |

### Domain 5: Keamanan SPBE

| Pilar | Implementasi | File |
|-------|-------------|------|
| **Kerahasiaan** | RBAC via Spatie Permission, enkripsi NIK | `app/Models/User.php`, `app/Models/Complaint.php` |
| **Keutuhan** | SHA-256 checksum file, audit trail | `app/Actions/Attachment/`, `app/Models/AuditLog.php` |
| **Ketersediaan** | Queue worker, session management | `config/queue.php`, `config/session.php` |
| **Keaslian** | Sanctum session auth, password hashing | `config/sanctum.php`, `config/hashing.php` |
| **Nonrepudiation** | Audit log immutable, timestamp + user ID | `app/Models/AuditLog.php` |

### Domain 6: Layanan SPBE

| Persyaratan | File/Implementasi | Status |
|-------------|-------------------|--------|
| Layanan pengaduan online | Form publik tanpa login di `/pengaduan/buat` | Implementasi |
| Tracking pengaduan | Halaman publik `/pengaduan/cek` dengan nomor tiket | Implementasi |
| Notifikasi multi-channel | Email + WhatsApp (Fonnte) | Implementasi |
| Statistik layanan publik | Dashboard admin dengan statistik agregat | Implementasi |

## Matriks Implementasi Keamanan

| Kontrol Keamanan | Implementasi | File |
|-----------------|-------------|------|
| Autentikasi kuat | Sanctum session, password policy (min 8, uppercase, number, symbol) | `config/fortify.php` |
| Manajemen sesi | HttpOnly, Secure, SameSite cookies, session timeout | `config/session.php` |
| RBAC | 4 roles, 10+ permissions via Spatie Permission | `database/seeders/RolePermissionSeeder.php` |
| Validasi input | Form Request classes, server-side validation | `app/Http/Requests/` |
| Pencegahan SQL Injection | Eloquent ORM, parameterized queries | Seluruh kode |
| Pencegahan XSS | React auto-escaping, CSP headers | `app/Http/Middleware/` |
| CSRF Protection | Sanctum + Inertia automatic CSRF | Built-in |
| Enkripsi data at rest | Laravel Crypt untuk NIK, file attachments | `app/Models/User.php`, `app/Models/Complaint.php` |
| Enkripsi data in transit | HTTPS/TLS (konfigurasi server) | Production config |
| Audit trail immutable | AuditLog model tanpa update/delete | `app/Models/AuditLog.php` |
| Rate limiting | Laravel throttle middleware | `routes/web.php` |
| Account lockout | 5 failed attempts → 30 min lockout | `app/Http/Middleware/CheckAccountLockout.php` |
| File upload security | MIME validation, size limit, checksum | `app/Http/Requests/StoreComplaintRequest.php` |

## Cakupan Audit Trail

| Aksi | Dicatat | Mekanisme |
|------|---------|-----------|
| Login berhasil | Ya | AuditMiddleware → AuditLog |
| Login gagal | Ya | AuditMiddleware → AuditLog |
| Logout | Ya | AuditMiddleware → AuditLog |
| Buat pengaduan | Ya | Spatie Activitylog + AuditLog |
| Ubah status pengaduan | Ya | Spatie Activitylog (old/new values) |
| Assign pengaduan | Ya | Spatie Activitylog + AuditLog |
| Upload file | Ya | AuditLog (file metadata) |
| CRUD pengguna | Ya | Spatie Activitylog |
| Ubah pengaturan | Ya | AuditLog |
| Akses halaman | Ya | AuditMiddleware (access log) |

## Checklist Evaluasi SPBE (Permen PANRB 59/2020)

| Indikator | Bukti Kepatuhan | Status |
|-----------|----------------|--------|
| Arsitektur SPBE terdokumentasi | Dokumen ini + `docs/` | Selesai |
| Peta rencana SPBE | Roadmap di project-spec.md | Selesai |
| Keamanan sesuai BSSN | Implementasi kontrol keamanan (lihat matriks di atas) | Selesai |
| Kesiapan audit TIK | Log, dokumentasi, konfigurasi tersedia | Selesai |
| Layanan pengaduan berkualitas | Fitur lengkap, aksesibilitas, SLA | Selesai |
| Kontrol akses | RBAC 4 peran | Selesai |
| Logging & monitoring | Audit trail lengkap | Selesai |
| Backup | Konfigurasi backup (deployment) | Rencana |
| Enkripsi data sensitif | NIK, file attachments terenkripsi | Selesai |
