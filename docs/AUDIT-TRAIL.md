# Audit Trail — SIPADU

Dokumentasi sistem pencatatan audit trail untuk kepatuhan SPBE (Perpres 95/2018) dan BSSN No. 4/2021.

---

## Apa yang Dicatat

SIPADU mencatat **semua** aktivitas berikut:

| Kategori | Aksi yang Dicatat | Contoh |
|----------|-------------------|--------|
| **Autentikasi** | Login berhasil, login gagal, logout, lockout akun | User X login dari IP 192.168.1.1 |
| **Pengaduan** | Pembuatan, perubahan status, penugasan, respons, penyelesaian | Pengaduan PA-PNJ-2026-00001 diubah dari submitted ke verified |
| **Pengguna** | Pembuatan akun, perubahan data, perubahan peran, penonaktifan | User Y diubah perannya dari masyarakat ke petugas_layanan |
| **File** | Upload attachment, download | File bukti.jpg diupload untuk pengaduan PA-PNJ-2026-00001 |
| **Pengaturan** | Perubahan konfigurasi sistem | SLA default diubah dari 14 ke 21 hari |
| **Akses** | Setiap request HTTP ke sistem | GET /admin/dashboard oleh User Z |

## Lokasi Penyimpanan

### Tabel `audit_logs` (Custom SPBE)

Tabel utama untuk pencatatan audit sesuai SPBE. Bersifat **immutable** — tidak bisa diubah atau dihapus.

```sql
CREATE TABLE audit_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NULL,           -- Pelaku aksi (NULL untuk guest)
    user_ip         VARCHAR(45),                    -- Alamat IP
    user_agent      VARCHAR(500),                   -- Browser/device info
    action          VARCHAR(50),                    -- create/read/update/delete/login/logout
    subject_type    VARCHAR(255) NULL,              -- Model class (App\Models\Complaint)
    subject_id      BIGINT UNSIGNED NULL,           -- ID record yang terpengaruh
    old_values      JSON NULL,                      -- Nilai sebelum perubahan
    new_values      JSON NULL,                      -- Nilai setelah perubahan
    session_id      VARCHAR(255) NULL,              -- ID sesi pengguna
    request_id      VARCHAR(36),                    -- UUID untuk traceability
    created_at      TIMESTAMP                       -- Waktu kejadian
    -- TIDAK ADA updated_at dan deleted_at (immutable)
);
```

### Tabel `activity_log` (Spatie Activitylog)

Digunakan untuk mencatat perubahan model secara otomatis via trait `LogsActivity`.

```sql
-- Tabel standar Spatie Activitylog
-- Mencatat: log_name, description, subject_type, subject_id,
--           causer_type, causer_id, properties (JSON), event, batch_uuid
```

## Format Data

### Contoh Entri Login

```json
{
    "id": 1,
    "user_id": 5,
    "user_ip": "103.28.XX.XX",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "action": "login",
    "subject_type": "App\\Models\\User",
    "subject_id": 5,
    "old_values": null,
    "new_values": {
        "last_login_at": "2026-03-16 10:30:00",
        "last_login_ip": "103.28.XX.XX"
    },
    "session_id": "a1b2c3d4e5f6...",
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2026-03-16T10:30:00.000000Z"
}
```

### Contoh Entri Perubahan Status Pengaduan

```json
{
    "id": 42,
    "user_id": 3,
    "user_ip": "192.168.1.10",
    "user_agent": "Mozilla/5.0 ...",
    "action": "update",
    "subject_type": "App\\Models\\Complaint",
    "subject_id": 15,
    "old_values": {
        "status": "submitted",
        "assigned_to": null
    },
    "new_values": {
        "status": "assigned",
        "assigned_to": 7
    },
    "session_id": "f7g8h9i0...",
    "request_id": "660e8400-e29b-41d4-a716-446655440001",
    "created_at": "2026-03-16T14:15:00.000000Z"
}
```

## Kebijakan Retensi

| Jenis Log | Periode Retensi | Dasar Regulasi |
|-----------|----------------|----------------|
| Log akses (HTTP requests) | 1 tahun | PP 71/2019, BSSN 4/2021 |
| Log autentikasi (login/logout) | 1 tahun | BSSN 4/2021 |
| Log modifikasi data (CRUD) | 5 tahun | Standar audit pemerintah |
| Log pengaduan (status changes) | 5 tahun | SK KMA 026/2012 |

Pembersihan otomatis via scheduled command:

```php
// routes/console.php
Schedule::command('activitylog:clean')->daily();
// Spatie Activitylog: hapus record > 365 hari (dikonfigurasi di config/activitylog.php)
```

## Immutability (Kenirsangkalan)

Audit log bersifat **immutable** (tidak dapat diubah atau dihapus). Ini dijamin oleh:

1. **Model-level protection** (`app/Models/AuditLog.php`):
   ```php
   static::updating(function () {
       throw new \RuntimeException('Audit log bersifat immutable dan tidak boleh diubah (SPBE).');
   });

   static::deleting(function () {
       throw new \RuntimeException('Audit log tidak boleh dihapus (SPBE).');
   });
   ```

2. **Tidak ada `updated_at`**: Kolom `UPDATED_AT` diset `null` sehingga tidak ada timestamp perubahan.

3. **Tidak ada SoftDeletes**: Model `AuditLog` tidak menggunakan trait `SoftDeletes`.

4. **Tidak ada endpoint update/delete**: Tidak ada route atau controller yang memungkinkan modifikasi audit log.

## Query untuk Auditor

### Melihat aktivitas pengguna tertentu

```sql
SELECT * FROM audit_logs
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 100;
```

### Melihat semua perubahan pada pengaduan tertentu

```sql
SELECT * FROM audit_logs
WHERE subject_type = 'App\\Models\\Complaint'
  AND subject_id = ?
ORDER BY created_at ASC;
```

### Melihat login gagal dalam periode tertentu

```sql
SELECT * FROM audit_logs
WHERE action = 'login_failed'
  AND created_at BETWEEN ? AND ?
ORDER BY created_at DESC;
```

### Melihat semua aksi dalam satu sesi

```sql
SELECT * FROM audit_logs
WHERE session_id = ?
ORDER BY created_at ASC;
```

### Menelusuri aksi berdasarkan request ID

```sql
SELECT * FROM audit_logs
WHERE request_id = ?;
```

### Laporan aktivitas per hari

```sql
SELECT DATE(created_at) as tanggal,
       action,
       COUNT(*) as jumlah
FROM audit_logs
WHERE created_at BETWEEN ? AND ?
GROUP BY DATE(created_at), action
ORDER BY tanggal DESC, jumlah DESC;
```

### Aktivitas model via Spatie Activitylog

```sql
SELECT log_name, description, event,
       causer_type, causer_id,
       subject_type, subject_id,
       properties,
       created_at
FROM activity_log
WHERE subject_type = 'App\\Models\\Complaint'
  AND subject_id = ?
ORDER BY created_at ASC;
```
