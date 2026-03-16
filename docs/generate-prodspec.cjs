const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TabStopType, TabStopPosition,
  TableOfContents
} = require("docx");

const CONTENT_WIDTH = 9360;
const C1 = "1B5E20";
const C2 = "2E7D32";
const CL = "E8F5E9";
const CG = "757575";
const CB = "212121";
const CW = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: CW };
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
  return new Paragraph({ spacing: { after: 120, line: 360 }, alignment: AlignmentType.JUSTIFIED,
    children: [new TextRun({ text: t, size: 22, font: "Calibri", color: CB, ...opts })] });
}
function bullet(t) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60, line: 340 },
    children: [new TextRun({ text: t, size: 22, font: "Calibri" })] });
}
function num(t, ref = "numbers") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60, line: 340 },
    children: [new TextRun({ text: t, size: 22, font: "Calibri" })] });
}
function empty() { return new Paragraph({ spacing: { after: 80 }, children: [] }); }

function cell(t, opts = {}) {
  return new TableCell({
    borders, width: { size: opts.w || 2340, type: WidthType.DXA },
    shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
    verticalAlign: "center",
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text: t, size: opts.sz || 20, font: "Calibri", bold: !!opts.b, color: opts.c || CB })] })],
  });
}
function hCell(t, w) { return cell(t, { w, bg: C1, b: true, c: CW, sz: 20, align: AlignmentType.CENTER }); }

function table(cols, header, rows) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({ children: header.map((t, i) => hCell(t, cols[i])) }),
      ...rows.map(row => new TableRow({
        children: row.map((c, i) => {
          if (typeof c === "string") return cell(c, { w: cols[i] });
          return cell(c.t, { w: cols[i], ...c });
        }),
      })),
    ],
  });
}

