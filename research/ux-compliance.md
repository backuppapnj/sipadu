# UX & Regulatory Compliance Research for SIPADU

> Sistem Informasi Pengaduan Layanan — Pengadilan Agama Penajam, East Kalimantan
> Research Date: 2026-03-16

---

## 1. PERMA (Peraturan Mahkamah Agung) — Public Complaints & Court Transparency

### 1.1 PERMA No. 9 Tahun 2016 — Pedoman Penanganan Pengaduan (Whistleblowing System)

The primary regulation governing complaint handling within the judiciary. Key provisions:

- **Scope**: Covers complaints about violations of the *Kode Etik dan Pedoman Perilaku Hakim* (KEPPH), as well as misconduct by *panitera*, *jurusita*, and court staff.
- **Reporter protection**: Guarantees confidentiality of reporter identity (*kerahasiaan identitas pelapor*).
- **Transparency**: Reporters can monitor/track the status of their submitted complaints.
- **Expanded definition**: Unlike prior regulations, reporters include both external public (*masyarakat*) and internal judiciary personnel.
- **Digital platform**: Implemented via **SIWAS** (Sistem Informasi Pengawasan) — currently version 3.0, accessible at siwas.mahkamahagung.go.id.

### 1.2 Court Transparency Framework

- **SK KMA No. 144/KMA/VIII/2007**: Established the foundation for *Keterbukaan Informasi di Pengadilan* (Information Openness in Courts) since 2007.
- **SK KMA No. 2-144/KMA/SK/VIII/2022**: Updated *Standar Pelayanan Informasi Publik di Pengadilan* (Public Information Service Standards in Courts).
- **Digital transparency tools**: SIPP (case management), e-Court, Info Perkara, JDIH (legal information).
- **PERMA No. 1/2019 & PERMA No. 7/2022**: E-Litigasi — electronic litigation for court transparency and public service improvement.

### 1.3 Implications for SIPADU

- Must provide complaint tracking with status visibility to the reporter.
- Must protect reporter identity (option for anonymous/confidential reporting).
- Should integrate or reference SIWAS for complaints that involve judicial misconduct.
- Must align with court transparency standards — publicly accessible complaint statistics and resolution rates.

---

## 2. PermenPAN-RB No. 14/2017 — Survei Kepuasan Masyarakat

### 2.1 Clarification

**Important**: PermenPAN-RB No. 14 Tahun 2017 is titled *"Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik"* — it governs **public satisfaction surveys**, not portal accessibility directly. It replaced PermenPAN-RB No. 16/2014.

### 2.2 Relevance to SIPADU

- After complaint resolution, SIPADU should incorporate a **satisfaction survey** (Survei Kepuasan Masyarakat / SKM) as mandated by this regulation.
- Survey components should measure service quality dimensions: timeliness, staff attitude, procedure clarity, facility adequacy.
- Results must be published periodically as part of accountability.

### 2.3 Actual Accessibility Standards

Indonesia does not yet have a dedicated PermenPAN-RB specifically for portal/website accessibility. Relevant accessibility guidance comes from:

- **WCAG 2.1** (Web Content Accessibility Guidelines) — international standard; Indonesia scored 69.75 on WCAG compliance assessments, below passing threshold.
- **Perpres No. 95/2018** (SPBE — Sistem Pemerintahan Berbasis Elektronik) — mandates digital government services to be accessible, transparent, and accountable.
- **UU No. 8/2016** (Penyandang Disabilitas) — requires government services to be accessible to persons with disabilities.

### 2.4 Minimum Accessibility Requirements for SIPADU

- Alt text on all images
- Keyboard navigability
- Screen reader compatibility
- Sufficient color contrast ratios (minimum 4.5:1 for normal text)
- Responsive/mobile-friendly design
- Text resizing support
- Form labels and error messages in Bahasa Indonesia

---

## 3. Indonesian Government Portal Design Standards

### 3.1 Regulatory Framework

