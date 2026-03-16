const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TabStopType, TabStopPosition,
  TableOfContents
} = require("docx");

// --- Konstanta ---
const PAGE_WIDTH = 12240; // A4-ish
const MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 9360 DXA
const COLOR_PRIMARY = "1B5E20";   // Hijau tua (identitas PA)
const COLOR_SECONDARY = "2E7D32";
const COLOR_ACCENT = "4CAF50";
const COLOR_LIGHT = "E8F5E9";
const COLOR_GRAY = "757575";
const COLOR_BLACK = "212121";
const COLOR_WHITE = "FFFFFF";
const DATE_NOW = "16 Maret 2026";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: COLOR_WHITE };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// --- Helper Functions ---
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Georgia", color: COLOR_PRIMARY })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Georgia", color: COLOR_SECONDARY })],
  });
}

function heading3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, font: "Calibri", color: COLOR_PRIMARY })],
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, size: 22, font: "Calibri", color: COLOR_BLACK, ...opts })],
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 80 }, children: [] });
}

function makeCell(text, opts = {}) {
  return new TableCell({
    borders,
    width: { size: opts.width || 2340, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    verticalAlign: "center",
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: opts.align || AlignmentType.LEFT,
        children: [new TextRun({ text, size: opts.size || 20, font: "Calibri", bold: !!opts.bold, color: opts.color || COLOR_BLACK })],
      }),
    ],
  });
}

function makeHeaderCell(text, width) {
  return makeCell(text, { width, shading: COLOR_PRIMARY, bold: true, color: COLOR_WHITE, size: 20, align: AlignmentType.CENTER });
}

