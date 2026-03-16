# Security Checklist — SIPADU

Checklist keamanan yang harus dipenuhi sebelum deployment ke production.

---

## Konfigurasi Aplikasi

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] HTTPS enforced (redirect HTTP ke HTTPS)
- [ ] `APP_KEY` di-generate dengan `php artisan key:generate` (key unik per environment)
- [ ] `APP_URL` menggunakan HTTPS

## Database

- [ ] Kredensial database menggunakan user terbatas (bukan root)
- [ ] Password database kuat dan unik
- [ ] Database tidak dapat diakses dari luar (bind ke localhost atau private network)
- [ ] Backup otomatis harian dikonfigurasi
- [ ] Restore backup sudah diuji

## Autentikasi & Sesi

- [ ] Password default admin sudah diubah
- [ ] Password policy aktif (min 8 karakter, huruf besar, angka, simbol)
- [ ] Account lockout aktif (5 percobaan gagal → 30 menit terkunci)
- [ ] `SESSION_DRIVER=database` (bukan file)
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `SESSION_HTTP_ONLY=true`
- [ ] `SESSION_SAME_SITE=lax`
- [ ] `SANCTUM_STATEFUL_DOMAINS` dikonfigurasi dengan benar untuk domain production

## Security Headers

- [ ] Content-Security-Policy (CSP) dikonfigurasi
- [ ] X-Frame-Options: DENY atau SAMEORIGIN
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS) aktif
- [ ] Referrer-Policy dikonfigurasi

## File Upload

- [ ] Validasi MIME type di server-side (bukan hanya ekstensi)
- [ ] Batas ukuran file 10MB di PHP dan web server
- [ ] File disimpan di luar web root (`storage/app/complaints/`)
- [ ] File attachment terenkripsi (Laravel Crypt)
- [ ] ClamAV terinstall dan dikonfigurasi (opsional tapi disarankan)

## Rate Limiting

- [ ] Rate limiting pada endpoint login (`/login`)
- [ ] Rate limiting pada endpoint registrasi (`/register`)
- [ ] Rate limiting pada endpoint submit pengaduan (`/pengaduan/buat`)

## CSRF & XSS

- [ ] CSRF protection aktif (otomatis via Inertia + Sanctum)
- [ ] Tidak ada raw HTML rendering tanpa sanitasi
- [ ] React auto-escaping tidak di-bypass

## Infrastruktur

- [ ] Server di-hosting di Indonesia (data residency — PP 71/2019)
- [ ] Web server (Nginx/Apache) dikonfigurasi sesuai best practice
- [ ] PHP `expose_php = Off`
- [ ] PHP `display_errors = Off`
- [ ] `php.ini`: `upload_max_filesize = 10M`, `post_max_size = 50M`
- [ ] File permission: `storage/` dan `bootstrap/cache/` writable (775)
- [ ] File permission: seluruh file PHP read-only (644)
- [ ] Firewall dikonfigurasi (hanya port 80, 443, 22)

## Notifikasi

- [ ] Fonnte token dikonfigurasi jika WhatsApp enabled
- [ ] SMTP kredensial dikonfigurasi untuk email
- [ ] Email pengirim menggunakan domain resmi (@pa-penajam.go.id)

## Proses Background

- [ ] Queue worker berjalan sebagai supervised process (Supervisor)
- [ ] Queue worker auto-restart setelah crash
- [ ] Scheduled commands dikonfigurasi di crontab:
  ```
  * * * * * cd /path/to/sipadu && php artisan schedule:run >> /dev/null 2>&1
  ```

## Monitoring & Logging

- [ ] Log rotation dikonfigurasi (`daily` channel, retain 14 hari)
- [ ] Error tracking aktif (Sentry/Bugsnag opsional)
- [ ] Audit log tidak bisa dimodifikasi (immutable)
- [ ] Retensi log akses: minimal 1 tahun
- [ ] Retensi log data: minimal 5 tahun

## Backup & Recovery

- [ ] Backup database harian otomatis
- [ ] Backup file storage (attachments) harian
- [ ] Backup disimpan di lokasi terpisah
- [ ] Prosedur restore sudah diuji dan terdokumentasi
- [ ] Disaster Recovery Plan tersedia

## Pre-Deployment Final Check

- [ ] `composer install --no-dev --optimize-autoloader`
- [ ] `php artisan config:cache`
- [ ] `php artisan route:cache`
- [ ] `php artisan view:cache`
- [ ] `npm run build` (production build frontend)
- [ ] Semua test lulus (`php artisan test`)
- [ ] Migrasi database sudah dijalankan (`php artisan migrate`)
- [ ] Storage link sudah dibuat (`php artisan storage:link`)