| Regulation | Year | Subject |
|---|---|---|
| Inpres No. 3/2003 | 2003 | National e-Government Strategy |
| Kepmen Kominfo No. 57/2003 | 2003 | Panduan Penyusunan Rencana Induk e-Government |
| Depkominfo Guideline | 2003 | Panduan Penyelenggaraan Situs Web Pemda |
| Perpres No. 95/2018 | 2018 | SPBE (Sistem Pemerintahan Berbasis Elektronik) |
| Permenkominfo No. 8/2019 | 2019 | Penyelenggaraan Sistem Elektronik |

### 3.2 Mandatory Content (Depkominfo 2003 Guideline)

Government websites must include at minimum:

1. **Selayang Pandang** — institutional overview
2. **Pemerintahan** — organizational structure, leadership profiles
3. **Geografi** — geographic/jurisdictional information
4. **Peta dan Wilayah** — maps and territorial coverage
5. **Peraturan / Kebijakan** — relevant regulations and policies
6. **Buku Tamu / Pengaduan** — guestbook or complaint mechanism
7. **Berita / Pengumuman** — news and announcements
8. **Informasi Publik** — mandatory public information disclosure

### 3.3 Design Principles

- **Domain**: Must use `.go.id` domain
- **Navigation**: Main menu should display only essential items; submenus in easily searchable structure
- **Consistency**: Uniform color scheme, fonts, and layout across all pages
- **Modern & Clean**: Balance modernity (for younger users) with simplicity (for senior users)
- **Mobile-first**: Responsive layout that adapts to all screen sizes
- **Content freshness**: Regular updates with well-written, clear, concise content
- **CMS-based**: Use content management system for standardized content management

### 3.4 No Official UI/UX Standardization

Indonesia currently has **no official government-wide UI/UX design system** (unlike the US Web Design System or GOV.UK Design System). This means:

- SIPADU should follow general best practices and reference well-designed government sites (e.g., jabarprov.go.id)
- Adopt a style guide internally for consistency
- Follow WCAG 2.1 AA as the accessibility baseline

---

## 4. Required Fields for Formal Pengaduan Form

### 4.1 Field Specification

Based on SP4N-LAPOR!, SIWAS, and various court complaint forms:

| Field | Indonesian Label | Mandatory/Optional | Notes |
|---|---|---|---|
| NIK | Nomor Induk Kependudukan | **Mandatory** | 16-digit national ID; validate format |
| Full Name | Nama Lengkap | **Mandatory** | As per KTP |
| Address | Alamat Lengkap | **Mandatory** | Domicile address |
| Phone Number | Nomor Telepon/HP | **Mandatory** | For follow-up contact |
| Email | Alamat Email | Optional | For notification delivery |
| Complaint Category | Kategori Pengaduan | **Mandatory** | Dropdown selection (see 4.2) |
| Subject/Title | Judul Pengaduan | **Mandatory** | Brief summary |
| Incident Date | Tanggal Kejadian | **Mandatory** | Date picker |
| Incident Location | Lokasi Kejadian | **Mandatory** | Specific location within court jurisdiction |
| Detailed Description | Uraian Lengkap | **Mandatory** | Chronological narrative, min 50 chars |
| Reported Party | Pihak yang Dilaporkan | Optional | Name, position, unit |
| Evidence Upload | Bukti Pendukung | Optional (recommended) | Photos, documents, screenshots; max 10MB per file |
| Witness Info | Informasi Saksi | Optional | Name and contact of witnesses |
| Anonymous Flag | Laporan Anonim | Optional | Toggle; if enabled, NIK/name hidden from reported party |
| Confidential Flag | Laporan Rahasia | Optional | Toggle; entire content hidden from public |

### 4.2 Complaint Categories (for Pengadilan Agama context)

Suggested categories based on court service domains:

