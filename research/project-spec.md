# SIPADU — Project Specification
## Sistem Informasi Pengaduan Layanan — Pengadilan Agama Penajam

**Version:** 1.0
**Date:** 2026-03-16
**Status:** Awaiting Approval

---

## 1. Executive Summary

SIPADU adalah sistem informasi pengaduan layanan berbasis web untuk Pengadilan Agama Penajam (Kab. Penajam Paser Utara, Kalimantan Timur). Sistem ini memungkinkan masyarakat mengajukan pengaduan terkait layanan pengadilan, melacak status pengaduan, dan menerima respons secara transparan. Sistem dibangun dengan memperhatikan kepatuhan SPBE (Perpres 95/2018), standar keamanan BSSN, dan standar pelayanan peradilan (SK KMA 026/2012).

### Tech Stack
- **Backend:** Laravel 12 (PHP 8.3+)
- **Frontend:** React 19 (TypeScript) via Inertia.js v2
- **Styling:** Tailwind CSS
- **Database:** MySQL 8.0+ (charset utf8mb4)
- **Auth:** Laravel Sanctum (session-based)
- **Authorization:** Spatie Laravel Permission v6
- **Audit Trail:** Spatie Activitylog v4
- **Queue:** Database driver (upgradeable to Redis)

---

## 2. Domain Context

### 2.1 Institutional Structure
- **PA Penajam** = Pengadilan Agama Kelas II, di bawah PTA Samarinda
- Diresmikan ~2017 (sebelumnya cabang PA Tanah Grogot)
- Lokasi: Jl. Provinsi KM. 9, Kec. Penajam, Kab. PPU, Kaltim 76142
- Berada di zona IKN — potensi peningkatan caseload di masa depan

### 2.2 Key Roles (Mapped to System Roles)
| PA Role | System Role | Description |
|---------|-------------|-------------|
| Masyarakat/Pencari Keadilan | `masyarakat` | Submit & track own complaints |
| Petugas PTSP | `petugas_layanan` | Handle assigned complaints |
| Panitera/Sekretaris | `panitera` | Oversee all complaints, escalate |
| Admin TI | `admin` | Full system access, user management |

### 2.3 Complaint Categories
| Code | Category | SLA Days |
|------|----------|----------|
| ADM | Pelayanan Administrasi Perkara | 14 |
| KET | Keterlambatan Penanganan Perkara | 14 |
| PEG | Perilaku Pegawai/Aparat Pengadilan | 60 |
| PTSP | Pelayanan PTSP | 14 |
| INFO | Pelayanan Informasi | 5 |
| FAS | Fasilitas dan Sarana Pengadilan | 14 |
| NIK | Administrasi Pernikahan/Perceraian | 14 |
| LAIN | Lainnya | 14 |

### 2.4 Regulatory Framework
| Regulation | Relevance |
|-----------|-----------|
| SK KMA 026/2012 | Court service standards, complaint mechanism mandate |
| PERMA 9/2016 | Complaint handling, reporter identity protection |
| Perpres 95/2018 | SPBE architecture, security, audit trail |
| PermenPAN-RB 62/2018 | SP4N complaint management, 60-day max SLA |
| PP 71/2019 | Data residency — must host in Indonesia |
| BSSN 4/2021 | Web application security standards |
| UU PDP 27/2022 | Personal data protection (NIK encryption) |
| UU KIP 14/2008 | Public information openness |

---

## 3. Functional Specification

### 3.1 Public Features (No Login Required)

#### 3.1.1 Landing Page (`/`)
- PA Penajam branding and contact info
- Links to submit complaint and track status
- Public complaint statistics (aggregate only)
- Accessible design following WCAG 2.1 AA

#### 3.1.2 Submit Complaint (`/pengaduan/buat`)
- **No login required** — public form
- Fields:

