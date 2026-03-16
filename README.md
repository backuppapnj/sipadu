# SIPADU — Sistem Informasi Pengaduan Layanan

**Pengadilan Agama Penajam** — Kab. Penajam Paser Utara, Kalimantan Timur

---

## Deskripsi

SIPADU adalah sistem informasi pengaduan layanan berbasis web untuk Pengadilan Agama Penajam. Sistem ini memungkinkan masyarakat mengajukan pengaduan terkait layanan pengadilan, melacak status pengaduan, dan menerima respons secara transparan. Dibangun sesuai standar SPBE (Perpres 95/2018), keamanan BSSN, dan standar pelayanan peradilan (SK KMA 026/2012).

## Tech Stack

| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Backend | Laravel | 12 |
| Frontend | React (TypeScript) via Inertia.js | React 19, Inertia v2 |
| Styling | Tailwind CSS | 4.x |
| Database | MySQL | 8.0+ |
| Auth | Laravel Sanctum (session-based) | - |
| Authorization | Spatie Laravel Permission | v6 |
| Audit Trail | Spatie Activitylog | v4 |
| Queue | Database driver (upgradeable ke Redis) | - |
| Runtime | PHP | 8.3+ |
| Node.js | Node.js | 20+ |

## Prasyarat

- PHP 8.3+
- MySQL 8.0+
- Node.js 20+
- Composer 2.x
- npm atau pnpm

## Instalasi

```bash
# 1. Clone repository
git clone <repository-url> sipadu
cd sipadu

# 2. Install PHP dependencies
composer install

# 3. Install Node.js dependencies
npm install

# 4. Setup environment
cp .env.example .env
php artisan key:generate

# 5. Konfigurasi database di .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=sipadu
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Jalankan migrasi database
php artisan migrate

# 7. Jalankan seeder
php artisan db:seed

# 8. Buat symbolic link storage
php artisan storage:link
```

## Menjalankan Aplikasi

```bash
# Terminal 1: Laravel development server
php artisan serve

# Terminal 2: Vite dev server (frontend)
npm run dev

# Terminal 3: Queue worker (untuk notifikasi)
php artisan queue:work --tries=3
```

Aplikasi dapat diakses di: `http://localhost:8000`

## Variabel Environment

| Variabel | Deskripsi | Default |
|----------|-----------|---------|
| `APP_NAME` | Nama aplikasi | SIPADU |
| `APP_ENV` | Environment (local/staging/production) | local |
| `APP_DEBUG` | Mode debug | true |
| `APP_URL` | URL aplikasi | http://localhost:8000 |
| `DB_CONNECTION` | Driver database | mysql |
| `DB_HOST` | Host database | 127.0.0.1 |
| `DB_PORT` | Port database | 3306 |
| `DB_DATABASE` | Nama database | sipadu |
| `DB_USERNAME` | Username database | root |
| `DB_PASSWORD` | Password database | - |
| `QUEUE_CONNECTION` | Driver queue | database |
| `MAIL_MAILER` | Driver email | smtp |
| `MAIL_HOST` | SMTP host | - |
| `MAIL_PORT` | SMTP port | 587 |
| `MAIL_USERNAME` | SMTP username | - |
| `MAIL_PASSWORD` | SMTP password | - |
| `FONNTE_TOKEN` | Token API Fonnte (WhatsApp) | - |
| `SESSION_DRIVER` | Driver session | database |
| `SANCTUM_STATEFUL_DOMAINS` | Domain stateful Sanctum | localhost |

## Queue Worker

Untuk memproses notifikasi email dan WhatsApp secara asinkron:

```bash
# Development
php artisan queue:work --tries=3

# Production (gunakan Supervisor)
# /etc/supervisor/conf.d/sipadu-worker.conf
[program:sipadu-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/sipadu/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/sipadu/storage/logs/worker.log
```

## Matriks Peran (Role Matrix)

| Fitur | Admin | Panitera | Petugas | Masyarakat | Guest |
|-------|:-----:|:--------:|:-------:|:----------:|:-----:|
| Landing page | v | v | v | v | v |
| Submit pengaduan (publik) | v | v | v | v | v |
| Cek status pengaduan | v | v | v | v | v |
| Dashboard sendiri | v | v | v | v | - |
| Lihat semua pengaduan | v | v | - | - | - |
| Verifikasi pengaduan | v | v | - | - | - |
| Assign pengaduan | v | v | - | - | - |
| Respond pengaduan | v | v | v | - | - |
| Resolve pengaduan | v | v | v | - | - |
| Manajemen pengguna | v | - | - | - | - |
| Manajemen kategori | v | - | - | - | - |
| Pengaturan sistem | v | - | - | - | - |
| Audit log viewer | v | - | - | - | - |
| Laporan & export | v | v | - | - | - |

## Kredensial Development

| Peran | Email | Password |
|-------|-------|----------|
| Admin | admin@pa-penajam.go.id | Password123! |
| Panitera | ahmad.fauzi@pa-penajam.go.id | Password123! |
| Petugas 1 | siti.aminah@pa-penajam.go.id | Password123! |
| Petugas 2 | budi.santoso@pa-penajam.go.id | Password123! |
| Masyarakat | rahmat.hidayat@gmail.com | Password123! |

> **PENTING**: Ubah semua password default sebelum deployment ke production!

## Menjalankan Test

```bash
# Semua test
php artisan test

# Test spesifik
php artisan test --filter=ComplaintLifecycleTest
php artisan test --filter=AuthenticationTest
php artisan test --filter=SlaCalculationTest

# Dengan coverage
php artisan test --coverage

# Dengan output verbose
php artisan test --verbose
```

## Struktur Direktori

```
app/
├── Actions/           # Action classes (SRP)
├── Channels/          # Notification channels (WhatsApp)
├── Console/           # Artisan commands
├── Enums/             # PHP enums (Status, Priority, etc.)
├── Http/
│   ├── Controllers/   # Thin controllers
│   ├── Middleware/     # Audit, lockout, Inertia
│   └── Requests/      # Form request validation
├── Models/            # Eloquent models
├── Notifications/     # Email & WhatsApp notifications
└── Services/          # Business logic services

database/
├── factories/         # Model factories
├── migrations/        # Database migrations
└── seeders/           # Database seeders

docs/                  # Project documentation
resources/js/          # React frontend (TypeScript)
tests/Feature/         # Feature tests (Pest)
```

## Dokumentasi

- [Kepatuhan SPBE](docs/SPBE-COMPLIANCE.md)
- [Audit Trail](docs/AUDIT-TRAIL.md)
- [Manual Pengguna](docs/USER-MANUAL-ID.md)
- [Checklist Keamanan](docs/SECURITY-CHECKLIST.md)
- [Dokumentasi API](docs/API.md)

## Lisensi

Hak cipta (c) 2026 Pengadilan Agama Penajam. Seluruh hak dilindungi.
