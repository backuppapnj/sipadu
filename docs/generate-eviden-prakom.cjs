const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TabStopType, TabStopPosition,
  TableOfContents
} = require("docx");

const CW = 9360;
const C1 = "1B5E20";
const C2 = "2E7D32";
const CL = "E8F5E9";
const CG = "757575";
const CB = "212121";
const CW2 = "FFFFFF";
const CR = "C62828";
const CB2 = "1565C0";
const CO = "E65100";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: CW2 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(t) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 },
    children: [new TextRun({ text: t, bold: true, size: 32, font: "Georgia", color: C1 })] });
}
function h2(t) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 },
    children: [new TextRun({ text: t, bold: true, size: 26, font: "Georgia", color: C2 })] });
}
function h3(t) {
  return new Paragraph({ spacing: { before: 200, after: 120 },
    children: [new TextRun({ text: t, bold: true, size: 24, font: "Calibri", color: C1 })] });
}
function p(t, opts = {}) {
  return new Paragraph({ spacing: { after: 120, line: 360 }, alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text: t, size: 22, font: "Calibri", color: CB, ...opts })] });
}
function pMulti(runs) {
  return new Paragraph({ spacing: { after: 120, line: 360 }, alignment: AlignmentType.JUSTIFIED,
    children: runs.map(r => typeof r === "string" ? new TextRun({ text: r, size: 22, font: "Calibri", color: CB }) : new TextRun({ size: 22, font: "Calibri", color: CB, ...r })) });
}
function bullet(t) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60, line: 340 },
    children: [new TextRun({ text: t, size: 22, font: "Calibri" })] });
}
function empty() { return new Paragraph({ spacing: { after: 80 }, children: [] }); }

function cell(t, opts = {}) {
  const children = opts.multiline
    ? t.split("\n").map((line, i) => new Paragraph({
        spacing: { after: i < t.split("\n").length - 1 ? 40 : 0 },
        alignment: opts.align || AlignmentType.LEFT,
        children: [new TextRun({ text: line, size: opts.sz || 20, font: "Calibri", bold: !!opts.b, color: opts.c || CB, italics: !!opts.i })]
      }))
    : [new Paragraph({ alignment: opts.align || AlignmentType.LEFT,
        children: [new TextRun({ text: t, size: opts.sz || 20, font: "Calibri", bold: !!opts.b, color: opts.c || CB, italics: !!opts.i })] })];
  return new TableCell({
    borders, width: { size: opts.w || 2340, type: WidthType.DXA },
    shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
    verticalAlign: opts.va || "center",
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children,
  });
}
function hCell(t, w) { return cell(t, { w, bg: C1, b: true, c: CW2, sz: 20, align: AlignmentType.CENTER }); }

function evidenTable(cols, header, rows) {
  return new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({ children: header.map((t, i) => hCell(t, cols[i])) }),
      ...rows,
    ],
  });
}

// ===== BUTIR KEGIATAN DATA =====
// Sesuai PermenPAN-RB No. 29 Tahun 2021 & Perkalan/PerBKN

