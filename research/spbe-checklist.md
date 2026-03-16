# SPBE Compliance Checklist — SIPADU
## Mapping Perpres 95/2018 & Related Regulations to Implementation Tasks

**Date:** 2026-03-16
**Version:** 1.0

---

## How to Read This Checklist

- **ID**: Unique identifier for tracking
- **Requirement**: What must be implemented
- **Source**: Regulation reference
- **Priority**: MUST / SHOULD / MAY
- **Implementation Task**: Specific code/config to create
- **Status**: PENDING (to be implemented in Phase 2)

---

## 1. Arsitektur SPBE (Perpres 95/2018, Domain 1-4)

| ID | Requirement | Source | Priority | Implementation Task |
|----|------------|--------|----------|-------------------|
| A01 | Documented business process flow | Perpres 95/2018 Art.7 | MUST | Create complaint flow diagram in docs/SPBE-COMPLIANCE.md |
| A02 | Standardized data structure | Perpres 95/2018 Art.9 | MUST | Database migrations with data classification comments |
| A03 | Application architecture documented | Permen PANRB 59/2020 | MUST | Architecture diagram in docs/SPBE-COMPLIANCE.md |
| A04 | Development roadmap exists | Permen PANRB 59/2020 | MUST | Include roadmap section in project documentation |
| A05 | Interoperability-ready API | Perpres 95/2018 Art.14 | SHOULD | REST endpoints with standardized response format |
| A06 | SP4N-LAPOR! compatibility | PermenPAN-RB 62/2018 | SHOULD | sp4n_reference field, export capability |

## 2. Keamanan SPBE — Autentikasi & Akses (BSSN 4/2021)

| ID | Requirement | Source | Priority | Implementation Task |
|----|------------|--------|----------|-------------------|
| S01 | Strong password hashing (bcrypt/Argon2) | BSSN 4/2021 | MUST | Laravel default bcrypt in User model |
| S02 | Password complexity policy | BSSN 4/2021 | MUST | Min 8 chars, uppercase, number, symbol — custom validation rule |
| S03 | Password expiry reminder (90 days) | SNI 27001 | SHOULD | `password_changed_at` field, middleware check |
| S04 | Account lockout after 5 failed attempts | BSSN 4/2021 | MUST | `failed_login_count`, `locked_until` fields + middleware |
| S05 | Login attempt logging (success + failure) | BSSN 4/2021 | MUST | AuditService::logLoginAttempt() |
| S06 | Logout logging | BSSN 4/2021 | MUST | AuditService::logLogout() |
| S07 | Session management (timeout, secure cookies) | BSSN 4/2021 | MUST | config/session.php: HttpOnly, Secure, SameSite |
| S08 | Role-Based Access Control (RBAC) | Perpres 95/2018 | MUST | Spatie Permission: 4 roles, granular permissions |
| S09 | Segregation of duties | SNI 27001 | SHOULD | Separate admin/panitera/petugas roles |
| S10 | SSO preparation hooks | Perpres 95/2018 | SHOULD | Socialite-compatible auth structure |

## 3. Keamanan SPBE — Data Protection (BSSN 4/2021, UU PDP 27/2022)