| Field | Label | Required | Validation |
|-------|-------|----------|------------|
| nik | NIK | Yes | 16 digits, encrypted at rest |
| name | Nama Lengkap | Yes | max:255 |
| address | Alamat Lengkap | Yes | max:500 |
| phone | Nomor HP | Yes | Indonesian phone format |
| email | Email | No | valid email |
| category_id | Kategori Pengaduan | Yes | exists:complaint_categories |
| title | Judul Pengaduan | Yes | max:255 |
| incident_date | Tanggal Kejadian | Yes | date, before_or_equal:today |
| incident_location | Lokasi Kejadian | Yes | max:500 |
| description | Uraian Lengkap | Yes | min:50, max:5000 |
| reported_party | Pihak yang Dilaporkan | No | max:255 |
| attachments | Bukti Pendukung | No | max 5 files, each ≤10MB |
| is_anonymous | Laporan Anonim | No | boolean |
| is_confidential | Laporan Rahasia | No | boolean |

- On submit:
  1. Generate ticket number: `PA-PNJ-{YYYY}-{5-digit-seq}`
  2. Store complaint with status `submitted`
  3. Auto-set SLA deadline based on category
  4. Store encrypted NIK
  5. Store attachments (encrypted, checksummed)
  6. Send confirmation email/WhatsApp with ticket number
  7. Log creation to audit_logs

#### 3.1.3 Track Complaint (`/pengaduan/cek`)
- Input: ticket number
- Shows: status timeline, current status, SLA indicator
- Does NOT show reporter identity or confidential content

### 3.2 Authenticated Features

#### 3.2.1 Masyarakat Dashboard (`/dashboard`)
- List of own complaints with status
- Complaint detail with full timeline
- Submit new complaint (pre-filled from profile)
- Satisfaction survey after resolution

#### 3.2.2 Petugas Dashboard (`/petugas/dashboard`)
- Assigned complaints list with SLA indicators
- Respond to assigned complaints
- Update complaint status
- View complaint history/timeline

#### 3.2.3 Panitera Dashboard (`/panitera/dashboard`)
- All complaints overview
- Assign complaints to petugas
- Escalation management
- SLA breach alerts
- Disposisi (forward complaint between units)

#### 3.2.4 Admin Dashboard (`/admin/dashboard`)
- Full statistics: total, by category, by status, SLA compliance %
- All complaints management
- User management (CRUD petugas, panitera accounts)
- Complaint category management
- System settings (SLA days, notification templates)
- Audit log viewer
- Reports export (PDF, Excel)
- Holiday calendar management (for SLA calculation)

### 3.3 Complaint Status Flow

```
[submitted] → [verified] → [assigned] → [in_progress] → [responded] → [resolved]
                  ↓                                           ↓
              [rejected]                                 [reopened] → [in_progress]
```

| Status | Description | Who Can Set |
|--------|-------------|-------------|
| submitted | Pengaduan baru dikirim | System (auto) |
| verified | Admin memverifikasi kelengkapan | admin, panitera |
| rejected | Pengaduan tidak valid/duplikat | admin, panitera |
| assigned | Ditugaskan ke petugas | admin, panitera |
| in_progress | Petugas sedang menangani | petugas_layanan |
| responded | Jawaban telah diberikan | petugas_layanan |
| resolved | Pengaduan selesai ditangani | admin, panitera |
| reopened | Pelapor membuka kembali | system (via feedback) |

### 3.4 SLA Management
- Each category has `sla_days` (working days)
- SLA deadline calculated from `submitted` date, excluding weekends and holidays
- Notifications at 75% and 90% of SLA
- Visual indicators: green (on track), yellow (>75%), red (overdue)
- Auto-escalation: notify panitera at SLA breach, notify Ketua at 2x SLA

### 3.5 Notification System
| Event | Recipient | Channel |
|-------|-----------|---------|
| Complaint submitted | Complainant | Email, WhatsApp |
| Status changed | Complainant | Email, WhatsApp |
| Complaint assigned | Petugas | Email |
| SLA warning (75%) | Assigned petugas | Email |
| SLA warning (90%) | Panitera | Email |
| SLA breach | Panitera + Admin | Email |
| New complaint | Admin/Panitera | Email |

---

## 4. Technical Specification

### 4.1 Database Schema