// --- Helpers for spec tables ---
function specRow(field, type, req, desc) {
  return [
    { t: field, w: 2000, b: true, bg: CL },
    { t: type, w: 1600, align: AlignmentType.CENTER },
    { t: req, w: 1200, align: AlignmentType.CENTER, b: true, c: req === "Ya" ? C1 : CG },
    { t: desc, w: 4560 },
  ];
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
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers4", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers5", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
        alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
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
          children: [new TextRun({ text: "DOKUMEN SPESIFIKASI PRODUK", size: 24, font: "Calibri", color: CG, allCaps: true })] }),
        empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "SIPADU", size: 56, bold: true, font: "Georgia", color: C1 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
          children: [new TextRun({ text: "Sistem Informasi Pengaduan Layanan", size: 30, font: "Georgia", color: C2 })] }),
        empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "Product Specification Document (PSD)", size: 22, font: "Calibri", color: CG, italics: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
          children: [new TextRun({ text: "Spesifikasi Teknis, Fungsional, dan Non-Fungsional", size: 22, font: "Calibri", color: CG })] }),
        empty(), empty(), empty(), empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 6, color: C1, space: 1 } }, spacing: { after: 200 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "Disusun oleh: Tim Teknologi Informasi", size: 20, font: "Calibri", color: CG })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
          children: [new TextRun({ text: "Penajam Paser Utara, 16 Maret 2026", size: 20, font: "Calibri", color: CG })] }),
        new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Versi 1.0 \u2014 RAHASIA", size: 20, bold: true, font: "Calibri", color: C1 })] }),
      ],
    },

    // ========== ISI ==========
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [
        new Paragraph({ children: [new TextRun({ text: "SIPADU \u2014 Spesifikasi Produk", size: 18, font: "Calibri", color: CG, italics: true })],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }] }),
      ] }) },
      footers: { default: new Footer({ children: [
        new Paragraph({ alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: "4CAF50", space: 4 } },
          children: [
            new TextRun({ text: "Pengadilan Agama Penajam \u2014 Halaman ", size: 18, font: "Calibri", color: CG }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Calibri", color: CG }),
          ] }),
      ] }) },
      children: [
        // DAFTAR ISI
        h1("DAFTAR ISI"),
        new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ===== 1. INFORMASI DOKUMEN =====
        h1("1. INFORMASI DOKUMEN"),
        table([3120, 6240], ["Atribut", "Keterangan"], [
          [{ t: "Nama Produk", b: true, bg: CL }, "SIPADU \u2014 Sistem Informasi Pengaduan Layanan"],
          [{ t: "Versi Dokumen", b: true, bg: CL }, "1.0"],
          [{ t: "Tanggal", b: true, bg: CL }, "16 Maret 2026"],
          [{ t: "Instansi", b: true, bg: CL }, "Pengadilan Agama Penajam (Kelas II)"],
          [{ t: "Lokasi", b: true, bg: CL }, "Kab. Penajam Paser Utara, Kalimantan Timur"],
          [{ t: "Klasifikasi", b: true, bg: CL }, "RAHASIA \u2014 Dokumen Internal"],
          [{ t: "Disusun oleh", b: true, bg: CL }, "Tim Teknologi Informasi PA Penajam"],
          [{ t: "Disetujui oleh", b: true, bg: CL }, "(Menunggu persetujuan pimpinan)"],
        ]),
        empty(),

        h2("1.1 Riwayat Revisi"),
        table([1200, 2000, 3160, 3000], ["Versi", "Tanggal", "Perubahan", "Penulis"], [
          ["1.0", "16-03-2026", "Dokumen awal", "Tim TI PA Penajam"],
        ]),
        empty(),

        h2("1.2 Daftar Istilah"),
        table([2400, 6960], ["Istilah", "Definisi"], [
          [{ t: "SIPADU", b: true }, "Sistem Informasi Pengaduan Layanan"],
          [{ t: "SPBE", b: true }, "Sistem Pemerintahan Berbasis Elektronik (Perpres 95/2018)"],
          [{ t: "SLA", b: true }, "Service Level Agreement \u2014 batas waktu penyelesaian layanan"],
          [{ t: "PTSP", b: true }, "Pelayanan Terpadu Satu Pintu"],
          [{ t: "SP4N-LAPOR!", b: true }, "Sistem Pengelolaan Pengaduan Pelayanan Publik Nasional"],
          [{ t: "NIK", b: true }, "Nomor Induk Kependudukan (16 digit)"],
          [{ t: "RBAC", b: true }, "Role-Based Access Control \u2014 kontrol akses berbasis peran"],
          [{ t: "BSSN", b: true }, "Badan Siber dan Sandi Negara"],
          [{ t: "UU PDP", b: true }, "Undang-Undang Pelindungan Data Pribadi (No. 27/2022)"],
          [{ t: "SIPP", b: true }, "Sistem Informasi Penelusuran Perkara"],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 2. DESKRIPSI PRODUK =====
        h1("2. DESKRIPSI PRODUK"),

        h2("2.1 Ringkasan Produk"),
        p("SIPADU adalah aplikasi web untuk mengelola pengaduan masyarakat terhadap layanan Pengadilan Agama Penajam. Aplikasi ini memungkinkan masyarakat mengajukan pengaduan secara daring tanpa kewajiban membuat akun, melacak status pengaduan melalui nomor tiket unik, dan menerima notifikasi otomatis melalui email dan WhatsApp."),
        p("Dari sisi internal, SIPADU menyediakan dashboard berbasis peran (role-based) untuk petugas layanan, panitera, dan administrator, dilengkapi dengan manajemen SLA otomatis, mekanisme eskalasi berjenjang, audit trail yang tidak dapat diubah (immutable), dan kepatuhan terhadap standar SPBE."),

        h2("2.2 Tujuan Produk"),
        num("Mendigitalisasi proses penerimaan dan pengelolaan pengaduan masyarakat;"),
        num("Menyediakan transparansi melalui pelacakan status pengaduan secara real-time;"),
        num("Memastikan kepatuhan SLA sesuai PermenPAN-RB No. 62 Tahun 2018;"),
        num("Memenuhi standar keamanan informasi SPBE dan BSSN;"),
        num("Menyediakan data statistik untuk pelaporan dan akuntabilitas DIPA;"),
        num("Menyiapkan fondasi untuk integrasi SP4N-LAPOR! di masa mendatang."),
        empty(),

        h2("2.3 Target Pengguna"),
        table([1200, 2400, 5760], ["No", "Pengguna", "Deskripsi"], [
          [{ t: "1", align: AlignmentType.CENTER }, { t: "Masyarakat Umum", b: true }, "Pencari keadilan, pihak berperkara, masyarakat umum yang ingin menyampaikan pengaduan terkait layanan PA Penajam"],
          [{ t: "2", align: AlignmentType.CENTER }, { t: "Petugas Layanan (PTSP)", b: true }, "Pegawai PA Penajam yang ditugaskan menangani pengaduan di meja depan"],
          [{ t: "3", align: AlignmentType.CENTER }, { t: "Panitera/Sekretaris", b: true }, "Pejabat struktural yang mengawasi seluruh pengaduan dan melakukan eskalasi"],
          [{ t: "4", align: AlignmentType.CENTER }, { t: "Administrator TI", b: true }, "Pengelola teknis sistem: manajemen pengguna, konfigurasi, audit log"],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 3. SPESIFIKASI FUNGSIONAL =====
        h1("3. SPESIFIKASI FUNGSIONAL"),

        h2("3.1 Modul Pengaduan Publik (Tanpa Login)"),
        h3("FR-01: Formulir Pengaduan Daring"),
        p("Masyarakat dapat mengajukan pengaduan melalui formulir web tanpa kewajiban mendaftar akun. Formulir tersedia di alamat /pengaduan/buat."),
        empty(),
        p("Spesifikasi field formulir:", { bold: true }),
        table([2000, 1600, 1200, 4560], ["Field", "Tipe Data", "Wajib", "Keterangan"],
          [
            specRow("NIK", "TEXT (encrypted)", "Ya", "16 digit, dienkripsi saat penyimpanan (UU PDP)"),
            specRow("Nama Lengkap", "VARCHAR(255)", "Ya", "Sesuai KTP pelapor"),
            specRow("Alamat", "TEXT", "Ya", "Alamat domisili lengkap"),
            specRow("Nomor HP", "VARCHAR(20)", "Ya", "Format Indonesia: 08xx atau +628xx"),
            specRow("Email", "VARCHAR(255)", "Tidak", "Untuk pengiriman notifikasi"),
            specRow("Kategori", "FK (categories)", "Ya", "Dropdown 8 kategori pengaduan"),
            specRow("Judul Pengaduan", "VARCHAR(255)", "Ya", "Ringkasan singkat pengaduan"),
            specRow("Tanggal Kejadian", "DATE", "Ya", "Tidak boleh lebih dari hari ini"),
            specRow("Lokasi Kejadian", "VARCHAR(500)", "Ya", "Lokasi spesifik dalam lingkungan PA"),
            specRow("Uraian Lengkap", "TEXT", "Ya", "Minimal 50 karakter, maksimal 5.000 karakter"),
            specRow("Pihak Dilaporkan", "VARCHAR(255)", "Tidak", "Nama/jabatan/unit yang dilaporkan"),
            specRow("Bukti Pendukung", "FILE[]", "Tidak", "Maks 5 file, masing-masing \u226410MB (JPG/PNG/PDF/DOC/DOCX)"),
            specRow("Laporan Anonim", "BOOLEAN", "Tidak", "Jika aktif, identitas disembunyikan dari pihak terlapor"),
            specRow("Laporan Rahasia", "BOOLEAN", "Tidak", "Jika aktif, seluruh konten hanya terlihat oleh admin/panitera"),
          ]),
        empty(),

        h3("FR-02: Nomor Tiket Otomatis"),
        p("Setiap pengaduan yang berhasil dikirim akan mendapat nomor tiket unik dengan format:"),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 },
          children: [new TextRun({ text: "PA-PNJ-{TAHUN}-{5 DIGIT URUT}", size: 28, bold: true, font: "Consolas", color: C1 })] }),
        p("Contoh: PA-PNJ-2026-00001. Pembangkitan nomor bersifat atomik (menggunakan database locking) untuk mencegah duplikasi pada akses bersamaan. Urutan di-reset setiap pergantian tahun."),

        h3("FR-03: Pelacakan Status Pengaduan"),
        p("Masyarakat dapat melacak status pengaduan tanpa login melalui halaman /pengaduan/cek dengan memasukkan nomor tiket. Informasi yang ditampilkan meliputi: status terkini, timeline perubahan status, dan indikator SLA. Identitas pelapor dan konten rahasia tidak ditampilkan di halaman ini."),

        new Paragraph({ children: [new PageBreak()] }),

        h2("3.2 Modul Dashboard Masyarakat"),
        h3("FR-04: Dashboard Pengaduan Sendiri"),
        p("Pengguna terdaftar (role: masyarakat) dapat melihat daftar seluruh pengaduan yang pernah diajukan beserta status terkini, timeline, dan indikator SLA. Tersedia tombol untuk mengajukan pengaduan baru dengan data diri yang otomatis terisi dari profil."),

        h2("3.3 Modul Dashboard Petugas Layanan"),
        h3("FR-05: Daftar Pengaduan Ditugaskan"),
        p("Petugas layanan melihat daftar pengaduan yang ditugaskan kepadanya, dilengkapi indikator SLA berwarna (hijau/kuning/merah). Petugas dapat memberikan respons dan memperbarui status pengaduan."),

        h2("3.4 Modul Dashboard Panitera"),
        h3("FR-06: Pengawasan Seluruh Pengaduan"),
        p("Panitera dapat melihat seluruh pengaduan dengan filter berdasarkan status, kategori, rentang tanggal, dan petugas. Tersedia fitur penugasan petugas, disposisi (penerusan antar unit), dan eskalasi."),

        h2("3.5 Modul Administrasi"),
        h3("FR-07: Manajemen Pengguna"),
        p("Administrator dapat membuat, mengubah, dan menonaktifkan akun petugas layanan dan panitera. Setiap perubahan tercatat di audit log. Administrator tidak dapat menghapus permanen (soft delete)."),
        h3("FR-08: Manajemen Kategori Pengaduan"),
        p("Administrator dapat menambah, mengubah, dan menonaktifkan kategori pengaduan beserta pengaturan SLA (hari kerja) masing-masing."),
        h3("FR-09: Pengaturan Sistem"),
        p("Konfigurasi yang dapat diubah melalui antarmuka: durasi lockout, batas percobaan login, masa kedaluwarsa kata sandi, aktifasi notifikasi email/WhatsApp, dan token Fonnte."),
        h3("FR-10: Audit Log Viewer"),
        p("Tampilan log audit read-only yang menampilkan seluruh aktivitas sistem: siapa, kapan, dari mana (IP), melakukan apa, terhadap objek apa, dengan nilai sebelum dan sesudah perubahan."),
        h3("FR-11: Kalender Hari Libur"),
        p("Pengelolaan daftar hari libur nasional dan cuti bersama untuk perhitungan SLA yang akurat."),
        h3("FR-12: Laporan dan Ekspor"),
        p("Dashboard statistik: total pengaduan, distribusi per kategori, distribusi per status, tingkat kepatuhan SLA, rata-rata waktu penyelesaian. Data dapat diekspor ke format PDF dan Excel."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 4. ALUR STATUS =====
        h1("4. ALUR STATUS DAN SLA"),

        h2("4.1 Diagram Status Pengaduan"),
        new Paragraph({ spacing: { before: 120, after: 120 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "[Dikirim] \u2192 [Diverifikasi] \u2192 [Ditugaskan] \u2192 [Dalam Proses] \u2192 [Dijawab] \u2192 [Selesai]", size: 20, font: "Consolas", color: C1 })] }),
        new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "                  \u2193                                                                     \u2193", size: 20, font: "Consolas", color: CG }),
          ] }),
        new Paragraph({ spacing: { after: 200 }, alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "            [Ditolak]                                                        [Dibuka Kembali]", size: 20, font: "Consolas", color: CG }),
          ] }),

        h2("4.2 Matriks Transisi Status"),
        table([2000, 2000, 3360, 2000], ["Dari", "Ke", "Kondisi", "Pelaku"], [
          ["Dikirim", "Diverifikasi", "Admin memeriksa kelengkapan", "Admin, Panitera"],
          ["Dikirim", "Ditolak", "Data tidak valid/duplikat", "Admin, Panitera"],
          ["Diverifikasi", "Ditugaskan", "Dipilih petugas penanganan", "Admin, Panitera"],
          ["Ditugaskan", "Dalam Proses", "Petugas mulai menangani", "Petugas"],
          ["Dalam Proses", "Dijawab", "Respons diberikan ke pelapor", "Petugas"],
          ["Dijawab", "Selesai", "Pimpinan menyetujui penutupan", "Admin, Panitera"],
          ["Dijawab", "Dibuka Kembali", "Pelapor keberatan", "Sistem"],
          ["Dibuka Kembali", "Dalam Proses", "Petugas meninjau ulang", "Petugas"],
        ]),
        empty(),

        h2("4.3 Perhitungan SLA"),
        p("SLA dihitung dalam hari kerja, dengan mengecualikan:"),
        bullet("Hari Sabtu dan Minggu;"),
        bullet("Hari libur nasional sesuai SKB 3 Menteri yang terdaftar di tabel holidays;"),
        bullet("Hari cuti bersama yang ditetapkan pemerintah."),
        empty(),
        p("Ambang batas peringatan:", { bold: true }),
        table([3120, 3120, 3120], ["Ambang", "Indikator", "Aksi"], [
          ["< 75% SLA", { t: "HIJAU", b: true, c: C1 }, "Normal \u2014 tidak ada aksi"],
          ["75% \u2013 90% SLA", { t: "KUNING", b: true, c: "F57F17" }, "Notifikasi ke petugas penanganan"],
          ["> 90% SLA", { t: "MERAH", b: true, c: "D32F2F" }, "Eskalasi ke Panitera"],
          ["Terlampaui", { t: "TERLAMBAT", b: true, c: "D32F2F" }, "Eskalasi ke Ketua PA + ditandai merah"],
        ]),
        empty(),

        h2("4.4 Tabel SLA per Kategori"),
        table([1200, 5760, 2400], ["Kode", "Kategori", "SLA (Hari Kerja)"], [
          [{ t: "ADM", b: true }, "Pelayanan Administrasi Perkara", { t: "14", align: AlignmentType.CENTER }],
          [{ t: "KET", b: true }, "Keterlambatan Penanganan Perkara", { t: "14", align: AlignmentType.CENTER }],
          [{ t: "PEG", b: true }, "Perilaku Pegawai/Aparat Pengadilan", { t: "60", align: AlignmentType.CENTER, b: true, c: "D32F2F" }],
          [{ t: "PTSP", b: true }, "Pelayanan PTSP", { t: "14", align: AlignmentType.CENTER }],
          [{ t: "INFO", b: true }, "Pelayanan Informasi", { t: "5", align: AlignmentType.CENTER, b: true, c: "1565C0" }],
          [{ t: "FAS", b: true }, "Fasilitas dan Sarana Pengadilan", { t: "14", align: AlignmentType.CENTER }],
          [{ t: "NIK", b: true }, "Administrasi Pernikahan/Perceraian", { t: "14", align: AlignmentType.CENTER }],
          [{ t: "LAIN", b: true }, "Lainnya", { t: "14", align: AlignmentType.CENTER }],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 5. SPESIFIKASI TEKNIS =====
        h1("5. SPESIFIKASI TEKNIS"),

        h2("5.1 Arsitektur Teknologi"),
        table([3120, 6240], ["Komponen", "Spesifikasi"], [
          [{ t: "Bahasa Backend", b: true, bg: CL }, "PHP 8.3+"],
          [{ t: "Framework Backend", b: true, bg: CL }, "Laravel 12"],
          [{ t: "Bahasa Frontend", b: true, bg: CL }, "TypeScript (strict mode)"],
          [{ t: "Framework Frontend", b: true, bg: CL }, "React 19 melalui Inertia.js v2"],
          [{ t: "Styling", b: true, bg: CL }, "Tailwind CSS"],
          [{ t: "Basis Data", b: true, bg: CL }, "MySQL 8.0+ (charset utf8mb4, collation utf8mb4_unicode_ci)"],
          [{ t: "Autentikasi", b: true, bg: CL }, "Laravel Sanctum (session-based, bukan token)"],
          [{ t: "Otorisasi", b: true, bg: CL }, "Spatie Laravel Permission v6 (RBAC)"],
          [{ t: "Audit Trail", b: true, bg: CL }, "Spatie Activitylog v4 + tabel audit_logs kustom (immutable)"],
          [{ t: "Antrian", b: true, bg: CL }, "Laravel Queue (driver: database, upgradeable ke Redis)"],
          [{ t: "Notifikasi Email", b: true, bg: CL }, "Laravel Notification (queued)"],
          [{ t: "Notifikasi WhatsApp", b: true, bg: CL }, "Fonnte API via custom notification channel"],
          [{ t: "Zona Waktu", b: true, bg: CL }, "Asia/Jakarta (WIB, UTC+8)"],
        ]),
        empty(),

        h2("5.2 Skema Basis Data"),
        p("Sistem menggunakan 10 tabel utama dengan relasi foreign key. Setiap tabel memiliki anotasi klasifikasi data SPBE."),
        empty(),
        table([2400, 1600, 2760, 2600], ["Tabel", "Klasifikasi", "Deskripsi", "Soft Delete"], [
          [{ t: "users", b: true }, "RAHASIA", "Data pengguna sistem", { t: "Ya", c: C1, b: true }],
          [{ t: "complaints", b: true }, "INTERNAL", "Data pengaduan utama", { t: "Ya", c: C1, b: true }],
          [{ t: "complaint_categories", b: true }, "PUBLIK", "Kategori pengaduan", "Tidak"],
          [{ t: "complaint_statuses", b: true }, "INTERNAL", "Riwayat status (timeline)", "Tidak"],
          [{ t: "complaint_attachments", b: true }, "RAHASIA", "Lampiran file (terenkripsi)", "Tidak"],
          [{ t: "complaint_dispositions", b: true }, "INTERNAL", "Catatan disposisi antar unit", "Tidak"],
          [{ t: "audit_logs", b: true }, "RAHASIA", "Log audit (immutable)", { t: "IMMUTABLE", b: true, c: "D32F2F" }],
          [{ t: "system_settings", b: true }, "INTERNAL", "Pengaturan sistem", "Tidak"],
          [{ t: "holidays", b: true }, "PUBLIK", "Kalender hari libur", "Tidak"],
          [{ t: "notifications", b: true }, "INTERNAL", "Riwayat notifikasi terkirim", "Tidak"],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        h2("5.3 Arsitektur Kode"),
        p("Kode backend menggunakan pola Action Classes yang memisahkan logika bisnis ke dalam unit-unit kecil yang dapat diuji secara independen. Controller bersifat tipis (thin controller) dan hanya mendelegasikan ke Action."),
        empty(),
        table([3120, 6240], ["Komponen", "Lokasi & Deskripsi"], [
          [{ t: "Action Classes", b: true, bg: CL }, "app/Actions/ \u2014 logika bisnis utama (CreateComplaint, AssignComplaint, dll.)"],
          [{ t: "Form Requests", b: true, bg: CL }, "app/Http/Requests/ \u2014 validasi input (StoreComplaint, AssignComplaint, dll.)"],
          [{ t: "Controllers", b: true, bg: CL }, "app/Http/Controllers/ \u2014 thin controllers, delegasi ke Actions"],
          [{ t: "Models", b: true, bg: CL }, "app/Models/ \u2014 Eloquent models dengan SoftDeletes dan LogsActivity"],
          [{ t: "Services", b: true, bg: CL }, "app/Services/ \u2014 SlaService, AuditService, EncryptionService"],
          [{ t: "Enums", b: true, bg: CL }, "app/Enums/ \u2014 ComplaintStatusEnum, PriorityEnum, DataClassificationEnum"],
          [{ t: "Middleware", b: true, bg: CL }, "app/Http/Middleware/ \u2014 AuditMiddleware, CheckAccountLockout"],
          [{ t: "Notifications", b: true, bg: CL }, "app/Notifications/ \u2014 4 notifikasi (queued, email + WhatsApp)"],
          [{ t: "Policies", b: true, bg: CL }, "app/Policies/ \u2014 ComplaintPolicy, UserPolicy (RBAC enforcement)"],
          [{ t: "Pages (React)", b: true, bg: CL }, "resources/js/Pages/ \u2014 24 halaman Inertia (TSX)"],
          [{ t: "Components", b: true, bg: CL }, "resources/js/Components/ \u2014 10+ komponen reusable (TSX)"],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 6. SPESIFIKASI KEAMANAN =====
        h1("6. SPESIFIKASI KEAMANAN"),

        h2("6.1 Autentikasi"),
        table([3600, 5760], ["Persyaratan", "Implementasi"], [
          [{ t: "Metode autentikasi", b: true, bg: CL }, "Session-based via Laravel Sanctum (cookie HttpOnly, Secure, SameSite)"],
          [{ t: "Hashing kata sandi", b: true, bg: CL }, "bcrypt (default Laravel, cost factor 12)"],
          [{ t: "Kompleksitas kata sandi", b: true, bg: CL }, "Min 8 karakter, 1 huruf kapital, 1 angka, 1 simbol"],
          [{ t: "Penguncian akun", b: true, bg: CL }, "Otomatis setelah 5 gagal login, durasi 30 menit"],
          [{ t: "Kedaluwarsa kata sandi", b: true, bg: CL }, "Peringatan setelah 90 hari (konfigurasi via system_settings)"],
          [{ t: "Proteksi CSRF", b: true, bg: CL }, "Otomatis via Inertia.js + Sanctum session"],
          [{ t: "Persiapan SSO", b: true, bg: CL }, "Struktur auth dirancang untuk mendukung integrasi SAML2/GovSSO"],
        ]),
        empty(),

        h2("6.2 Otorisasi (RBAC)"),
        p("Sistem menggunakan 4 peran dan 19 permission granular melalui Spatie Laravel Permission:"),
        empty(),
        table([2400, 1740, 1740, 1740, 1740], ["Permission", "Admin", "Panitera", "Petugas", "Masyarakat"], [
          ...[
            ["complaints.create", "\u2713", "\u2713", "\u2713", "\u2713"],
            ["complaints.view.own", "\u2713", "\u2713", "\u2713", "\u2713"],
            ["complaints.view.all", "\u2713", "\u2713", "\u2717", "\u2717"],
            ["complaints.assign", "\u2713", "\u2713", "\u2717", "\u2717"],
            ["complaints.update.status", "\u2713", "\u2713", "\u2713", "\u2717"],
            ["complaints.respond", "\u2713", "\u2713", "\u2713", "\u2717"],
            ["complaints.delete", "\u2713", "\u2717", "\u2717", "\u2717"],
            ["users.manage", "\u2713", "\u2717", "\u2717", "\u2717"],
            ["audit_log.view", "\u2713", "\u2713", "\u2717", "\u2717"],
            ["reports.export", "\u2713", "\u2713", "\u2717", "\u2717"],
            ["settings.manage", "\u2713", "\u2717", "\u2717", "\u2717"],
          ].map(([perm, a, pa, pe, m]) => [
            { t: perm, b: true, bg: CL },
            { t: a, align: AlignmentType.CENTER, c: a === "\u2713" ? C1 : "D32F2F" },
            { t: pa, align: AlignmentType.CENTER, c: pa === "\u2713" ? C1 : "D32F2F" },
            { t: pe, align: AlignmentType.CENTER, c: pe === "\u2713" ? C1 : "D32F2F" },
            { t: m, align: AlignmentType.CENTER, c: m === "\u2713" ? C1 : "D32F2F" },
          ]),
        ]),
        empty(),

        h2("6.3 Proteksi Data"),
        table([3600, 5760], ["Mekanisme", "Detail"], [
          [{ t: "Enkripsi NIK", b: true, bg: CL }, "Laravel Crypt::encrypt() (AES-256-CBC) \u2014 at rest"],
          [{ t: "Enkripsi lampiran", b: true, bg: CL }, "File dienkripsi sebelum disimpan ke disk privat"],
          [{ t: "Checksum file", b: true, bg: CL }, "SHA-256 hash disimpan per lampiran untuk verifikasi integritas"],
          [{ t: "Validasi upload", b: true, bg: CL }, "Server: mimetypes + max 10MB; Client: type + size check"],
          [{ t: "HTTPS/TLS", b: true, bg: CL }, "Wajib di production (min TLS 1.2)"],
          [{ t: "Klasifikasi data", b: true, bg: CL }, "Setiap tabel ditandai: PUBLIK / INTERNAL / RAHASIA"],
          [{ t: "Soft delete", b: true, bg: CL }, "Data utama tidak pernah dihapus permanen (SPBE compliance)"],
          [{ t: "Security headers", b: true, bg: CL }, "CSP, X-Frame-Options, X-Content-Type-Options, HSTS"],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        h2("6.4 Audit Trail"),
        p("Setiap aksi dalam sistem dicatat ke tabel audit_logs yang bersifat immutable (tidak dapat diubah atau dihapus). Skema pencatatan:"),
        empty(),
        table([2400, 6960], ["Field", "Keterangan"], [
          [{ t: "user_id", b: true, bg: CL }, "Identitas pelaku (siapa)"],
          [{ t: "user_ip", b: true, bg: CL }, "Alamat IP sumber (dari mana)"],
          [{ t: "user_agent", b: true, bg: CL }, "Informasi browser/perangkat"],
          [{ t: "action", b: true, bg: CL }, "Jenis aksi: create, read, update, delete, login, logout"],
          [{ t: "subject_type", b: true, bg: CL }, "Tipe objek yang dikenai aksi (Complaint, User, dll.)"],
          [{ t: "subject_id", b: true, bg: CL }, "ID objek yang dikenai aksi"],
          [{ t: "old_values", b: true, bg: CL }, "Nilai sebelum perubahan (JSON)"],
          [{ t: "new_values", b: true, bg: CL }, "Nilai sesudah perubahan (JSON)"],
          [{ t: "request_id", b: true, bg: CL }, "UUID unik per request (header X-Request-ID)"],
          [{ t: "session_id", b: true, bg: CL }, "Identifier sesi pengguna"],
          [{ t: "created_at", b: true, bg: CL }, "Timestamp (WIB) \u2014 satu-satunya kolom waktu (immutable)"],
        ]),
        empty(),
        p("Retensi: log akses minimal 1 tahun, log perubahan data minimal 5 tahun sesuai standar audit pemerintah."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 7. NON-FUNGSIONAL =====
        h1("7. SPESIFIKASI NON-FUNGSIONAL"),
        table([3600, 5760], ["Parameter", "Target"], [
          [{ t: "Waktu respons halaman", b: true, bg: CL }, "< 2 detik untuk setiap halaman"],
          [{ t: "Ketersediaan (uptime)", b: true, bg: CL }, "99,5% per bulan"],
          [{ t: "Pengguna bersamaan", b: true, bg: CL }, "Mendukung 50 pengguna simultan"],
          [{ t: "Retensi data pengaduan", b: true, bg: CL }, "Minimal 5 tahun (soft delete)"],
          [{ t: "Retensi log akses", b: true, bg: CL }, "Minimal 1 tahun"],
          [{ t: "Backup", b: true, bg: CL }, "Harian (otomatis), uji restore bulanan"],
          [{ t: "Kompatibilitas browser", b: true, bg: CL }, "Chrome 90+, Firefox 90+, Safari 14+, Edge 90+"],
          [{ t: "Responsivitas", b: true, bg: CL }, "Mobile-first, fungsionalitas penuh di perangkat mobile"],
          [{ t: "Aksesibilitas", b: true, bg: CL }, "WCAG 2.1 Level AA"],
          [{ t: "Bahasa antarmuka", b: true, bg: CL }, "Bahasa Indonesia (seluruh UI dan pesan error)"],
          [{ t: "Hosting", b: true, bg: CL }, "Data center Indonesia (PP 71/2019)"],
          [{ t: "Cakupan pengujian", b: true, bg: CL }, "Minimal 70% line coverage (90% untuk jalur kritis)"],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 8. NOTIFIKASI =====
        h1("8. SPESIFIKASI NOTIFIKASI"),
        table([3600, 2160, 3600], ["Event Pemicu", "Penerima", "Kanal"], [
          ["Pengaduan berhasil dikirim", "Pelapor", "Email + WhatsApp"],
          ["Status pengaduan berubah", "Pelapor", "Email + WhatsApp"],
          ["Pengaduan ditugaskan ke petugas", "Petugas", "Email"],
          ["Peringatan SLA 75%", "Petugas penanganan", "Email"],
          ["Peringatan SLA 90%", "Panitera", "Email"],
          ["SLA terlampaui", "Panitera + Admin", "Email"],
          ["Pengaduan baru masuk", "Admin / Panitera", "Email"],
        ]),
        empty(),
        p("Seluruh notifikasi diproses secara asinkron melalui Laravel Queue untuk menghindari keterlambatan respons sistem. WhatsApp menggunakan Fonnte API yang memerlukan konfigurasi token di system_settings."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 9. KEPATUHAN REGULASI =====
        h1("9. KEPATUHAN REGULASI"),
        table([3600, 5760], ["Regulasi", "Status Kepatuhan"], [
          [{ t: "Perpres 95/2018 (SPBE)", b: true, bg: CL }, "94,6% item MUST terpenuhi \u2014 arsitektur, keamanan, audit trail"],
          [{ t: "BSSN 4/2021", b: true, bg: CL }, "Terpenuhi \u2014 9 domain keamanan aplikasi web"],
          [{ t: "PP 71/2019 (Residensi Data)", b: true, bg: CL }, "Terpenuhi \u2014 hosting wajib di Indonesia"],
          [{ t: "UU PDP 27/2022", b: true, bg: CL }, "Terpenuhi \u2014 enkripsi NIK, klasifikasi data, soft delete"],
          [{ t: "SK KMA 026/2012", b: true, bg: CL }, "Terpenuhi \u2014 mekanisme pengaduan terstandar"],
          [{ t: "PERMA 9/2016", b: true, bg: CL }, "Terpenuhi \u2014 pelacakan status, perlindungan identitas pelapor"],
          [{ t: "PermenPAN-RB 62/2018", b: true, bg: CL }, "Terpenuhi \u2014 SLA maks 60 hari, eskalasi berjenjang"],
          [{ t: "SNI ISO 27001", b: true, bg: CL }, "Sebagian \u2014 kontrol teknis terpenuhi, sertifikasi formal belum dilakukan"],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== 10. LAMPIRAN =====
        h1("10. LAMPIRAN"),

        h2("10.1 Daftar Endpoint Sistem"),
        h3("Endpoint Publik (Tanpa Autentikasi)"),
        table([1600, 3360, 4400], ["Metode", "URL", "Deskripsi"], [
          [{ t: "GET", b: true, c: "1565C0" }, "/", "Halaman utama (landing page)"],
          [{ t: "GET", b: true, c: "1565C0" }, "/pengaduan/buat", "Formulir pengaduan"],
          [{ t: "POST", b: true, c: C1 }, "/pengaduan", "Kirim pengaduan baru"],
          [{ t: "GET", b: true, c: "1565C0" }, "/pengaduan/cek", "Halaman lacak pengaduan"],
          [{ t: "POST", b: true, c: C1 }, "/pengaduan/cek", "Cari berdasarkan nomor tiket"],
        ]),
        empty(),
        h3("Endpoint Terautentikasi"),
        table([1600, 4760, 3000], ["Metode", "URL", "Peran Minimum"], [
          [{ t: "GET", b: true, c: "1565C0" }, "/dashboard", "masyarakat"],
          [{ t: "GET", b: true, c: "1565C0" }, "/petugas/dashboard", "petugas_layanan"],
          [{ t: "PATCH", b: true, c: "F57F17" }, "/petugas/pengaduan/{id}/status", "petugas_layanan"],
          [{ t: "GET", b: true, c: "1565C0" }, "/panitera/dashboard", "panitera"],
          [{ t: "POST", b: true, c: C1 }, "/panitera/pengaduan/{id}/assign", "panitera"],
          [{ t: "POST", b: true, c: C1 }, "/panitera/pengaduan/{id}/disposisi", "panitera"],
          [{ t: "GET", b: true, c: "1565C0" }, "/admin/dashboard", "admin"],
          [{ t: "CRUD", b: true, c: "7B1FA2" }, "/admin/users/*", "admin"],
          [{ t: "CRUD", b: true, c: "7B1FA2" }, "/admin/categories/*", "admin"],
          [{ t: "GET", b: true, c: "1565C0" }, "/admin/audit-logs", "admin"],
          [{ t: "GET/PUT", b: true, c: "F57F17" }, "/admin/settings", "admin"],
        ]),
        empty(),

        h2("10.2 Kebutuhan Infrastruktur"),
        table([3120, 6240], ["Komponen", "Spesifikasi"], [
          [{ t: "CPU", b: true, bg: CL }, "2 vCPU minimum"],
          [{ t: "RAM", b: true, bg: CL }, "4 GB minimum"],
          [{ t: "Storage", b: true, bg: CL }, "40 GB SSD (scalable)"],
          [{ t: "OS", b: true, bg: CL }, "Ubuntu 22.04 LTS / Debian 12"],
          [{ t: "Web Server", b: true, bg: CL }, "Nginx 1.24+"],
          [{ t: "PHP", b: true, bg: CL }, "8.3+ (bcmath, ctype, curl, dom, fileinfo, mbstring, openssl, pdo_mysql)"],
          [{ t: "MySQL", b: true, bg: CL }, "8.0+ (utf8mb4)"],
          [{ t: "Node.js", b: true, bg: CL }, "20+ (build frontend)"],
          [{ t: "SSL", b: true, bg: CL }, "Let\u2019s Encrypt atau CA terpercaya (TLS 1.2+)"],
          [{ t: "Supervisor", b: true, bg: CL }, "Untuk menjalankan queue worker"],
        ]),

        empty(), empty(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C1, space: 8 } },
          children: [new TextRun({ text: "\u2014 Akhir Dokumen \u2014", size: 22, font: "Georgia", color: CG, italics: true })] }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  const out = "/home/kesekretariatan/project/sipadu/docs/SIPADU_Product_Specification_v1.0.docx";
  fs.writeFileSync(out, buffer);
  console.log("Dokumen berhasil dibuat: " + out);
});