| ID | Requirement | Source | Priority | Implementation Task |
|----|------------|--------|----------|-------------------|
| D01 | HTTPS/TLS for all traffic | BSSN 4/2021 | MUST | Force HTTPS in production (APP_URL, middleware) |
| D02 | Encrypt sensitive data at rest (NIK) | UU PDP 27/2022 | MUST | Laravel Crypt::encrypt() for NIK fields |
| D03 | Data classification labels | Perpres 95/2018 | MUST | `data_classification` enum on complaints table |
| D04 | Classification-based access filtering | Perpres 95/2018 | MUST | Policy: confidential data hidden from lower roles |
| D05 | File upload MIME validation | BSSN 4/2021 | MUST | Server-side mimetypes validation in FormRequest |
| D06 | File size limit (10MB) | BSSN 4/2021 | MUST | max:10240 validation rule |
| D07 | File SHA-256 checksum | Perpres 95/2018 | MUST | hash('sha256', $content) stored per attachment |
| D08 | File encryption at rest | BSSN 4/2021 | MUST | Crypt::encrypt() before Storage::put() |
| D09 | Malware scanning | BSSN 4/2021 | SHOULD | ClamAV integration in production |
| D10 | Input validation (prevent SQLi, XSS) | BSSN 4/2021 | MUST | FormRequest validation, Eloquent ORM, React escaping |
| D11 | Error messages don't expose internals | BSSN 4/2021 | MUST | APP_DEBUG=false in production, custom error pages |
| D12 | Soft deletes (no permanent deletion) | Perpres 95/2018 | MUST | SoftDeletes trait on all major models |
| D13 | CSRF protection | BSSN 4/2021 | MUST | Auto via Inertia + Sanctum session |
| D14 | Security headers | BSSN 4/2021 | MUST | CSP, X-Frame-Options, X-Content-Type-Options |

## 4. Audit Trail (Perpres 95/2018, BSSN 4/2021)

| ID | Requirement | Source | Priority | Implementation Task |
|----|------------|--------|----------|-------------------|
| L01 | Log every CRUD action | Perpres 95/2018 | MUST | AuditMiddleware + AuditService on all controllers |
| L02 | Log user identity (who) | Perpres 95/2018 | MUST | audit_logs.user_id field |
| L03 | Log timestamp (when) | Perpres 95/2018 | MUST | audit_logs.created_at (Asia/Jakarta) |
| L04 | Log IP address (where from) | BSSN 4/2021 | MUST | audit_logs.user_ip field |
| L05 | Log user agent | BSSN 4/2021 | SHOULD | audit_logs.user_agent field |
| L06 | Log before/after values | BSSN 4/2021 | MUST | audit_logs.old_values, new_values JSON |
| L07 | Log subject (what was affected) | Perpres 95/2018 | MUST | audit_logs.subject_type, subject_id |
| L08 | Request traceability (request_id) | BSSN 4/2021 | MUST | UUID request_id header on responses |
| L09 | Session tracking | BSSN 4/2021 | MUST | audit_logs.session_id field |
| L10 | Logs are immutable | Perpres 95/2018 | MUST | No update/delete on audit_logs, no SoftDeletes |
| L11 | Log retention ≥ 1 year (access logs) | PP 71/2019 | MUST | Cleanup command with 365-day retention |
| L12 | Log retention ≥ 5 years (data changes) | Audit standard | SHOULD | Configurable per log type |
| L13 | Spatie Activitylog for model changes | Best practice | MUST | LogsActivity trait on Complaint, User models |
| L14 | Login/logout events logged | BSSN 4/2021 | MUST | Auth event listeners → audit_logs |

## 5. Ketersediaan & Infrastruktur (PP 71/2019)

| ID | Requirement | Source | Priority | Implementation Task |
|----|------------|--------|----------|-------------------|
| I01 | Host in Indonesian data center | PP 71/2019 | MUST | Deployment guide: recommend ID hosting providers |
| I02 | Disaster recovery plan | PP 71/2019 | MUST | Document backup/restore procedures |
| I03 | Daily automated backup | SNI 27001 | MUST | Scheduled backup command + documentation |
| I04 | Environment separation (dev/staging/prod) | SNI 27001 | SHOULD | .env.example with environment configs |
| I05 | No hardcoded credentials | BSSN 4/2021 | MUST | All secrets via .env, no committed secrets |
| I06 | Timestamps in WIB (Asia/Jakarta) | Local requirement | MUST | config/app.php timezone = Asia/Jakarta |

## 6. Layanan & SLA (PermenPAN-RB 62/2018, SK KMA 026/2012)