#### `users`
```
id                  BIGINT UNSIGNED PK AUTO_INCREMENT
nik                 TEXT (encrypted)           -- CONFIDENTIAL
name                VARCHAR(255)               -- INTERNAL
email               VARCHAR(255) UNIQUE        -- INTERNAL
email_verified_at   TIMESTAMP NULL
phone               VARCHAR(20) NULL           -- INTERNAL
address             TEXT NULL                  -- INTERNAL
password            VARCHAR(255)               -- CONFIDENTIAL
role                VARCHAR(50) DEFAULT 'masyarakat'
is_active           BOOLEAN DEFAULT true
last_login_at       TIMESTAMP NULL
last_login_ip       VARCHAR(45) NULL
failed_login_count  INT DEFAULT 0
locked_until        TIMESTAMP NULL
remember_token      VARCHAR(100) NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP NULL             -- Soft delete (SPBE)
```

#### `complaints`
```
id                  BIGINT UNSIGNED PK AUTO_INCREMENT
ticket_no           VARCHAR(20) UNIQUE         -- PUBLIC
user_id             BIGINT UNSIGNED NULL FK    -- NULL for anonymous
category_id         BIGINT UNSIGNED FK
title               VARCHAR(255)               -- INTERNAL
description         TEXT                       -- INTERNAL/CONFIDENTIAL
reported_party      VARCHAR(255) NULL          -- CONFIDENTIAL
incident_date       DATE
incident_location   VARCHAR(500) NULL
status              VARCHAR(20) DEFAULT 'submitted'
priority            VARCHAR(10) DEFAULT 'normal'  -- low/normal/high/urgent
assigned_to         BIGINT UNSIGNED NULL FK(users)
sla_deadline        DATE
resolved_at         TIMESTAMP NULL
is_anonymous        BOOLEAN DEFAULT false
is_confidential     BOOLEAN DEFAULT false
data_classification VARCHAR(20) DEFAULT 'internal'  -- public/internal/confidential
complainant_name    VARCHAR(255)               -- For non-registered submissions
complainant_nik     TEXT (encrypted)           -- CONFIDENTIAL
complainant_phone   VARCHAR(20)
complainant_email   VARCHAR(255) NULL
complainant_address TEXT NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP
deleted_at          TIMESTAMP NULL             -- Soft delete (SPBE)
```

#### `complaint_categories`
```
id          BIGINT UNSIGNED PK AUTO_INCREMENT
name        VARCHAR(255)
code        VARCHAR(10) UNIQUE
sla_days    INT DEFAULT 14
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### `complaint_statuses` (status history/timeline)
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
complaint_id    BIGINT UNSIGNED FK
status          VARCHAR(20)
note            TEXT NULL
updated_by      BIGINT UNSIGNED FK(users)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `complaint_attachments`
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
complaint_id    BIGINT UNSIGNED FK
file_path       VARCHAR(500)
original_name   VARCHAR(255)
mime_type       VARCHAR(100)
file_size       INT UNSIGNED              -- bytes
checksum        VARCHAR(64)               -- SHA-256
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `complaint_dispositions`
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
complaint_id    BIGINT UNSIGNED FK
from_user       BIGINT UNSIGNED FK(users)
to_user         BIGINT UNSIGNED FK(users)
note            TEXT NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `notifications`
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
notifiable_type VARCHAR(255)
notifiable_id   BIGINT UNSIGNED
channel         VARCHAR(20)               -- email/sms/whatsapp
subject         VARCHAR(255)
message         TEXT
sent_at         TIMESTAMP NULL
read_at         TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### `audit_logs` (SPBE mandatory — separate from Spatie Activitylog)
```
id              BIGINT UNSIGNED PK AUTO_INCREMENT
user_id         BIGINT UNSIGNED NULL FK
user_ip         VARCHAR(45)
user_agent      VARCHAR(500)
action          VARCHAR(50)               -- create/read/update/delete/login/logout
subject_type    VARCHAR(255) NULL
subject_id      BIGINT UNSIGNED NULL
old_values      JSON NULL
new_values      JSON NULL
session_id      VARCHAR(255) NULL
request_id      VARCHAR(36)               -- UUID for traceability
created_at      TIMESTAMP
-- NO updated_at, NO deleted_at — logs are immutable (SPBE)
```

#### `system_settings`
```
key         VARCHAR(255) PK
value       TEXT
group       VARCHAR(50) DEFAULT 'general'
updated_by  BIGINT UNSIGNED NULL FK(users)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