1. Pelayanan Administrasi Perkara (Case administration service)
2. Pelayanan Persidangan (Trial/hearing service)
3. Pelayanan Informasi (Information service)
4. Perilaku Aparat Pengadilan (Court personnel conduct)
5. Fasilitas dan Sarana Pengadilan (Court facilities)
6. Biaya Perkara (Case fees/costs)
7. Keterlambatan Proses (Process delays)
8. Lainnya (Other)

### 4.3 Data Protection Considerations

- NIK is sensitive PII — must be encrypted at rest and in transit
- Per Disdukcapil guidelines, NIK should never be displayed in public-facing complaint views
- Comply with **UU PDP No. 27/2022** (Personal Data Protection Law)
- Implement data minimization — collect only what is necessary

---

## 5. SLA Standards for Complaint Resolution

### 5.1 Regulatory Basis

| Regulation | SLA Provision |
|---|---|
| PermenPAN-RB No. 24/2014 | Max 60 working days from complete filing |
| PermenPAN-RB No. 62/2018 (replacement) | Max 60 working days; establishes SLA evaluation framework |
| PermenPAN-RB No. 5/2025 (current) | Latest revision — replaces No. 62/2018 |
| SP4N-LAPOR! operational SLA | Verification: 3 days; Response: 5 days; Closure: 10 days after response |

### 5.2 Recommended SLA Tiers for SIPADU

| Stage | SLA | Description |
|---|---|---|
| Acknowledgment | ≤ 1 working day | System auto-acknowledges receipt with tracking ID |
| Verification | ≤ 3 working days | Admin verifies completeness, validity, assigns category |
| First Response | ≤ 5 working days | Assigned handler provides initial response |
| Resolution (non-supervisory) | ≤ 14 working days | Standard complaints resolved |
| Resolution (supervisory/complex) | ≤ 60 working days | Complaints requiring investigation (*berkadar pengawasan*) |
| Auto-close | 10 working days after response | If no reply from complainant |

### 5.3 Working Days Calculation

- **Exclude**: Saturdays, Sundays, national holidays (*hari libur nasional*), joint leave (*cuti bersama*)
- **Reference**: Government working calendar published annually by SKB 3 Menteri
- **Implementation**: Maintain a holiday calendar table in the database; recalculate SLA deadlines dynamically

### 5.4 Escalation Procedures

| Trigger | Escalation Action |
|---|---|
| No verification after 3 days | Auto-notify admin supervisor |
| No first response after 5 days | Escalate to Panitera/Sekretaris |
| No resolution after 14 days | Escalate to Ketua Pengadilan |
| No resolution after 60 days | Complainant informed of right to report to Ombudsman RI |
| SLA breach pattern detected | Generate monthly report for leadership review |

### 5.5 Notifications

- Email and/or SMS at each status change
- Reminder notifications at 75% and 90% of SLA deadline
- Escalation notifications to supervisors when SLA is at risk

---

## 6. SP4N-LAPOR! Workflow Reference

### 6.1 Status Flow

```
[Dikirim/Submitted]
       |
       v
[Diverifikasi/Verified] -- (invalid) --> [Ditolak/Rejected]
       |
       v
[Diteruskan/Forwarded to Institution]
       |
       v
[Ditindaklanjuti/In Progress]
       |
       v
[Dijawab/Responded]
       |
       v
[Selesai/Resolved] -- (unsatisfied) --> [Dibuka Kembali/Reopened]
```

### 6.2 Detailed Process

1. **Submission (Penyampaian)**: Complainant submits via web, mobile app, SMS 1708, or social media.
2. **Verification (Verifikasi)**: Central admin team validates within 3 working days. Checks: completeness, clarity, appropriate category, jurisdiction.
3. **Forwarding (Disposisi)**: Valid complaints forwarded to the responsible institution's liaison officer (*pejabat penghubung*).
4. **Follow-up (Tindak Lanjut)**: Institution has 5 working days for internal coordination and response formulation.
5. **Response (Tanggapan)**: Institution provides a response visible to the complainant.
6. **Closure (Penutupan)**: Complaint marked resolved after 10 working days with no further reply from complainant. Complainant can reopen if unsatisfied.