| ID | Requirement | Source | Priority | Implementation Task |
|----|------------|--------|----------|-------------------|
| SL01 | Auto-acknowledge receipt | PermenPAN-RB 62/2018 | MUST | Email/WA notification on submit |
| SL02 | SLA deadline calculation (working days) | PermenPAN-RB 62/2018 | MUST | SlaService with holiday calendar |
| SL03 | SLA visual indicator | SK KMA 026/2012 | MUST | SlaIndicator React component |
| SL04 | SLA warning notifications (75%, 90%) | Best practice | MUST | Scheduled command: CheckSlaDeadlinesCommand |
| SL05 | Auto-escalation on SLA breach | PermenPAN-RB 62/2018 | MUST | Escalation logic in SLA check command |
| SL06 | Complaint tracking by ticket number | PERMA 9/2016 | MUST | Public /pengaduan/cek page |
| SL07 | Reporter identity protection | PERMA 9/2016 | MUST | is_anonymous flag, hide identity from public views |
| SL08 | Complaint statistics (aggregate) | SK KMA 026/2012 | MUST | Admin dashboard statistics, public summary |
| SL09 | Satisfaction survey post-resolution | PermenPAN-RB 14/2017 | SHOULD | Post-resolution feedback form |
| SL10 | Status timeline transparency | PERMA 9/2016 | MUST | ComplaintStatusTimeline component |

## 7. Aksesibilitas & Desain (Perpres 95/2018, UU 8/2016)

| ID | Requirement | Source | Priority | Implementation Task |
|----|------------|--------|----------|-------------------|
| W01 | WCAG 2.1 AA compliance | Perpres 95/2018 | MUST | Semantic HTML, alt text, keyboard nav, color contrast |
| W02 | Mobile-first responsive design | Perpres 95/2018 | MUST | Tailwind responsive utilities |
| W03 | Form labels in Bahasa Indonesia | UU 8/2016 | MUST | All UI text in Bahasa Indonesia |
| W04 | Error messages in Bahasa Indonesia | UU 8/2016 | MUST | Custom validation messages |
| W05 | Clean government portal design | Depkominfo 2003 | MUST | Professional, accessible visual design |

## 8. Dokumentasi & Kesiapan Audit (Permen PANRB 59/2020)

| ID | Requirement | Source | Priority | Implementation Task |
|----|------------|--------|----------|-------------------|
| DC01 | Architecture documentation | Permen PANRB 59/2020 | MUST | docs/SPBE-COMPLIANCE.md |
| DC02 | Audit trail documentation | BSSN 4/2021 | MUST | docs/AUDIT-TRAIL.md |
| DC03 | Security checklist | BSSN 4/2021 | MUST | docs/SECURITY-CHECKLIST.md |
| DC04 | User manual (Bahasa Indonesia) | SK KMA 026/2012 | MUST | docs/USER-MANUAL-ID.md |
| DC05 | Deployment guide | Best practice | MUST | docs/DEPLOYMENT-GUIDE.md |
| DC06 | API documentation | Best practice | MUST | docs/API.md |
| DC07 | SOP operasional | Permen PANRB 59/2020 | SHOULD | docs/SOP.md |
| DC08 | README with setup instructions | Best practice | MUST | README.md |

---

## Summary Statistics

| Priority | Count | Percentage |
|----------|-------|------------|
| MUST | 56 | 81% |
| SHOULD | 13 | 19% |
| MAY | 0 | 0% |
| **Total** | **69** | **100%** |

---

## Compliance Scoring Target

| Domain | Items | Target Score |
|--------|-------|-------------|
| Architecture (A) | 6 | 100% MUST compliance |
| Authentication & Access (S) | 10 | 100% MUST compliance |
| Data Protection (D) | 14 | 100% MUST compliance |
| Audit Trail (L) | 14 | 100% MUST compliance |
| Infrastructure (I) | 6 | 100% MUST compliance |
| Service & SLA (SL) | 10 | 100% MUST compliance |
| Accessibility (W) | 5 | 100% MUST compliance |
| Documentation (DC) | 8 | 100% MUST compliance |

**Target: All 56 MUST items = COMPLIANT before Phase 3 delivery.**
