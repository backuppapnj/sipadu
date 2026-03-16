# Panduan Deployment — SIPADU

**Sistem Informasi Pengaduan Layanan — Pengadilan Agama Penajam**
**Versi:** 1.0 | **Tanggal:** 2026-03-16

---

## Daftar Isi

1. [Persyaratan Server](#1-persyaratan-server)
2. [Hosting Data Center Indonesia (SPBE)](#2-hosting-data-center-indonesia-spbe)
3. [Setup Environment](#3-setup-environment)
4. [Konfigurasi Nginx](#4-konfigurasi-nginx)
5. [Queue Worker & Scheduled Tasks](#5-queue-worker--scheduled-tasks)
6. [SSL/TLS](#6-ssltls)
7. [Strategi Backup](#7-strategi-backup)
8. [Monitoring](#8-monitoring)
9. [Checklist Post-Deployment](#9-checklist-post-deployment)

---

## 1. Persyaratan Server

### Minimum Hardware

| Komponen | Spesifikasi Minimum |
|----------|-------------------|
| CPU | 2 vCPU |
| RAM | 4 GB |
| Storage | 40 GB SSD |
| Bandwidth | 1 Mbps unmetered |

### Software Requirements

| Software | Versi | Catatan |
|----------|-------|---------|
| PHP | 8.3+ | Wajib |
| MySQL | 8.0+ | Charset utf8mb4 |
| Node.js | 20+ | Untuk build frontend |
| npm | 10+ | Package manager frontend |
| Composer | 2.x | Package manager PHP |
| Nginx | 1.24+ | Atau Apache 2.4+ |
| Supervisor | 4.x | Untuk queue worker |
| Redis | 7.x | Opsional — untuk scaling queue |
| ClamAV | 1.x | Opsional — malware scanning |
| Git | 2.x | Untuk deployment |

### PHP Extensions (Wajib)

```
bcmath, ctype, curl, dom, fileinfo, gd, json, mbstring,
openssl, pdo, pdo_mysql, tokenizer, xml, zip
```

Verifikasi:

```bash
php -m | grep -E "bcmath|ctype|curl|dom|fileinfo|gd|json|mbstring|openssl|pdo|pdo_mysql|tokenizer|xml|zip"
```

---

## 2. Hosting Data Center Indonesia (SPBE)

Sesuai **PP 71/2019**, Penyelenggara Sistem Elektronik (PSE) Publik **WAJIB** menempatkan data center di wilayah Indonesia.

### Rekomendasi Provider

| Provider | Keunggulan | Lokasi DC |
|----------|-----------|-----------|
| **Biznet Gio Cloud** | SNI 27001 certified, uptime SLA 99.9% | Jakarta, Surabaya |
| **IDCloudHost** | Provider lokal, harga kompetitif | Jakarta, Surabaya |
| **Telkom Sigma** | Government-grade, digunakan banyak kementerian | Jakarta, Surabaya, Batam |
| **CBN Cloud** | Tier III data center | Jakarta |
| **Pusat Data Nasional (PDN)** | Gratis untuk instansi pemerintah (jika tersedia) | Cikarang, Batam, IKN |

### Catatan Penting

- PA Penajam berada di zona IKN — pertimbangkan PDN IKN jika sudah operasional
- Pastikan provider memiliki sertifikasi ISO 27001 atau SNI 27001
- Minimal Tier II data center untuk availability

---

## 3. Setup Environment

### 3.1 Persiapan Database

```sql
CREATE DATABASE sipadu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sipadu_user'@'localhost' IDENTIFIED BY 'PASSWORD_KUAT_DISINI';
GRANT ALL PRIVILEGES ON sipadu.* TO 'sipadu_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3.2 Clone & Install

```bash
# Clone repository
cd /var/www
git clone <repository-url> sipadu
cd sipadu

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies & build
npm ci
npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/sipadu
sudo chmod -R 755 /var/www/sipadu
sudo chmod -R 775 /var/www/sipadu/storage
sudo chmod -R 775 /var/www/sipadu/bootstrap/cache
```

### 3.3 Konfigurasi Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` untuk production:

```env
APP_NAME=SIPADU
APP_ENV=production
APP_DEBUG=false
APP_URL=https://sipadu.pa-penajam.go.id
APP_TIMEZONE=Asia/Jakarta

APP_LOCALE=id
APP_FALLBACK_LOCALE=id
APP_FAKER_LOCALE=id_ID

BCRYPT_ROUNDS=12

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sipadu
DB_USERNAME=sipadu_user
DB_PASSWORD=PASSWORD_KUAT_DISINI
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true

QUEUE_CONNECTION=database

CACHE_STORE=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=sipadu@pa-penajam.go.id
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=sipadu@pa-penajam.go.id
MAIL_FROM_NAME="SIPADU PA Penajam"

# Fonnte WhatsApp (opsional)
FONNTE_API_KEY=
FONNTE_SENDER=
```

### 3.4 Setup Aplikasi

```bash
# Jalankan migrasi database
php artisan migrate --force

# Jalankan seeder (role, permission, kategori, data awal)
php artisan db:seed --force

# Buat symbolic link storage
php artisan storage:link

# Cache konfigurasi untuk performa
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## 4. Konfigurasi Nginx

### Server Block

```nginx
server {
    listen 80;
    server_name sipadu.pa-penajam.go.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sipadu.pa-penajam.go.id;
    root /var/www/sipadu/public;

    index index.php;

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/sipadu.pa-penajam.go.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sipadu.pa-penajam.go.id/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers (BSSN 4/2021)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # File upload limit (10MB)
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Static asset caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Laravel
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    # Deny .env dan hidden files
    location ~ /\.(?!well-known) {
        deny all;
    }

    # Deny akses langsung ke storage
    location /storage {
        deny all;
    }

    access_log /var/log/nginx/sipadu-access.log;
    error_log /var/log/nginx/sipadu-error.log;
}
```

```bash
# Enable site & reload
sudo ln -s /etc/nginx/sites-available/sipadu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Queue Worker & Scheduled Tasks

### 5.1 Supervisor untuk Queue Worker

Buat file `/etc/supervisor/conf.d/sipadu-worker.conf`:

```ini
[program:sipadu-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/sipadu/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/sipadu/worker.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
stopwaitsecs=3600
```

```bash
sudo mkdir -p /var/log/sipadu
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start sipadu-worker:*
```

### 5.2 Cron untuk Scheduled Tasks

Tambahkan ke crontab `www-data`:

```bash
sudo crontab -u www-data -e
```

```cron
* * * * * cd /var/www/sipadu && php artisan schedule:run >> /dev/null 2>&1
```

Scheduled tasks yang terdaftar di `routes/console.php`:
- `sipadu:check-sla` — harian pukul 08:00 WIB (periksa tenggat SLA)
- `activitylog:clean` — harian (pembersihan activity log lama)

### 5.3 Log Rotation

Buat `/etc/logrotate.d/sipadu`:

```
/var/www/sipadu/storage/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}

/var/log/sipadu/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
}
```

---

## 6. SSL/TLS

### Let's Encrypt dengan Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Dapatkan sertifikat
sudo certbot --nginx -d sipadu.pa-penajam.go.id

# Auto-renewal (sudah otomatis via systemd timer)
sudo certbot renew --dry-run
```

### Persyaratan Minimum

- **TLS 1.2** minimum (TLS 1.0 dan 1.1 dinonaktifkan)
- **TLS 1.3** direkomendasikan
- HSTS header aktif dengan `max-age=31536000`

---

## 7. Strategi Backup

### 7.1 Backup Harian Otomatis

Buat script `/usr/local/bin/sipadu-backup.sh`:

```bash
#!/bin/bash
# Script backup harian SIPADU

BACKUP_DIR="/var/backups/sipadu"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="sipadu"
DB_USER="sipadu_user"
DB_PASS="PASSWORD_DISINI"
APP_DIR="/var/www/sipadu"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Backup database
mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" --single-transaction --routines --triggers | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"

# Backup file storage (lampiran terenkripsi)
tar -czf "$BACKUP_DIR/storage_${DATE}.tar.gz" -C "$APP_DIR" storage/app

# Backup .env
cp "$APP_DIR/.env" "$BACKUP_DIR/env_${DATE}.bak"

# Hapus backup yang lebih dari retention period
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup selesai: db_${DATE}.sql.gz, storage_${DATE}.tar.gz"
```

```bash
chmod +x /usr/local/bin/sipadu-backup.sh

# Jadwalkan backup harian pukul 02:00 WIB
echo "0 2 * * * /usr/local/bin/sipadu-backup.sh >> /var/log/sipadu/backup.log 2>&1" | sudo crontab -u root -
```

### 7.2 Kebijakan Retensi

| Jenis Backup | Retensi | Frekuensi |
|-------------|---------|-----------|
| Database | 30 hari | Harian |
| File storage | 30 hari | Harian |
| Full backup | 1 tahun | Mingguan |

### 7.3 Prosedur Restore

```bash
# Restore database
gunzip < /var/backups/sipadu/db_YYYYMMDD_HHMMSS.sql.gz | mysql -u sipadu_user -p sipadu

# Restore storage
tar -xzf /var/backups/sipadu/storage_YYYYMMDD_HHMMSS.tar.gz -C /var/www/sipadu

# Restore .env
cp /var/backups/sipadu/env_YYYYMMDD_HHMMSS.bak /var/www/sipadu/.env

# Clear cache setelah restore
cd /var/www/sipadu
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 7.4 Offsite Backup

Untuk disaster recovery, kirim backup ke lokasi terpisah:

```bash
# Contoh: rsync ke server backup
rsync -avz /var/backups/sipadu/ backup-user@backup-server:/backups/sipadu/
```

---

## 8. Monitoring

### 8.1 Health Check

Laravel menyediakan endpoint health check bawaan:

```
GET /up
```

Response `200 OK` jika aplikasi berjalan normal.

### 8.2 Uptime Monitoring

Rekomendasi tool monitoring:

- **UptimeRobot** (gratis, 5 menit interval) — monitor `/up`
- **Hetrixtools** (gratis, server monitoring)
- **Nagios/Zabbix** (self-hosted, lebih lengkap)

### 8.3 Log Monitoring

```bash
# Cek error terakhir di log Laravel
tail -50 /var/www/sipadu/storage/logs/laravel.log

# Cek status queue worker
sudo supervisorctl status sipadu-worker:*

# Cek status scheduled tasks
cd /var/www/sipadu && php artisan schedule:list
```

### 8.4 Database Monitoring

```sql
-- Cek ukuran database
SELECT table_schema AS 'Database',
       ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'sipadu'
GROUP BY table_schema;

-- Cek jumlah audit log
SELECT COUNT(*) FROM audit_logs;
SELECT COUNT(*) FROM activity_log;
```

---

## 9. Checklist Post-Deployment

### Keamanan (Wajib)

- [ ] Ganti password admin default
- [ ] Set `APP_DEBUG=false`
- [ ] Set `APP_ENV=production`
- [ ] Verifikasi HTTPS berjalan (redirect HTTP → HTTPS)
- [ ] Verifikasi `SESSION_SECURE_COOKIE=true`
- [ ] Verifikasi security headers (gunakan securityheaders.com)
- [ ] Hapus route debug/test jika ada

### Performa

- [ ] Jalankan `php artisan config:cache`
- [ ] Jalankan `php artisan route:cache`
- [ ] Jalankan `php artisan view:cache`
- [ ] Jalankan `php artisan event:cache`
- [ ] Verifikasi `npm run build` sudah dijalankan

### Infrastruktur

- [ ] Verifikasi queue worker berjalan (`supervisorctl status`)
- [ ] Verifikasi scheduled tasks berjalan (cron)
- [ ] Verifikasi backup harian terjadwal
- [ ] Verifikasi log rotation aktif

### Fungsional

- [ ] Test kirim pengaduan publik
- [ ] Test cek status pengaduan
- [ ] Test login semua role (admin, panitera, petugas, masyarakat)
- [ ] Test upload file lampiran
- [ ] Test pengiriman email notifikasi
- [ ] Test pengiriman WhatsApp (jika dikonfigurasi)
- [ ] Verifikasi audit log tercatat

### Dokumentasi

- [ ] Catat IP server, akses SSH
- [ ] Simpan credential backup di lokasi aman
- [ ] Informasikan tim tentang prosedur maintenance
- [ ] Jadwalkan review keamanan berkala (3 bulan)

---

## Catatan Penting

1. **Jangan pernah** menjalankan `php artisan migrate:fresh` di production — ini menghapus semua data
2. Untuk update aplikasi, gunakan:
   ```bash
   cd /var/www/sipadu
   git pull origin main
   composer install --no-dev --optimize-autoloader
   npm ci && npm run build
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   sudo supervisorctl restart sipadu-worker:*
   ```
3. Selalu backup database **sebelum** menjalankan migrasi baru
4. Monitor disk space secara berkala — file lampiran terenkripsi memakan lebih banyak ruang