const numbConfigs = [];
for (let i = 0; i < 20; i++) {
  numbConfigs.push({
    reference: `num${i}`, levels: [{
      level: 0, format: LevelFormat.DECIMAL, text: "%1.",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } }
    }]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Georgia", color: C1 },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Georgia", color: C2 },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ...numbConfigs,
    ],
  },
  sections: [
    // ========== SAMPUL ==========
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        empty(), empty(), empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
          children: [new TextRun({ text: "PENGADILAN AGAMA PENAJAM", size: 28, bold: true, font: "Georgia", color: C1 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "KELAS II \u2014 KALIMANTAN TIMUR", size: 22, font: "Calibri", color: CG })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C1, space: 1 } }, spacing: { after: 200 }, children: [] }),
        empty(), empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
          children: [new TextRun({ text: "RANCANGAN TEKNIS", size: 24, font: "Calibri", color: CG, allCaps: true })] }),
        empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "SIPADU", size: 56, bold: true, font: "Georgia", color: C1 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
          children: [new TextRun({ text: "Sistem Informasi Pengaduan Layanan", size: 30, font: "Georgia", color: C2 })] }),
        empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "Eviden Butir Kegiatan Pranata Komputer", size: 24, font: "Calibri", color: CB, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "Referensi Pengajuan Angka Kredit", size: 22, font: "Calibri", color: CG })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "Berdasarkan PermenPAN-RB No. 29 Tahun 2021", size: 22, font: "Calibri", color: CG })] }),
        empty(), empty(), empty(), empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 6, color: C1, space: 1 } }, spacing: { after: 200 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "Disusun oleh: Pranata Komputer PA Penajam", size: 20, font: "Calibri", color: CG })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "Penajam Paser Utara, 16 Maret 2026", size: 20, font: "Calibri", color: CG })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Versi 1.0", size: 20, bold: true, font: "Calibri", color: C1 })] }),
      ],
    },

    // ========== ISI ==========
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [
        new Paragraph({ children: [new TextRun({ text: "SIPADU \u2014 Eviden Pranata Komputer", size: 18, font: "Calibri", color: CG, italics: true })],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }] }),
      ] }) },
      footers: { default: new Footer({ children: [
        new Paragraph({ alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: "4CAF50", space: 4 } },
          children: [
            new TextRun({ text: "PA Penajam \u2014 Eviden Angka Kredit Prakom \u2014 Halaman ", size: 18, font: "Calibri", color: CG }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Calibri", color: CG }),
          ] }),
      ] }) },
      children: [
        // DAFTAR ISI
        h1("DAFTAR ISI"),
        new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== BAB 1 =====
        h1("1. PENDAHULUAN"),

        h2("1.1 Latar Belakang"),
        p("Dokumen ini disusun sebagai rancangan teknis pengembangan Sistem Informasi Pengaduan Layanan (SIPADU) di Pengadilan Agama Penajam yang sekaligus berfungsi sebagai eviden (bukti kerja) untuk pengajuan angka kredit Jabatan Fungsional Pranata Komputer."),
        p("Penyusunan dokumen ini mengacu pada:"),
        bullet("PermenPAN-RB Nomor 29 Tahun 2021 tentang Jabatan Fungsional Pranata Komputer;"),
        bullet("Peraturan BKN Nomor 3 Tahun 2023 tentang Petunjuk Teknis Penilaian Angka Kredit JF Pranata Komputer;"),
        bullet("Keputusan Menteri PANRB Nomor 421 Tahun 2022 tentang Uraian Kegiatan, Hasil Kerja, dan Angka Kredit JF Pranata Komputer."),
        empty(),

        h2("1.2 Tujuan Dokumen"),
        bullet("Mendokumentasikan seluruh tahapan teknis pengembangan SIPADU secara terstruktur;"),
        bullet("Memetakan setiap kegiatan pengembangan ke butir-butir kegiatan Pranata Komputer yang berlaku;"),
        bullet("Menyediakan referensi eviden yang dapat diajukan untuk penilaian angka kredit;"),
        bullet("Memenuhi persyaratan kelengkapan dokumen teknis sesuai standar SPBE."),
        empty(),

        h2("1.3 Identitas Pengusul"),
        evidenTable([3120, 6240], ["Atribut", "Keterangan"], [
          new TableRow({ children: [cell("Nama", { w: 3120, b: true, bg: CL }), cell("(.........................................)", { w: 6240 })] }),
          new TableRow({ children: [cell("NIP", { w: 3120, b: true, bg: CL }), cell("(.........................................)", { w: 6240 })] }),
          new TableRow({ children: [cell("Jabatan", { w: 3120, b: true, bg: CL }), cell("Pranata Komputer (.........)", { w: 6240 })] }),
          new TableRow({ children: [cell("Jenjang", { w: 3120, b: true, bg: CL }), cell("Terampil / Ahli Pertama / Ahli Muda / Ahli Madya *)", { w: 6240 })] }),
          new TableRow({ children: [cell("Unit Kerja", { w: 3120, b: true, bg: CL }), cell("Pengadilan Agama Penajam", { w: 6240 })] }),
          new TableRow({ children: [cell("Periode Penilaian", { w: 3120, b: true, bg: CL }), cell("Januari \u2013 Desember 2026", { w: 6240 })] }),
        ]),
        empty(),
        p("*) coret yang tidak perlu", { italics: true, size: 20, color: CG }),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== BAB 2 =====
        h1("2. PEMETAAN BUTIR KEGIATAN PRANATA KOMPUTER"),

        h2("2.1 Ringkasan Pemetaan"),
        p("Berikut adalah pemetaan kegiatan pengembangan SIPADU terhadap butir kegiatan Jabatan Fungsional Pranata Komputer sesuai PermenPAN-RB No. 29 Tahun 2021 dan Keputusan Menteri PANRB No. 421 Tahun 2022:"),
        empty(),

        evidenTable([700, 3660, 2600, 2400], ["No", "Butir Kegiatan", "Jenjang", "Kegiatan SIPADU"],
          [
            ["A. PENGEMBANGAN SISTEM INFORMASI"],
            ["1", "Melakukan analisis kebutuhan sistem informasi", "Ahli Pertama", "Analisis kebutuhan SIPADU"],
            ["2", "Merancang sistem informasi", "Ahli Pertama", "Perancangan arsitektur SIPADU"],
            ["3", "Membangun sistem informasi", "Ahli Pertama", "Pengembangan (coding) SIPADU"],
            ["4", "Melakukan integrasi sistem informasi", "Ahli Muda", "Integrasi modul + SPBE"],
            ["5", "Melakukan pengujian sistem informasi", "Ahli Pertama", "Testing (unit, feature, security)"],
            ["6", "Melakukan implementasi sistem informasi", "Ahli Pertama", "Deployment ke server produksi"],
            ["", "", "", ""],
            ["B. INFRASTRUKTUR TEKNOLOGI INFORMASI"],
            ["7", "Melakukan analisis kebutuhan infrastruktur TI", "Terampil", "Analisis kebutuhan server"],
            ["8", "Merancang infrastruktur TI", "Ahli Pertama", "Rancangan arsitektur server"],
            ["9", "Mengimplementasikan infrastruktur TI", "Terampil", "Setup server, database, web server"],
            ["", "", "", ""],
            ["C. KEAMANAN INFORMASI"],
            ["10", "Melakukan analisis keamanan informasi", "Ahli Pertama", "Analisis keamanan SIPADU"],
            ["11", "Menyusun kebijakan keamanan informasi", "Ahli Muda", "Kebijakan keamanan & SPBE"],
            ["12", "Mengimplementasikan keamanan informasi", "Ahli Pertama", "Implementasi enkripsi, RBAC, audit"],
            ["", "", "", ""],
            ["D. TATA KELOLA TI"],
            ["13", "Menyusun dokumentasi sistem informasi", "Terampil", "Dokumentasi teknis SIPADU"],
            ["14", "Menyusun standar operasional prosedur TI", "Ahli Pertama", "SOP pengelolaan SIPADU"],
            ["15", "Melakukan evaluasi sistem informasi", "Ahli Muda", "Evaluasi kepatuhan SPBE"],
          ].map(row => {
            if (row.length === 1) {
              return new TableRow({ children: [
                new TableCell({ borders, width: { size: CW, type: WidthType.DXA }, columnSpan: 4,
                  shading: { fill: C2, type: ShadingType.CLEAR },
                  margins: { top: 60, bottom: 60, left: 100, right: 100 },
                  children: [new Paragraph({ children: [new TextRun({ text: row[0], size: 20, font: "Calibri", bold: true, color: CW2 })] })] }),
              ] });
            }
            if (row[0] === "") return new TableRow({ children: row.map((t, i) => cell(t, { w: [700, 3660, 2600, 2400][i], sz: 16 })) });
            return new TableRow({ children: [
              cell(row[0], { w: 700, align: AlignmentType.CENTER }),
              cell(row[1], { w: 3660 }),
              cell(row[2], { w: 2600, align: AlignmentType.CENTER, c: CB2, b: true }),
              cell(row[3], { w: 2400 }),
            ] });
          })
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== BAB 3 =====
        h1("3. URAIAN KEGIATAN DAN EVIDEN"),

        p("Bagian ini menjelaskan secara rinci setiap butir kegiatan, output yang dihasilkan, dan eviden yang dapat diajukan untuk penilaian angka kredit."),
        empty(),

        // --- A. PENGEMBANGAN SI ---
        h2("3.1 Analisis Kebutuhan Sistem Informasi"),
        evidenTable([2400, 6960], ["Komponen", "Uraian"], [
          ...[
            ["Butir Kegiatan", "Melakukan analisis kebutuhan sistem informasi"],
            ["Uraian", "Mengumpulkan, menganalisis, dan mendokumentasikan kebutuhan pengguna serta kebutuhan teknis untuk pembangunan SIPADU"],
            ["Hasil Kerja", "Dokumen Analisis Kebutuhan Sistem"],
            ["Satuan Hasil", "Dokumen"],
          ].map(([k, v]) => new TableRow({ children: [cell(k, { w: 2400, b: true, bg: CL }), cell(v, { w: 6960 })] })),
        ]),
        empty(),
        h3("Kegiatan yang Dilakukan:"),
        bullet("Melakukan wawancara dan observasi terhadap proses penanganan pengaduan eksisting di PA Penajam;"),
        bullet("Mengidentifikasi 8 kategori pengaduan spesifik Pengadilan Agama (ADM, KET, PEG, PTSP, INFO, FAS, NIK, LAIN);"),
        bullet("Menganalisis regulasi terkait: SK KMA 026/2012, PERMA 9/2016, PermenPAN-RB 62/2018;"),
        bullet("Mengidentifikasi 4 peran pengguna sistem: masyarakat, petugas layanan, panitera, administrator;"),
        bullet("Menyusun daftar kebutuhan fungsional (12 fitur utama: FR-01 s.d FR-12);"),
        bullet("Menyusun daftar kebutuhan non-fungsional (performa, keamanan, aksesibilitas);"),
        bullet("Menganalisis kebutuhan integrasi SP4N-LAPOR! dan SIPP."),
        empty(),
        h3("Eviden yang Dihasilkan:"),
        evidenTable([700, 4160, 4500], ["No", "Dokumen Eviden", "Lokasi File"], [
          ...[
            ["1", "Dokumen Riset Domain & Konteks Pengadilan Agama", "research/domain-context.md"],
            ["2", "Dokumen Riset UX & Kepatuhan Regulasi", "research/ux-compliance.md"],
            ["3", "Spesifikasi Kebutuhan Formulir Pengaduan (14 field)", "research/project-spec.md (Bab 3.1)"],
            ["4", "Identifikasi Kategori Pengaduan & SLA", "research/project-spec.md (Bab 2.3)"],
            ["5", "Daftar Kebutuhan Fungsional (FR-01 s.d FR-12)", "docs/SIPADU_Product_Specification_v1.0.docx (Bab 3)"],
          ].map(([n, d, l]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }),
            cell(d, { w: 4160 }),
            cell(l, { w: 4500, i: true, sz: 18 }),
          ] })),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        h2("3.2 Perancangan Sistem Informasi"),
        evidenTable([2400, 6960], ["Komponen", "Uraian"], [
          ...[
            ["Butir Kegiatan", "Merancang sistem informasi"],
            ["Uraian", "Merancang arsitektur sistem, basis data, antarmuka pengguna, dan alur proses bisnis SIPADU"],
            ["Hasil Kerja", "Dokumen Rancangan Teknis Sistem"],
            ["Satuan Hasil", "Dokumen"],
          ].map(([k, v]) => new TableRow({ children: [cell(k, { w: 2400, b: true, bg: CL }), cell(v, { w: 6960 })] })),
        ]),
        empty(),
        h3("Kegiatan yang Dilakukan:"),
        bullet("Merancang arsitektur aplikasi: Laravel 12 + Inertia.js v2 + React 19 (TypeScript);"),
        bullet("Merancang skema basis data: 10 tabel dengan relasi, indeks, dan klasifikasi data SPBE;"),
        bullet("Merancang pola arsitektur kode: Action Classes, Form Requests, API Resources, Services;"),
        bullet("Merancang alur status pengaduan: 8 status dengan matriks transisi tervalidasi;"),
        bullet("Merancang sistem otorisasi RBAC: 4 peran dengan 19 permission granular;"),
        bullet("Merancang mekanisme SLA: perhitungan hari kerja, eskalasi berjenjang 3 tingkat;"),
        bullet("Merancang sistem audit trail: tabel immutable dengan 11 field pencatatan;"),
        bullet("Merancang arsitektur notifikasi: email (queued) + WhatsApp (Fonnte API);"),
        bullet("Merancang format nomor tiket: PA-PNJ-YYYY-XXXXX dengan atomic generation;"),
        bullet("Merancang antarmuka pengguna (UI/UX): 24 halaman, mobile-first, WCAG 2.1 AA."),
        empty(),
        h3("Eviden yang Dihasilkan:"),
        evidenTable([700, 4160, 4500], ["No", "Dokumen Eviden", "Lokasi File"], [
          ...[
            ["1", "Dokumen Rancangan Proposal SIPADU", "docs/SIPADU_Rancangan_Proposal_v1.0.docx"],
            ["2", "Dokumen Spesifikasi Produk (arsitektur, skema DB, alur)", "docs/SIPADU_Product_Specification_v1.0.docx"],
            ["3", "Rancangan Teknis Backend (rekomendasi teknologi)", "research/technical-recommendations.md"],
            ["4", "Spesifikasi Lengkap Sistem (project spec)", "research/project-spec.md"],
            ["5", "Rancangan Skema Database (10 tabel, migrasi)", "database/migrations/ (10 file migrasi)"],
            ["6", "Rancangan Arsitektur Kode (Actions, Services)", "app/Actions/, app/Services/"],
            ["7", "Rancangan Otorisasi RBAC (role-permission matrix)", "database/seeders/RolePermissionSeeder.php"],
          ].map(([n, d, l]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }),
            cell(d, { w: 4160 }),
            cell(l, { w: 4500, i: true, sz: 18 }),
          ] })),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        h2("3.3 Pembangunan Sistem Informasi"),
        evidenTable([2400, 6960], ["Komponen", "Uraian"], [
          ...[
            ["Butir Kegiatan", "Membangun sistem informasi"],
            ["Uraian", "Melakukan pengembangan (coding) aplikasi SIPADU sesuai rancangan teknis yang telah disetujui"],
            ["Hasil Kerja", "Aplikasi Sistem Informasi"],
            ["Satuan Hasil", "Aplikasi"],
          ].map(([k, v]) => new TableRow({ children: [cell(k, { w: 2400, b: true, bg: CL }), cell(v, { w: 6960 })] })),
        ]),
        empty(),
        h3("Kegiatan yang Dilakukan:"),
        p("A. Pengembangan Backend (PHP/Laravel):", { bold: true }),
        bullet("Pembuatan 10 file migrasi database dengan klasifikasi data SPBE pada setiap tabel;"),
        bullet("Pembuatan 10 model Eloquent dengan relasi, SoftDeletes, dan LogsActivity;"),
        bullet("Pembuatan 3 enum (ComplaintStatusEnum, PriorityEnum, DataClassificationEnum);"),
        bullet("Pembuatan 6 Action Classes untuk logika bisnis (CreateComplaint, AssignComplaint, GenerateTicketNumber, dll.);"),
        bullet("Pembuatan 3 Service (SlaService, AuditService, EncryptionService);"),
        bullet("Pembuatan 11 Controller dengan pendekatan thin controller;"),
        bullet("Pembuatan 5 Form Request dengan validasi dan pesan error Bahasa Indonesia;"),
        bullet("Pembuatan 2 Middleware kustom (AuditMiddleware, CheckAccountLockout);"),
        bullet("Pembuatan 4 Notification class (queued, email + WhatsApp);"),
        bullet("Pembuatan 1 custom notification channel (WhatsAppChannel via Fonnte);"),
        bullet("Pembuatan 1 Artisan Command (CheckSlaDeadlinesCommand);"),
        bullet("Konfigurasi routing berdasarkan role dengan middleware Spatie Permission."),
        empty(),
        p("B. Pengembangan Frontend (React/TypeScript):", { bold: true }),
        bullet("Pembuatan 24 halaman Inertia (TSX) untuk 4 role pengguna;"),
        bullet("Pembuatan 10+ komponen reusable (StatusBadge, SlaIndicator, DataTable, FileUploadZone, dll.);"),
        bullet("Pembuatan 3 layout (GuestLayout, AuthenticatedLayout, AdminLayout);"),
        bullet("Pembuatan hooks kustom (usePermission, useFlash);"),
        bullet("Implementasi TypeScript strict mode dengan shared types;"),
        bullet("Implementasi desain mobile-first responsive dengan Tailwind CSS."),
        empty(),
        p("C. Pengembangan Autentikasi & Otorisasi:", { bold: true }),
        bullet("Konfigurasi Spatie Laravel Permission: 4 role, 19 permission;"),
        bullet("Pembuatan 2 Policy (ComplaintPolicy, UserPolicy);"),
        bullet("Pembuatan 3 Event Listener (LogSuccessfulLogin, LogSuccessfulLogout, LogFailedLogin);"),
        bullet("Implementasi StrongPassword validation rule;"),
        bullet("Implementasi account lockout (5 gagal = 30 menit kunci);"),
        bullet("Implementasi password expiry warning (90 hari)."),
        empty(),
        h3("Eviden yang Dihasilkan:"),
        evidenTable([700, 4660, 4000], ["No", "Dokumen/Artefak Eviden", "Lokasi"], [
          ...[
            ["1", "Source code backend (Models, Controllers, Actions, Services)", "app/"],
            ["2", "Source code frontend (Pages, Components, Layouts)", "resources/js/"],
            ["3", "File migrasi database (10 tabel)", "database/migrations/"],
            ["4", "Konfigurasi routing", "routes/web.php"],
            ["5", "Konfigurasi middleware & service provider", "bootstrap/app.php"],
            ["6", "Konfigurasi environment (.env.example)", ".env.example"],
            ["7", "Screenshot/tangkapan layar aplikasi berjalan", "(dilampirkan terpisah)"],
            ["8", "Git log (riwayat pengembangan)", "git log --oneline"],
          ].map(([n, d, l]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }),
            cell(d, { w: 4660 }),
            cell(l, { w: 4000, i: true, sz: 18 }),
          ] })),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        h2("3.4 Pengujian Sistem Informasi"),
        evidenTable([2400, 6960], ["Komponen", "Uraian"], [
          ...[
            ["Butir Kegiatan", "Melakukan pengujian sistem informasi"],
            ["Uraian", "Melakukan pengujian fungsional, keamanan, dan performa aplikasi SIPADU"],
            ["Hasil Kerja", "Laporan Hasil Pengujian"],
            ["Satuan Hasil", "Laporan"],
          ].map(([k, v]) => new TableRow({ children: [cell(k, { w: 2400, b: true, bg: CL }), cell(v, { w: 6960 })] })),
        ]),
        empty(),
        h3("Kegiatan yang Dilakukan:"),
        bullet("Pengujian siklus hidup pengaduan lengkap (submit \u2192 verifikasi \u2192 assign \u2192 proses \u2192 jawab \u2192 selesai);"),
        bullet("Pengujian validasi formulir pengaduan (NIK 16 digit, deskripsi min 50 karakter, MIME type file);"),
        bullet("Pengujian hak akses per role (18 test case: setiap endpoint diuji dengan setiap role);"),
        bullet("Pengujian autentikasi (login berhasil/gagal, lockout, password complexity, registrasi);"),
        bullet("Pengujian perhitungan SLA (hari kerja, skip weekend, skip hari libur, isOverdue);"),
        bullet("Pengujian audit log (immutability, completeness, request_id, session tracking);"),
        bullet("Pengujian keamanan upload file (MIME validation, reject executable, size limit, checksum);"),
        bullet("Pengujian pelacakan pengaduan (valid ticket, invalid ticket, anonymous, confidential)."),
        empty(),
        h3("Ringkasan Hasil Pengujian:"),
        evidenTable([2400, 2400, 2160, 2400], ["Kategori Test", "Jumlah Test", "Berhasil", "Target Coverage"], [
          ...[
            ["Complaint Lifecycle", "3 test", "100%", "90%"],
            ["Complaint Submission", "12 test", "100%", "90%"],
            ["Role-Based Access", "18 test", "100%", "90%"],
            ["Authentication", "13 test", "100%", "90%"],
            ["SLA Calculation", "8 test", "100%", "95%"],
            ["Audit Log", "9 test", "100%", "85%"],
            ["File Upload Security", "9 test", "100%", "80%"],
            ["Complaint Tracking", "5 test", "100%", "80%"],
          ].map(([k, j, b, t]) => new TableRow({ children: [
            cell(k, { w: 2400, b: true }),
            cell(j, { w: 2400, align: AlignmentType.CENTER }),
            cell(b, { w: 2160, align: AlignmentType.CENTER, c: C1, b: true }),
            cell(t, { w: 2400, align: AlignmentType.CENTER }),
          ] })),
          new TableRow({ children: [
            cell("TOTAL", { w: 2400, b: true, bg: CL }),
            cell("77 test", { w: 2400, align: AlignmentType.CENTER, b: true, bg: CL }),
            cell("100%", { w: 2160, align: AlignmentType.CENTER, b: true, c: C1, bg: CL }),
            cell("\u226570%", { w: 2400, align: AlignmentType.CENTER, b: true, bg: CL }),
          ] }),
        ]),
        empty(),
        h3("Eviden yang Dihasilkan:"),
        evidenTable([700, 4660, 4000], ["No", "Dokumen Eviden", "Lokasi"], [
          ...[
            ["1", "Test suite: Complaint Lifecycle (3 test)", "tests/Feature/Complaint/ComplaintLifecycleTest.php"],
            ["2", "Test suite: Complaint Submission (12 test)", "tests/Feature/Complaint/ComplaintSubmissionTest.php"],
            ["3", "Test suite: Role-Based Access (18 test)", "tests/Feature/Auth/RoleAccessTest.php"],
            ["4", "Test suite: Authentication (13 test)", "tests/Feature/Auth/AuthenticationTest.php"],
            ["5", "Test suite: SLA Calculation (8 test)", "tests/Feature/Sla/SlaCalculationTest.php"],
            ["6", "Test suite: Audit Log (9 test)", "tests/Feature/AuditLog/AuditLogTest.php"],
            ["7", "Test suite: File Upload Security (9 test)", "tests/Feature/FileUpload/FileUploadSecurityTest.php"],
            ["8", "Test suite: Complaint Tracking (5 test)", "tests/Feature/Complaint/ComplaintTrackingTest.php"],
            ["9", "Output hasil test (php artisan test)", "(tangkapan layar terminal)"],
          ].map(([n, d, l]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }),
            cell(d, { w: 4660 }),
            cell(l, { w: 4000, i: true, sz: 18 }),
          ] })),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        h2("3.5 Analisis dan Implementasi Keamanan Informasi"),
        evidenTable([2400, 6960], ["Komponen", "Uraian"], [
          ...[
            ["Butir Kegiatan", "Melakukan analisis keamanan informasi & mengimplementasikan keamanan informasi"],
            ["Uraian", "Menganalisis risiko keamanan dan mengimplementasikan kontrol keamanan sesuai standar SPBE dan BSSN"],
            ["Hasil Kerja", "Dokumen Analisis Keamanan + Implementasi Kontrol Keamanan"],
            ["Satuan Hasil", "Dokumen + Konfigurasi"],
          ].map(([k, v]) => new TableRow({ children: [cell(k, { w: 2400, b: true, bg: CL }), cell(v, { w: 6960 })] })),
        ]),
        empty(),
        h3("Kontrol Keamanan yang Diimplementasikan:"),
        evidenTable([700, 3360, 2900, 2400], ["No", "Kontrol Keamanan", "Standar Acuan", "Status"], [
          ...[
            ["1", "Enkripsi NIK at-rest (AES-256-CBC)", "UU PDP 27/2022", "Terpenuhi"],
            ["2", "Enkripsi file lampiran at-rest", "BSSN 4/2021", "Terpenuhi"],
            ["3", "SHA-256 checksum integritas file", "Perpres 95/2018", "Terpenuhi"],
            ["4", "RBAC 4 peran + 19 permission", "SNI 27001", "Terpenuhi"],
            ["5", "Account lockout (5 gagal / 30 menit)", "BSSN 4/2021", "Terpenuhi"],
            ["6", "Password complexity policy", "BSSN 4/2021", "Terpenuhi"],
            ["7", "Immutable audit trail", "Perpres 95/2018", "Terpenuhi"],
            ["8", "CSRF protection (Sanctum session)", "BSSN 4/2021", "Terpenuhi"],
            ["9", "Input validation (SQLi, XSS prevention)", "BSSN 4/2021", "Terpenuhi"],
            ["10", "Soft delete (no permanent deletion)", "Perpres 95/2018", "Terpenuhi"],
            ["11", "File MIME type validation", "BSSN 4/2021", "Terpenuhi"],
            ["12", "Klasifikasi data (publik/internal/rahasia)", "Perpres 95/2018", "Terpenuhi"],
            ["13", "Session management (HttpOnly, Secure)", "BSSN 4/2021", "Terpenuhi"],
            ["14", "Security headers (CSP, HSTS, dll.)", "BSSN 4/2021", "Sebagian"],
          ].map(([n, k, s, st]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }),
            cell(k, { w: 3360 }),
            cell(s, { w: 2900, sz: 18 }),
            cell(st, { w: 2400, align: AlignmentType.CENTER, b: true, c: st === "Terpenuhi" ? C1 : CO }),
          ] })),
        ]),
        empty(),
        h3("Eviden yang Dihasilkan:"),
        evidenTable([700, 4660, 4000], ["No", "Dokumen Eviden", "Lokasi"], [
          ...[
            ["1", "Dokumen Riset Kepatuhan SPBE", "research/spbe-compliance.md"],
            ["2", "Checklist Kepatuhan SPBE (69 item)", "research/spbe-checklist.md"],
            ["3", "Laporan Audit SPBE (compliance rate 94,6%)", "docs/SPBE-AUDIT-REPORT.md"],
            ["4", "Dokumen Kepatuhan SPBE (pemetaan ke kode)", "docs/SPBE-COMPLIANCE.md"],
            ["5", "Dokumen Audit Trail", "docs/AUDIT-TRAIL.md"],
            ["6", "Checklist Keamanan Pre-Deployment (50+ item)", "docs/SECURITY-CHECKLIST.md"],
            ["7", "Source code kontrol keamanan", "app/Services/AuditService.php, EncryptionService.php"],
            ["8", "Test keamanan upload file (9 test)", "tests/Feature/FileUpload/FileUploadSecurityTest.php"],
          ].map(([n, d, l]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }),
            cell(d, { w: 4660 }),
            cell(l, { w: 4000, i: true, sz: 18 }),
          ] })),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        h2("3.6 Penyusunan Dokumentasi Sistem Informasi"),
        evidenTable([2400, 6960], ["Komponen", "Uraian"], [
          ...[
            ["Butir Kegiatan", "Menyusun dokumentasi sistem informasi"],
            ["Uraian", "Menyusun dokumentasi teknis, manual pengguna, dan panduan deployment SIPADU"],
            ["Hasil Kerja", "Dokumen Teknis Sistem Informasi"],
            ["Satuan Hasil", "Dokumen"],
          ].map(([k, v]) => new TableRow({ children: [cell(k, { w: 2400, b: true, bg: CL }), cell(v, { w: 6960 })] })),
        ]),
        empty(),
        h3("Dokumen yang Dihasilkan:"),
        evidenTable([700, 3460, 2400, 2800], ["No", "Nama Dokumen", "Bahasa", "Halaman/Ukuran"], [
          ...[
            ["1", "README.md (panduan instalasi & konfigurasi)", "Indonesia", "\u00b1 5 halaman"],
            ["2", "Dokumen Kepatuhan SPBE", "Indonesia", "\u00b1 10 halaman"],
            ["3", "Dokumen Audit Trail", "Indonesia", "\u00b1 5 halaman"],
            ["4", "Manual Pengguna (4 peran)", "Indonesia", "\u00b1 15 halaman"],
            ["5", "Checklist Keamanan Pre-Deployment", "Indonesia", "50+ item"],
            ["6", "Dokumentasi API/Endpoint", "Indonesia", "\u00b1 8 halaman"],
            ["7", "Panduan Deployment", "Indonesia", "\u00b1 10 halaman"],
            ["8", "Ringkasan Proyek (Final Summary)", "Indonesia", "\u00b1 5 halaman"],
            ["9", "Dokumen Rancangan Proposal (.docx)", "Indonesia", "15 halaman"],
            ["10", "Dokumen Spesifikasi Produk (.docx)", "Indonesia", "21 halaman"],
            ["11", "Dokumen Eviden Prakom (.docx)", "Indonesia", "Dokumen ini"],
          ].map(([n, d, b, h]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }),
            cell(d, { w: 3460 }),
            cell(b, { w: 2400, align: AlignmentType.CENTER }),
            cell(h, { w: 2800, align: AlignmentType.CENTER }),
          ] })),
        ]),
        empty(),
        h3("Eviden: Seluruh file dokumentasi tersedia di direktori docs/ dan root proyek."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== BAB 4 =====
        h1("4. REKAPITULASI ANGKA KREDIT"),

        p("Berikut adalah rekapitulasi estimasi angka kredit yang dapat diajukan berdasarkan kegiatan pengembangan SIPADU:"),
        empty(),

        evidenTable([700, 3260, 1800, 1800, 1800], ["No", "Butir Kegiatan", "Jenjang", "AK/Kegiatan", "Jumlah AK"], [
          ...[
            ["1", "Analisis kebutuhan SI", "Ahli Pertama", "0,45", "0,45"],
            ["2", "Perancangan SI", "Ahli Pertama", "0,90", "0,90"],
            ["3", "Pembangunan SI", "Ahli Pertama", "1,80", "1,80"],
            ["4", "Integrasi SI (modul + SPBE)", "Ahli Muda", "0,90", "0,90"],
            ["5", "Pengujian SI", "Ahli Pertama", "0,45", "0,45"],
            ["6", "Implementasi/Deployment SI", "Ahli Pertama", "0,45", "0,45"],
            ["7", "Analisis kebutuhan infrastruktur", "Terampil", "0,15", "0,15"],
            ["8", "Perancangan infrastruktur", "Ahli Pertama", "0,30", "0,30"],
            ["9", "Implementasi infrastruktur", "Terampil", "0,30", "0,30"],
            ["10", "Analisis keamanan informasi", "Ahli Pertama", "0,45", "0,45"],
            ["11", "Kebijakan keamanan informasi", "Ahli Muda", "0,90", "0,90"],
            ["12", "Implementasi keamanan informasi", "Ahli Pertama", "0,45", "0,45"],
            ["13", "Dokumentasi SI (11 dokumen)", "Terampil", "0,15", "1,65"],
            ["14", "SOP pengelolaan SI", "Ahli Pertama", "0,30", "0,30"],
            ["15", "Evaluasi SI (audit SPBE)", "Ahli Muda", "0,45", "0,45"],
          ].map(([n, k, j, a, t]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }),
            cell(k, { w: 3260 }),
            cell(j, { w: 1800, align: AlignmentType.CENTER, sz: 18 }),
            cell(a, { w: 1800, align: AlignmentType.CENTER }),
            cell(t, { w: 1800, align: AlignmentType.CENTER, b: true }),
          ] })),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, columnSpan: 4,
              shading: { fill: CL, type: ShadingType.CLEAR },
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "TOTAL ESTIMASI ANGKA KREDIT", size: 22, font: "Calibri", bold: true })] })] }),
            cell("9,90", { w: 1800, align: AlignmentType.CENTER, b: true, c: C1, sz: 24, bg: CL }),
          ] }),
        ]),
        empty(),
        p("Catatan: Angka kredit di atas bersifat estimasi dan dapat disesuaikan oleh Tim Penilai berdasarkan bukti kerja yang diajukan serta tingkat kompleksitas yang dinilai. Nilai AK per kegiatan mengacu pada PermenPAN-RB No. 29 Tahun 2021 dan dapat bervariasi tergantung jenjang jabatan pengusul.", { italics: true, size: 20 }),
        p("*) Untuk dokumentasi SI, dihitung 0,15 x 11 dokumen = 1,65 AK.", { italics: true, size: 20 }),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== BAB 5 =====
        h1("5. DAFTAR EVIDEN LENGKAP"),

        p("Berikut adalah daftar seluruh eviden yang dihasilkan dari kegiatan pengembangan SIPADU:"),
        empty(),

        h2("5.1 Dokumen Perencanaan & Analisis"),
        evidenTable([700, 5060, 3600], ["No", "Nama Eviden", "Format"], [
          ...[
            ["1", "Dokumen Riset Domain PA Penajam", "Markdown (.md)"],
            ["2", "Dokumen Riset UX & Kepatuhan Regulasi", "Markdown (.md)"],
            ["3", "Dokumen Riset Rekomendasi Teknis", "Markdown (.md)"],
            ["4", "Dokumen Riset Kepatuhan SPBE", "Markdown (.md)"],
            ["5", "Spesifikasi Proyek (project-spec)", "Markdown (.md)"],
            ["6", "Checklist SPBE (69 item)", "Markdown (.md)"],
          ].map(([n, d, f]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }), cell(d, { w: 5060 }), cell(f, { w: 3600, align: AlignmentType.CENTER }),
          ] })),
        ]),
        empty(),

        h2("5.2 Dokumen Rancangan"),
        evidenTable([700, 5060, 3600], ["No", "Nama Eviden", "Format"], [
          ...[
            ["1", "Rancangan Proposal SIPADU", "Word (.docx)"],
            ["2", "Spesifikasi Produk SIPADU", "Word (.docx)"],
            ["3", "Rancangan Database (10 file migrasi)", "PHP (Laravel Migration)"],
            ["4", "Rancangan Role & Permission (seeder)", "PHP (Laravel Seeder)"],
            ["5", "Rancangan Arsitektur Kode (Actions, Services)", "PHP"],
          ].map(([n, d, f]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }), cell(d, { w: 5060 }), cell(f, { w: 3600, align: AlignmentType.CENTER }),
          ] })),
        ]),
        empty(),

        h2("5.3 Artefak Pengembangan (Source Code)"),
        evidenTable([700, 3860, 1800, 3000], ["No", "Komponen", "Jumlah File", "Lokasi"], [
          ...[
            ["1", "Models (Eloquent)", "10", "app/Models/"],
            ["2", "Controllers", "11", "app/Http/Controllers/"],
            ["3", "Action Classes", "6", "app/Actions/"],
            ["4", "Services", "3", "app/Services/"],
            ["5", "Form Requests", "5", "app/Http/Requests/"],
            ["6", "Middleware", "4", "app/Http/Middleware/"],
            ["7", "Notifications", "4", "app/Notifications/"],
            ["8", "Policies", "2", "app/Policies/"],
            ["9", "Event Listeners", "3", "app/Listeners/"],
            ["10", "Enums", "3", "app/Enums/"],
            ["11", "React Pages (TSX)", "24", "resources/js/Pages/"],
            ["12", "React Components", "10+", "resources/js/Components/"],
            ["13", "Database Migrations", "10", "database/migrations/"],
            ["14", "Database Seeders", "6", "database/seeders/"],
            ["15", "Database Factories", "3", "database/factories/"],
          ].map(([n, k, j, l]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }),
            cell(k, { w: 3860 }),
            cell(j, { w: 1800, align: AlignmentType.CENTER, b: true }),
            cell(l, { w: 3000, i: true, sz: 18 }),
          ] })),
        ]),
        empty(),

        h2("5.4 Artefak Pengujian"),
        evidenTable([700, 5060, 3600], ["No", "Nama Eviden", "Format"], [
          ...[
            ["1", "Test suite: 8 file test (77 test case)", "PHP (PHPUnit/Pest)"],
            ["2", "Model Factories (3 file)", "PHP (Laravel Factory)"],
            ["3", "Seeder data realistis (30 pengaduan, 14 user)", "PHP (Laravel Seeder)"],
            ["4", "Tangkapan layar hasil pengujian", "(dilampirkan terpisah)"],
          ].map(([n, d, f]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }), cell(d, { w: 5060 }), cell(f, { w: 3600, align: AlignmentType.CENTER }),
          ] })),
        ]),
        empty(),

        h2("5.5 Dokumen Teknis & Panduan"),
        evidenTable([700, 5060, 3600], ["No", "Nama Eviden", "Format"], [
          ...[
            ["1", "README.md (panduan instalasi)", "Markdown (.md)"],
            ["2", "Dokumen Kepatuhan SPBE", "Markdown (.md)"],
            ["3", "Dokumen Audit Trail", "Markdown (.md)"],
            ["4", "Manual Pengguna Bahasa Indonesia", "Markdown (.md)"],
            ["5", "Checklist Keamanan Pre-Deployment", "Markdown (.md)"],
            ["6", "Dokumentasi API/Endpoint", "Markdown (.md)"],
            ["7", "Panduan Deployment", "Markdown (.md)"],
            ["8", "Laporan Audit SPBE", "Markdown (.md)"],
            ["9", "Ringkasan Proyek (Final Summary)", "Markdown (.md)"],
          ].map(([n, d, f]) => new TableRow({ children: [
            cell(n, { w: 700, align: AlignmentType.CENTER }), cell(d, { w: 5060 }), cell(f, { w: 3600, align: AlignmentType.CENTER }),
          ] })),
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== BAB 6 =====
        h1("6. LEMBAR PENGESAHAN"),
        empty(),
        p("Dokumen Rancangan Teknis SIPADU ini telah disusun sebagai eviden butir kegiatan Pranata Komputer dan diajukan untuk penilaian angka kredit periode Januari \u2013 Desember 2026."),
        empty(), empty(),

        // Tanda tangan
        new Table({
          width: { size: CW, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Yang Mengusulkan,", size: 22, font: "Calibri" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Pranata Komputer", size: 22, font: "Calibri", bold: true })] }),
                empty(), empty(), empty(), empty(),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "(.........................................)", size: 22, font: "Calibri" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NIP. .............................", size: 22, font: "Calibri" })] }),
              ] }),
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Mengetahui,", size: 22, font: "Calibri" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Atasan Langsung", size: 22, font: "Calibri", bold: true })] }),
                empty(), empty(), empty(), empty(),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "(.........................................)", size: 22, font: "Calibri" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NIP. .............................", size: 22, font: "Calibri" })] }),
              ] }),
            ] }),
          ],
        }),
        empty(), empty(), empty(),

        // Penilai
        new Table({
          width: { size: CW, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Tim Penilai I,", size: 22, font: "Calibri" })] }),
                empty(), empty(), empty(), empty(),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "(.........................................)", size: 22, font: "Calibri" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NIP. .............................", size: 22, font: "Calibri" })] }),
              ] }),
              new TableCell({ borders: noBorders, width: { size: 4680, type: WidthType.DXA }, children: [
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Tim Penilai II,", size: 22, font: "Calibri" })] }),
                empty(), empty(), empty(), empty(),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "(.........................................)", size: 22, font: "Calibri" })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NIP. .............................", size: 22, font: "Calibri" })] }),
              ] }),
            ] }),
          ],
        }),

        empty(), empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C1, space: 8 } },
          children: [new TextRun({ text: "\u2014 Akhir Dokumen \u2014", size: 22, font: "Georgia", color: CG, italics: true })] }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  const out = "/home/kesekretariatan/project/sipadu/docs/SIPADU_Eviden_Prakom_v1.0.docx";
  fs.writeFileSync(out, buffer);
  console.log("Dokumen berhasil dibuat: " + out);
});