#### `holidays` (for SLA calculation)
```
id          BIGINT UNSIGNED PK AUTO_INCREMENT
date        DATE UNIQUE
name        VARCHAR(255)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### 4.2 Architecture Pattern

```
app/
├── Actions/                    # Single-responsibility action classes
│   ├── Complaint/
│   │   ├── CreateComplaintAction.php
│   │   ├── AssignComplaintAction.php
│   │   ├── UpdateComplaintStatusAction.php
│   │   ├── EscalateComplaintAction.php
│   │   └── GenerateTicketNumberAction.php
│   ├── Attachment/
│   │   └── StoreAttachmentsAction.php
│   └── Auth/
│       └── RecordLoginAttemptAction.php
├── Http/
│   ├── Controllers/
│   │   ├── Public/
│   │   │   ├── ComplaintFormController.php
│   │   │   └── TrackComplaintController.php
│   │   ├── Masyarakat/
│   │   │   └── DashboardController.php
│   │   ├── Petugas/
│   │   │   └── DashboardController.php
│   │   ├── Panitera/
│   │   │   └── DashboardController.php
│   │   └── Admin/
│   │       ├── DashboardController.php
│   │       ├── UserController.php
│   │       ├── CategoryController.php
│   │       ├── SettingsController.php
│   │       └── AuditLogController.php
│   ├── Middleware/
│   │   ├── HandleInertiaRequests.php
│   │   ├── AuditMiddleware.php        # Log every request (SPBE)
│   │   └── CheckAccountLockout.php
│   └── Requests/
│       ├── StoreComplaintRequest.php
│       ├── AssignComplaintRequest.php
│       └── UpdateComplaintStatusRequest.php
├── Models/
│   ├── User.php                      # SoftDeletes, LogsActivity
│   ├── Complaint.php                 # SoftDeletes, LogsActivity
│   ├── ComplaintCategory.php
│   ├── ComplaintStatus.php
│   ├── ComplaintAttachment.php
│   ├── ComplaintDisposition.php
│   ├── AuditLog.php                  # No SoftDeletes (immutable)
│   ├── Holiday.php
│   └── SystemSetting.php
├── Notifications/
│   ├── ComplaintSubmittedNotification.php
│   ├── ComplaintStatusChangedNotification.php
│   ├── ComplaintAssignedNotification.php
│   └── SlaWarningNotification.php
├── Channels/
│   └── WhatsAppChannel.php           # Fonnte integration
├── Services/
│   ├── SlaService.php                # SLA calculation with holidays
│   ├── AuditService.php              # Write to audit_logs table
│   └── EncryptionService.php         # NIK encryption helper
├── Enums/
│   ├── ComplaintStatusEnum.php
│   ├── PriorityEnum.php
│   └── DataClassificationEnum.php
└── Console/
    └── Commands/
        └── CheckSlaDeadlinesCommand.php  # Scheduled: check & notify