// --- Document ---
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Georgia", color: COLOR_PRIMARY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Georgia", color: COLOR_SECONDARY },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "letters",
        levels: [{
          level: 0, format: LevelFormat.LOWER_LETTER, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    // ============================
    // HALAMAN SAMPUL
    // ============================
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        emptyLine(), emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({ text: "PENGADILAN AGAMA PENAJAM", size: 28, bold: true, font: "Georgia", color: COLOR_PRIMARY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [new TextRun({ text: "KELAS II \u2014 KALIMANTAN TIMUR", size: 22, font: "Calibri", color: COLOR_GRAY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_PRIMARY, space: 1 } },
          spacing: { after: 200 },
          children: [],
        }),
        emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: "DOKUMEN RANCANGAN", size: 24, font: "Calibri", color: COLOR_GRAY, allCaps: true })],
        }),
        emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "SIPADU", size: 56, bold: true, font: "Georgia", color: COLOR_PRIMARY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Sistem Informasi Pengaduan Layanan", size: 30, font: "Georgia", color: COLOR_SECONDARY })],
        }),
        emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "Implementasi Layanan Pengaduan Elektronik", size: 22, font: "Calibri", color: COLOR_GRAY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "Berbasis Web Sesuai Standar SPBE", size: 22, font: "Calibri", color: COLOR_GRAY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "(Perpres No. 95 Tahun 2018)", size: 22, font: "Calibri", color: COLOR_GRAY })],
        }),
        emptyLine(), emptyLine(), emptyLine(), emptyLine(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: COLOR_PRIMARY, space: 1 } },
          children: [],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [new TextRun({ text: "Disusun oleh: Tim Teknologi Informasi", size: 20, font: "Calibri", color: COLOR_GRAY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
          children: [new TextRun({ text: `Penajam Paser Utara, ${DATE_NOW}`, size: 20, font: "Calibri", color: COLOR_GRAY })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Versi 1.0 \u2014 RAHASIA", size: 20, bold: true, font: "Calibri", color: COLOR_PRIMARY })],
        }),
      ],
    },

    // ============================
    // DAFTAR ISI + ISI DOKUMEN
    // ============================
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "SIPADU \u2014 Dokumen Rancangan", size: 18, font: "Calibri", color: COLOR_GRAY, italics: true }),
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: COLOR_ACCENT, space: 4 } },
              children: [
                new TextRun({ text: "Pengadilan Agama Penajam \u2014 Halaman ", size: 18, font: "Calibri", color: COLOR_GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Calibri", color: COLOR_GRAY }),
              ],
            }),
          ],
        }),
      },
      children: [
        // DAFTAR ISI
        heading1("DAFTAR ISI"),
        new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ============================
        // BAB I. PENDAHULUAN
        // ============================
        heading1("I. PENDAHULUAN"),

        heading2("1.1 Latar Belakang"),
        bodyText("Pengadilan Agama Penajam sebagai lembaga peradilan tingkat pertama di bawah Pengadilan Tinggi Agama Samarinda memiliki kewajiban untuk menyediakan layanan peradilan yang berkualitas, transparan, dan akuntabel kepada masyarakat pencari keadilan. Kewajiban ini diamanatkan secara tegas melalui SK KMA No. 026/KMA/SK/II/2012 tentang Standar Pelayanan Peradilan yang mewajibkan setiap satuan kerja pengadilan untuk memiliki mekanisme penanganan pengaduan yang jelas."),
        bodyText("Saat ini, pengelolaan pengaduan masyarakat di Pengadilan Agama Penajam masih dilakukan secara manual melalui kotak saran, formulir kertas, atau penyampaian lisan. Metode ini memiliki beberapa kelemahan mendasar, antara lain: tidak adanya pencatatan yang terstruktur, ketidakmampuan melacak status penanganan pengaduan, risiko kehilangan data pengaduan, serta tidak terpenuhinya standar Service Level Agreement (SLA) yang ditetapkan dalam PermenPAN-RB No. 62 Tahun 2018."),
        bodyText("Di sisi lain, Pemerintah Republik Indonesia melalui Perpres No. 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik (SPBE) mewajibkan seluruh instansi pemerintah, termasuk lembaga peradilan, untuk mendigitalisasi layanan publik guna meningkatkan efisiensi, transparansi, dan akuntabilitas. Lebih lanjut, Perpres No. 95 Tahun 2019 mewajibkan integrasi seluruh kanal pengaduan instansi dengan SP4N-LAPOR! sebagai sistem pengelolaan pengaduan nasional."),
        bodyText("Berdasarkan kondisi tersebut, dipandang perlu untuk membangun Sistem Informasi Pengaduan Layanan (SIPADU) sebagai solusi terintegrasi yang memenuhi standar regulasi nasional sekaligus meningkatkan kualitas pelayanan pengaduan di Pengadilan Agama Penajam."),

        heading2("1.2 Dasar Hukum"),
        ...[
          ["1.", "Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik"],
          ["2.", "Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik"],
          ["3.", "Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi"],
          ["4.", "Peraturan Presiden Nomor 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik (SPBE)"],
          ["5.", "Peraturan Presiden Nomor 95 Tahun 2019 tentang Pengelolaan Pengaduan Pelayanan Publik Nasional"],
          ["6.", "Peraturan Pemerintah Nomor 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik"],
          ["7.", "SK KMA No. 026/KMA/SK/II/2012 tentang Standar Pelayanan Peradilan"],
          ["8.", "PERMA Nomor 9 Tahun 2016 tentang Pedoman Penanganan Pengaduan (Whistleblowing System)"],
          ["9.", "PermenPAN-RB Nomor 62 Tahun 2018 tentang Pengelolaan Pengaduan Pelayanan Publik"],
          ["10.", "Peraturan BSSN Nomor 4 Tahun 2021 tentang Pedoman Manajemen Keamanan Informasi SPBE"],
          ["11.", "SK Dirjen Badilag No. 1403.b/DJA/SK/OT.01.3/8/2018 tentang Pedoman Standar PTSP"],
        ].map(([num, text]) =>
          new Paragraph({
            spacing: { after: 60, line: 340 },
            indent: { left: 360 },
            children: [
              new TextRun({ text: num + " ", size: 22, font: "Calibri", bold: true }),
              new TextRun({ text, size: 22, font: "Calibri" }),
            ],
          })
        ),

        heading2("1.3 Maksud dan Tujuan"),
        heading3("Maksud"),
        bodyText("Dokumen ini disusun sebagai rancangan teknis pembangunan Sistem Informasi Pengaduan Layanan (SIPADU) yang akan diimplementasikan di lingkungan Pengadilan Agama Penajam untuk mengelola pengaduan masyarakat secara digital, terstruktur, dan akuntabel."),
        heading3("Tujuan"),
        ...[
          "Menyediakan kanal pengaduan digital yang dapat diakses masyarakat selama 24 jam tanpa terkendala waktu dan lokasi;",
          "Mewujudkan pengelolaan pengaduan yang transparan dengan sistem pelacakan status secara real-time;",
          "Memenuhi standar Service Level Agreement (SLA) sesuai ketentuan PermenPAN-RB No. 62 Tahun 2018;",
          "Menyediakan audit trail yang komprehensif sebagai bentuk akuntabilitas penanganan pengaduan;",
          "Memenuhi persyaratan kepatuhan SPBE (Perpres No. 95 Tahun 2018) termasuk klasifikasi data, keamanan informasi, dan interoperabilitas;",
          "Menyiapkan infrastruktur untuk integrasi dengan SP4N-LAPOR! di masa mendatang.",
        ].map(text =>
          new Paragraph({
            numbering: { reference: "numbers", level: 0 },
            spacing: { after: 60, line: 340 },
            children: [new TextRun({ text, size: 22, font: "Calibri" })],
          })
        ),

        heading2("1.4 Ruang Lingkup"),
        bodyText("SIPADU mencakup pengelolaan pengaduan masyarakat terkait 8 (delapan) kategori layanan Pengadilan Agama, meliputi: Pelayanan Administrasi Perkara, Keterlambatan Penanganan Perkara, Perilaku Pegawai, Pelayanan PTSP, Pelayanan Informasi, Fasilitas Pengadilan, Administrasi Pernikahan/Perceraian, dan kategori lainnya. Sistem ini dapat diakses oleh masyarakat umum tanpa kewajiban mendaftar akun dan dikelola secara internal oleh petugas layanan, panitera, dan administrator."),

        new Paragraph({ children: [new PageBreak()] }),

        // ============================
        // BAB II. GAMBARAN UMUM SISTEM
        // ============================
        heading1("II. GAMBARAN UMUM SISTEM"),

        heading2("2.1 Deskripsi Sistem"),
        bodyText("SIPADU (Sistem Informasi Pengaduan Layanan) adalah aplikasi berbasis web yang dirancang khusus untuk mengelola siklus penuh pengaduan masyarakat di Pengadilan Agama Penajam. Sistem ini memungkinkan masyarakat untuk mengajukan pengaduan secara daring, melacak status penanganan melalui nomor tiket, dan menerima pemberitahuan melalui email maupun WhatsApp."),
        bodyText("Dari sisi internal, SIPADU menyediakan dashboard bagi petugas layanan untuk menangani pengaduan yang ditugaskan, bagi panitera untuk mengawasi seluruh pengaduan dan melakukan eskalasi, serta bagi administrator untuk mengelola pengguna, kategori, dan konfigurasi sistem. Seluruh aktivitas tercatat dalam audit trail yang tidak dapat diubah (immutable) sebagai bagian dari kepatuhan SPBE."),

        heading2("2.2 Arsitektur Teknologi"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [makeHeaderCell("Komponen", 3120), makeHeaderCell("Teknologi", 6240)] }),
            ...([
              ["Backend Framework", "Laravel 12 (PHP 8.3+)"],
              ["Frontend Framework", "React 19 (TypeScript) melalui Inertia.js v2"],
              ["Desain Antarmuka", "Tailwind CSS"],
              ["Basis Data", "MySQL 8.0+ (charset utf8mb4)"],
              ["Autentikasi", "Laravel Sanctum (session-based)"],
              ["Otorisasi", "Spatie Laravel Permission v6"],
              ["Audit Trail", "Spatie Activitylog v4 + tabel audit_logs kustom"],
              ["Notifikasi", "Laravel Queue (Email) + Fonnte API (WhatsApp)"],
              ["Keamanan File", "Enkripsi at-rest (Laravel Crypt) + SHA-256 checksum"],
            ]).map(([k, v]) =>
              new TableRow({ children: [
                makeCell(k, { width: 3120, bold: true, shading: COLOR_LIGHT }),
                makeCell(v, { width: 6240 }),
              ] })
            ),
          ],
        }),
        emptyLine(),

        heading2("2.3 Peran Pengguna"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1560, 2400, 5400],
          rows: [
            new TableRow({ children: [makeHeaderCell("No", 1560), makeHeaderCell("Peran", 2400), makeHeaderCell("Hak Akses", 5400)] }),
            ...[
              ["1", "Masyarakat", "Mengajukan pengaduan (tanpa login), melacak status, melihat riwayat pengaduan sendiri (dengan login)"],
              ["2", "Petugas Layanan", "Menangani pengaduan yang ditugaskan, memperbarui status, memberikan respons"],
              ["3", "Panitera", "Mengawasi seluruh pengaduan, menugaskan petugas, melakukan eskalasi dan disposisi"],
              ["4", "Administrator", "Akses penuh: kelola pengguna, kategori, pengaturan sistem, audit log, laporan"],
            ].map(([no, role, access]) =>
              new TableRow({ children: [
                makeCell(no, { width: 1560, align: AlignmentType.CENTER }),
                makeCell(role, { width: 2400, bold: true }),
                makeCell(access, { width: 5400 }),
              ] })
            ),
          ],
        }),
        emptyLine(),

        heading2("2.4 Kategori Pengaduan dan SLA"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [900, 1200, 4860, 2400],
          rows: [
            new TableRow({ children: [
              makeHeaderCell("No", 900), makeHeaderCell("Kode", 1200),
              makeHeaderCell("Kategori", 4860), makeHeaderCell("SLA (Hari Kerja)", 2400),
            ] }),
            ...[
              ["1", "ADM", "Pelayanan Administrasi Perkara", "14"],
              ["2", "KET", "Keterlambatan Penanganan Perkara", "14"],
              ["3", "PEG", "Perilaku Pegawai/Aparat Pengadilan", "60"],
              ["4", "PTSP", "Pelayanan PTSP", "14"],
              ["5", "INFO", "Pelayanan Informasi", "5"],
              ["6", "FAS", "Fasilitas dan Sarana Pengadilan", "14"],
              ["7", "NIK", "Administrasi Pernikahan/Perceraian", "14"],
              ["8", "LAIN", "Lainnya", "14"],
            ].map(([no, code, name, sla]) =>
              new TableRow({ children: [
                makeCell(no, { width: 900, align: AlignmentType.CENTER }),
                makeCell(code, { width: 1200, bold: true, align: AlignmentType.CENTER }),
                makeCell(name, { width: 4860 }),
                makeCell(sla, { width: 2400, align: AlignmentType.CENTER }),
              ] })
            ),
          ],
        }),
        emptyLine(),
        bodyText("Catatan: SLA untuk kategori PEG (Perilaku Pegawai) ditetapkan 60 hari kerja karena termasuk pengaduan berkadar pengawasan yang memerlukan investigasi mendalam, sesuai standar SP4N-LAPOR!. Kategori INFO ditetapkan 5 hari kerja sesuai standar permintaan informasi publik."),

        new Paragraph({ children: [new PageBreak()] }),

        // ============================
        // BAB III. ALUR PENGADUAN
        // ============================
        heading1("III. ALUR PROSES PENGADUAN"),

        heading2("3.1 Alur Status Pengaduan"),
        bodyText("Setiap pengaduan melalui serangkaian status yang terstruktur sebagai berikut:"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [900, 2160, 3900, 2400],
          rows: [
            new TableRow({ children: [
              makeHeaderCell("No", 900), makeHeaderCell("Status", 2160),
              makeHeaderCell("Deskripsi", 3900), makeHeaderCell("Pelaku", 2400),
            ] }),
            ...[
              ["1", "Dikirim (Submitted)", "Pengaduan baru masuk ke sistem", "Sistem (otomatis)"],
              ["2", "Diverifikasi (Verified)", "Admin/Panitera memeriksa kelengkapan data", "Admin, Panitera"],
              ["3", "Ditugaskan (Assigned)", "Pengaduan dialihkan ke petugas penanganan", "Admin, Panitera"],
              ["4", "Dalam Proses (In Progress)", "Petugas sedang menangani pengaduan", "Petugas Layanan"],
              ["5", "Dijawab (Responded)", "Jawaban telah diberikan kepada pelapor", "Petugas Layanan"],
              ["6", "Selesai (Resolved)", "Pengaduan dinyatakan selesai", "Admin, Panitera"],
              ["7", "Ditolak (Rejected)", "Pengaduan tidak valid atau duplikat", "Admin, Panitera"],
              ["8", "Dibuka Kembali (Reopened)", "Pelapor keberatan atas jawaban", "Sistem"],
            ].map(([no, status, desc, actor]) =>
              new TableRow({ children: [
                makeCell(no, { width: 900, align: AlignmentType.CENTER }),
                makeCell(status, { width: 2160, bold: true }),
                makeCell(desc, { width: 3900 }),
                makeCell(actor, { width: 2400 }),
              ] })
            ),
          ],
        }),

        emptyLine(),
        heading2("3.2 Mekanisme SLA dan Eskalasi"),
        bodyText("Sistem secara otomatis menghitung batas waktu penyelesaian (SLA deadline) berdasarkan hari kerja, dengan mengeluarkan hari Sabtu, Minggu, dan hari libur nasional dari perhitungan. Mekanisme eskalasi berjenjang diterapkan sebagai berikut:"),
        ...[
          "Peringatan 75%: Notifikasi kepada petugas penanganan bahwa waktu penyelesaian telah mencapai 75% dari batas SLA;",
          "Peringatan 90%: Notifikasi eskalasi kepada Panitera/Sekretaris;",
          "Terlampaui (Overdue): Eskalasi otomatis kepada Ketua Pengadilan; pengaduan ditandai merah pada dashboard;",
          "60 Hari tanpa penyelesaian: Pelapor diinformasikan mengenai hak untuk melaporkan ke Ombudsman RI.",
        ].map(text =>
          new Paragraph({
            numbering: { reference: "bullets", level: 0 },
            spacing: { after: 60, line: 340 },
            children: [new TextRun({ text, size: 22, font: "Calibri" })],
          })
        ),

        heading2("3.3 Notifikasi"),
        bodyText("SIPADU mengirimkan pemberitahuan melalui dua kanal utama: email (melalui Laravel Queue) dan WhatsApp (melalui Fonnte API). Notifikasi dikirimkan pada setiap perubahan status pengaduan, peringatan SLA, dan penugasan baru."),

        new Paragraph({ children: [new PageBreak()] }),

        // ============================
        // BAB IV. KEPATUHAN SPBE
        // ============================
        heading1("IV. KEPATUHAN SPBE"),

        heading2("4.1 Ringkasan Kepatuhan"),
        bodyText("SIPADU dirancang dengan mengacu pada ketentuan Perpres No. 95 Tahun 2018 tentang SPBE, Peraturan BSSN No. 4 Tahun 2021 tentang Standar Keamanan Aplikasi, serta PP No. 71 Tahun 2019 tentang Residensi Data. Hasil audit kepatuhan terhadap 69 item checklist SPBE menunjukkan hasil sebagai berikut:"),

        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [
            new TableRow({ children: [makeHeaderCell("Status", 3120), makeHeaderCell("Jumlah Item", 3120), makeHeaderCell("Persentase", 3120)] }),
            ...[
              ["COMPLIANT (Terpenuhi)", "62", "89,9%"],
              ["PARTIAL (Sebagian)", "3", "4,3%"],
              ["NOT APPLICABLE", "1", "1,4%"],
              ["PENDING (Belum)", "3", "4,3%"],
            ].map(([s, c, p]) =>
              new TableRow({ children: [
                makeCell(s, { width: 3120, bold: true }),
                makeCell(c, { width: 3120, align: AlignmentType.CENTER }),
                makeCell(p, { width: 3120, align: AlignmentType.CENTER }),
              ] })
            ),
            new TableRow({ children: [
              makeCell("TOTAL", { width: 3120, bold: true, shading: COLOR_LIGHT }),
              makeCell("69", { width: 3120, align: AlignmentType.CENTER, bold: true, shading: COLOR_LIGHT }),
              makeCell("100%", { width: 3120, align: AlignmentType.CENTER, bold: true, shading: COLOR_LIGHT }),
            ] }),
          ],
        }),
        emptyLine(),
        bodyText("Tingkat kepatuhan terhadap item wajib (MUST) mencapai 94,6%, yang menunjukkan bahwa SIPADU telah memenuhi sebagian besar persyaratan keamanan dan tata kelola SPBE."),

        heading2("4.2 Domain Kepatuhan"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [4680, 2340, 2340],
          rows: [
            new TableRow({ children: [makeHeaderCell("Domain", 4680), makeHeaderCell("Item MUST", 2340), makeHeaderCell("Status", 2340)] }),
            ...[
              ["Arsitektur SPBE", "4", "Terpenuhi"],
              ["Autentikasi dan Kontrol Akses", "7", "Terpenuhi"],
              ["Proteksi Data", "12", "Terpenuhi"],
              ["Audit Trail", "11", "Terpenuhi"],
              ["Infrastruktur", "4", "Terpenuhi"],
              ["Layanan dan SLA", "8", "Terpenuhi"],
              ["Aksesibilitas", "5", "Sebagian"],
              ["Dokumentasi", "7", "Terpenuhi"],
            ].map(([d, c, s]) =>
              new TableRow({ children: [
                makeCell(d, { width: 4680 }),
                makeCell(c, { width: 2340, align: AlignmentType.CENTER }),
                makeCell(s, { width: 2340, align: AlignmentType.CENTER, bold: true,
                  color: s === "Terpenuhi" ? COLOR_SECONDARY : "E65100" }),
              ] })
            ),
          ],
        }),

        heading2("4.3 Fitur Keamanan"),
        ...[
          "Enkripsi NIK pelapor menggunakan Laravel Crypt (at-rest encryption) sesuai UU PDP No. 27/2022;",
          "Autentikasi berbasis sesi (session-based) dengan proteksi CSRF otomatis;",
          "Kebijakan kata sandi kuat: minimal 8 karakter, huruf kapital, angka, dan simbol;",
          "Penguncian akun otomatis setelah 5 kali gagal login (durasi 30 menit);",
          "Pencatatan setiap aktivitas ke tabel audit_logs yang bersifat immutable (tidak dapat diubah/dihapus);",
          "Validasi file upload: tipe MIME, ukuran maksimal 10MB, checksum SHA-256;",
          "File lampiran disimpan dalam kondisi terenkripsi pada penyimpanan privat;",
          "Soft delete pada seluruh model utama (data tidak pernah dihapus permanen);",
          "Klasifikasi data pada setiap tabel (publik/internal/rahasia) sesuai Perpres 95/2018.",
        ].map(text =>
          new Paragraph({
            numbering: { reference: "bullets", level: 0 },
            spacing: { after: 60, line: 340 },
            children: [new TextRun({ text, size: 22, font: "Calibri" })],
          })
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ============================
        // BAB V. KEBUTUHAN SUMBER DAYA
        // ============================
        heading1("V. KEBUTUHAN SUMBER DAYA"),

        heading2("5.1 Kebutuhan Infrastruktur Server"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [makeHeaderCell("Komponen", 3120), makeHeaderCell("Spesifikasi Minimum", 6240)] }),
            ...[
              ["Prosesor", "2 vCPU (Intel/AMD x86_64)"],
              ["Memori (RAM)", "4 GB"],
              ["Penyimpanan", "40 GB SSD (dapat ditingkatkan sesuai volume lampiran)"],
              ["Sistem Operasi", "Ubuntu 22.04 LTS / Debian 12"],
              ["Web Server", "Nginx 1.24+"],
              ["PHP", "PHP 8.3+ dengan ekstensi: bcmath, ctype, curl, dom, fileinfo, mbstring, openssl, pdo_mysql"],
              ["Basis Data", "MySQL 8.0+ (charset utf8mb4)"],
              ["Node.js", "Node.js 20+ (untuk build frontend)"],
              ["SSL/TLS", "Sertifikat SSL (Let\u2019s Encrypt atau CA terpercaya)"],
            ].map(([k, v]) =>
              new TableRow({ children: [
                makeCell(k, { width: 3120, bold: true, shading: COLOR_LIGHT }),
                makeCell(v, { width: 6240 }),
              ] })
            ),
          ],
        }),
        emptyLine(),

        heading2("5.2 Hosting (Kepatuhan Residensi Data)"),
        bodyText("Sesuai PP No. 71 Tahun 2019, Penyelenggara Sistem Elektronik Lingkup Publik wajib menempatkan pusat data di wilayah Indonesia. Berikut rekomendasi penyedia layanan hosting:"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [2340, 4680, 2340],
          rows: [
            new TableRow({ children: [makeHeaderCell("Penyedia", 2340), makeHeaderCell("Keunggulan", 4680), makeHeaderCell("Estimasi Biaya/Bulan", 2340)] }),
            ...[
              ["Biznet Gio Cloud", "Cloud Indonesia, sertifikasi SNI 27001, data center Tier III", "Rp 300.000 - 500.000"],
              ["IDCloudHost", "Penyedia lokal, data center Jakarta & Surabaya", "Rp 200.000 - 400.000"],
              ["Telkom Sigma", "Government-grade, digunakan banyak kementerian", "Rp 500.000 - 1.000.000"],
              ["PDN (Pusat Data Nasional)", "Gratis untuk instansi pemerintah (jika tersedia)", "Gratis"],
            ].map(([p, k, b]) =>
              new TableRow({ children: [
                makeCell(p, { width: 2340, bold: true }),
                makeCell(k, { width: 4680 }),
                makeCell(b, { width: 2340, align: AlignmentType.CENTER }),
              ] })
            ),
          ],
        }),

        heading2("5.3 Kebutuhan SDM"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [900, 3120, 5340],
          rows: [
            new TableRow({ children: [makeHeaderCell("No", 900), makeHeaderCell("Peran", 3120), makeHeaderCell("Tanggung Jawab", 5340)] }),
            ...[
              ["1", "Administrator Sistem", "Pemeliharaan server, backup, monitoring, manajemen pengguna"],
              ["2", "Petugas PTSP (2 orang)", "Menangani pengaduan yang masuk, memberikan respons, memperbarui status"],
              ["3", "Panitera/Sekretaris", "Pengawasan keseluruhan, eskalasi, disposisi"],
            ].map(([no, role, resp]) =>
              new TableRow({ children: [
                makeCell(no, { width: 900, align: AlignmentType.CENTER }),
                makeCell(role, { width: 3120, bold: true }),
                makeCell(resp, { width: 5340 }),
              ] })
            ),
          ],
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ============================
        // BAB VI. RENCANA PENGEMBANGAN
        // ============================
        heading1("VI. RENCANA PENGEMBANGAN"),

        heading2("6.1 Tahapan Implementasi"),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [1200, 2760, 5400],
          rows: [
            new TableRow({ children: [makeHeaderCell("Tahap", 1200), makeHeaderCell("Periode", 2760), makeHeaderCell("Kegiatan", 5400)] }),
            ...[
              ["I", "Bulan 1-2", "Pengembangan sistem inti: backend, frontend, autentikasi, pengujian"],
              ["II", "Bulan 3", "User Acceptance Test (UAT), perbaikan bug, pelatihan pengguna internal"],
              ["III", "Bulan 4", "Deployment ke server produksi, migrasi data, soft-launch"],
              ["IV", "Bulan 5-6", "Pemantauan operasional, perbaikan berdasarkan masukan, optimasi performa"],
            ].map(([t, p, k]) =>
              new TableRow({ children: [
                makeCell(t, { width: 1200, align: AlignmentType.CENTER, bold: true }),
                makeCell(p, { width: 2760 }),
                makeCell(k, { width: 5400 }),
              ] })
            ),
          ],
        }),
        emptyLine(),

        heading2("6.2 Pengembangan Lanjutan"),
        bodyText("Setelah implementasi tahap awal, beberapa pengembangan lanjutan yang direkomendasikan meliputi:"),
        ...[
          "Integrasi API dengan SP4N-LAPOR! melalui koordinasi resmi dengan KemenPAN-RB;",
          "Integrasi Single Sign-On (SSO) Pemerintah menggunakan protokol SAML2;",
          "Pengembangan aplikasi mobile (Android/iOS) untuk memudahkan akses masyarakat;",
          "Implementasi notifikasi real-time menggunakan teknologi WebSocket;",
          "Dashboard analitik dengan visualisasi data dan tren pengaduan;",
          "Integrasi malware scanning (ClamAV) untuk validasi lampiran di server produksi;",
          "Penetration testing berkala oleh pihak ketiga sesuai Peraturan BSSN.",
        ].map(text =>
          new Paragraph({
            numbering: { reference: "bullets", level: 0 },
            spacing: { after: 60, line: 340 },
            children: [new TextRun({ text, size: 22, font: "Calibri" })],
          })
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ============================
        // BAB VII. PENUTUP
        // ============================
        heading1("VII. PENUTUP"),

        bodyText("Pembangunan Sistem Informasi Pengaduan Layanan (SIPADU) merupakan langkah strategis Pengadilan Agama Penajam dalam meningkatkan kualitas pelayanan publik dan memenuhi tuntutan digitalisasi pemerintahan sebagaimana diamanatkan oleh Perpres No. 95 Tahun 2018 tentang SPBE."),
        bodyText("Dengan tingkat kepatuhan SPBE sebesar 94,6% pada item wajib, SIPADU dirancang untuk memenuhi standar keamanan informasi, audit trail, proteksi data pribadi, dan aksesibilitas layanan yang disyaratkan oleh regulasi yang berlaku."),
        bodyText("Kami mengharapkan persetujuan Bapak/Ibu Pimpinan untuk melanjutkan pembangunan SIPADU sesuai rencana tahapan yang telah diuraikan dalam dokumen ini. Dukungan pimpinan sangat diperlukan terutama dalam hal penyediaan infrastruktur server, penugasan SDM pengelola, serta koordinasi dengan PTA Samarinda dan BADILAG terkait integrasi sistem peradilan."),
        emptyLine(),
        bodyText("Demikian dokumen rancangan ini disampaikan. Atas perhatian dan persetujuan Bapak/Ibu Pimpinan, kami ucapkan terima kasih."),
        emptyLine(), emptyLine(),

        // Tanda tangan
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: noBorders, width: { size: 4680, type: WidthType.DXA },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Mengetahui,", size: 22, font: "Calibri" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Ketua Pengadilan Agama Penajam", size: 22, font: "Calibri", bold: true })] }),
                    emptyLine(), emptyLine(), emptyLine(),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "(.........................................)", size: 22, font: "Calibri" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NIP.", size: 22, font: "Calibri" })] }),
                  ],
                }),
                new TableCell({
                  borders: noBorders, width: { size: 4680, type: WidthType.DXA },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: `Penajam, ${DATE_NOW}`, size: 22, font: "Calibri" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Disusun oleh,", size: 22, font: "Calibri", bold: true })] }),
                    emptyLine(), emptyLine(), emptyLine(),
                    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "(.........................................)", size: 22, font: "Calibri" })] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NIP.", size: 22, font: "Calibri" })] }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    },
  ],
});

// --- Generate ---
Packer.toBuffer(doc).then(buffer => {
  const outputPath = "/home/kesekretariatan/project/sipadu/docs/SIPADU_Rancangan_Proposal_v1.0.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log("Dokumen berhasil dibuat: " + outputPath);
});