### 6.3 Classification Types

| Type | Indonesian Term | Resolution SLA |
|---|---|---|
| Standard complaint | Pengaduan Tidak Berkadar Pengawasan | 14 working days |
| Supervisory complaint | Pengaduan Berkadar Pengawasan | 60 working days |
| Information request | Permintaan Informasi | 5 working days |
| Aspiration/suggestion | Aspirasi | 5 working days |

### 6.4 Key Features to Replicate in SIPADU

- **Tracking ID**: Unique reference number for each complaint
- **Anonymous mode**: Reporter identity hidden from reported party and public
- **Confidential mode**: Entire complaint content hidden from public view
- **Multi-channel intake**: Web form as primary; consider future SMS/WhatsApp integration
- **No wrong door policy**: If complaint is misdirected, forward to correct unit rather than rejecting
- **Auto-escalation to Ombudsman**: After 60 days without resolution, inform complainant of Ombudsman option

### 6.5 Integration Considerations

- SIPADU should be registered as an institutional complaint channel in SP4N-LAPOR!
- Consider API integration to sync complaint data between SIPADU and LAPOR!
- Dual reporting: complaints received via LAPOR! that target Pengadilan Agama Penajam should be importable into SIPADU

---

## 7. Summary of Regulatory Requirements

| Requirement | Source Regulation | Priority |
|---|---|---|
| Complaint tracking & transparency | PERMA 9/2016, SK KMA 2022 | Critical |
| Reporter identity protection | PERMA 9/2016 | Critical |
| Satisfaction survey post-resolution | PermenPAN-RB 14/2017 | High |
| 60-day max resolution SLA | PermenPAN-RB 62/2018 | Critical |
| Accessibility (WCAG 2.1 AA) | Perpres 95/2018, UU 8/2016 | High |
| .go.id domain | Depkominfo 2003 | Critical |
| Personal data protection | UU PDP 27/2022 | Critical |
| SP4N-LAPOR! integration | PermenPAN-RB 62/2018 | High |
| Public information disclosure | UU KIP 14/2008 | High |
| Mobile-responsive design | Perpres 95/2018 (SPBE) | High |

---

## Sources

- [PERMA No. 9/2016 — Whistleblowing System](https://pn-marisa.go.id/dasar-hukum-regulasi-pengaduan/)
- [MA Transparency Initiatives](https://marinews.mahkamahagung.go.id/artikel/mahkamah-agung-tingkatkan-transparansi-peradilan-0sg)
- [PermenPAN-RB No. 14/2017 — SKM](https://peraturan.bpk.go.id/Details/132600/permen-pan-rb-no-14-tahun-2017)
- [PermenPAN-RB No. 24/2014](https://peraturan.go.id/id/permenpanrb-no-24-tahun-2014)
- [PermenPAN-RB No. 62/2018 — SP4N](https://peraturan.bpk.go.id/Details/132581/permen-pan-rb-no-62-tahun-2018)
- [PermenPAN-RB No. 62/2018 (PDF)](https://www.jdihn.go.id/files/519/PERMENPAN%20NOMOR%2062%20TAHUN%202018.pdf)
- [SP4N-LAPOR! Workflow — Diskominfo Indramayu](https://diskominfo.indramayukab.go.id/berita/detail/alur-pengaduan-melalui-sp4n-lapor)
- [SP4N-LAPOR! — BPMP Jakarta](https://lpmpdki.kemdikbud.go.id/sp4n-lapor-untuk-pelayanan-publik-yang-lebih-baik/)
- [Ombudsman — Proses Pengaduan](https://ombudsman.go.id/artikel/r/pwkinternal--proses-administrasi-pengaduan-masyarakat)
- [Panduan Website Pemda](https://ppid.probolinggokota.go.id/wp-content/uploads/2019/11/Panduan-Pengelolaan-Situs-Web-2019.pdf)
- [JDIH Kementerian PANRB](https://jdih.menpan.go.id/)