```

### 4.3 Frontend Structure (React + Inertia)

```
resources/js/
├── app.tsx
├── types/
│   ├── index.d.ts                    # Shared TypeScript types
│   └── inertia.d.ts
├── Layouts/
│   ├── GuestLayout.tsx               # Public pages
│   ├── AuthenticatedLayout.tsx       # Dashboard pages
│   └── AdminLayout.tsx               # Admin pages
├── Pages/
│   ├── Welcome.tsx                   # Landing page
│   ├── Pengaduan/
│   │   ├── Buat.tsx                  # Public complaint form
│   │   └── Cek.tsx                   # Track by ticket number
│   ├── Dashboard/
│   │   └── Index.tsx                 # Masyarakat dashboard
│   ├── Petugas/
│   │   └── Dashboard.tsx
│   ├── Panitera/
│   │   └── Dashboard.tsx
│   └── Admin/
│       ├── Dashboard.tsx
│       ├── Users/
│       ├── Categories/
│       ├── Settings/
│       └── AuditLog/
├── Components/
│   ├── ComplaintStatusTimeline.tsx
│   ├── SlaIndicator.tsx
│   ├── DataTable.tsx
│   ├── FileUploadZone.tsx
│   ├── AuditLogViewer.tsx
│   ├── PrintableComplaintCard.tsx
│   ├── ComplaintCard.tsx
│   └── UI/                          # Reusable UI primitives
├── Hooks/
│   ├── usePermission.ts
│   └── useFlash.ts
└── Lib/
    └── utils.ts
```

### 4.4 Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth approach | Sanctum session-based | Inertia SPA uses cookies, not tokens |
| Action pattern | Action classes over services | SRP compliance, testable units |
| Queue driver | Database (start) | No Redis dependency for small court |
| File encryption | Laravel Crypt at rest | SPBE data confidentiality requirement |
| Ticket generation | lockForUpdate() atomic | Prevent race conditions |
| WhatsApp provider | Fonnte | Low cost, easy setup, popular in ID |
| Audit trail | Dual: Spatie Activitylog + custom audit_logs | Spatie for model changes, custom for SPBE compliance |
| Soft deletes | All major models | SPBE prohibits permanent deletion |
| Timezone | Asia/Jakarta (WIB, UTC+8) | Local requirement |
| NIK storage | Laravel Crypt::encrypt() | UU PDP 27/2022 compliance |

### 4.5 Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| HTTPS/TLS | Enforce in production (nginx/Apache config) |
| CSRF | Auto via Inertia + Sanctum session |
| XSS | React auto-escapes, CSP headers |
| SQL Injection | Eloquent ORM, no raw queries |
| File upload | MIME validation, size limit, ClamAV scan |
| Password policy | Min 8 chars, uppercase, number, symbol |
| Account lockout | 5 failed attempts → 30min lockout |
| Session security | HttpOnly, Secure, SameSite cookies |
| Audit immutability | audit_logs has no update/delete operations |
| Data classification | Badge on every record, access filtered by role |
| Request tracing | UUID `request_id` header on all responses |

### 4.6 SP4N-LAPOR! Integration Strategy

**Phase 1 (MVP):** Standalone system, manual sync
**Phase 2:** Export/import CSV for LAPOR! reconciliation
**Phase 3:** API integration (requires KemenPAN-RB coordination)

SIPADU stores a `sp4n_reference` field on complaints for manual cross-referencing.

---

## 5. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Response time | < 2s for page loads |
| Availability | 99.5% uptime |
| Concurrent users | Support 50 simultaneous users |
| Data retention | Minimum 5 years for complaints, 1 year for access logs |
| Backup | Daily automated backup, tested monthly |
| Browser support | Chrome 90+, Firefox 90+, Safari 14+, Edge 90+ |
| Mobile responsiveness | Full functionality on mobile devices |
| Accessibility | WCAG 2.1 AA compliance |
| Localization | Bahasa Indonesia throughout UI |
| Hosting | Indonesian data center (SPBE requirement) |

---

## 6. Test Coverage Requirements

| Area | Minimum Coverage |
|------|-----------------|
| Overall | 70% line coverage |
| Complaint lifecycle | 90% (critical path) |
| Auth & authorization | 90% (security-critical) |
| SLA calculation | 95% (business-critical) |
| File upload | 80% |
| Audit logging | 85% |

---

## 7. Deliverables

1. Full Laravel 12 application with all features
2. Database migrations with SPBE data classification comments
3. Seeders with realistic PA Penajam data
4. Feature tests covering complaint lifecycle, auth, SLA, audit
5. Documentation: README, SPBE compliance, audit trail, user manual, security checklist, API docs
6. Deployment guide for Indonesian data center hosting
