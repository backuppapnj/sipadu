import type { ComplaintStatus } from '@/types';

/** Label status pengaduan dalam Bahasa Indonesia */
export const STATUS_LABELS: Record<ComplaintStatus, string> = {
    submitted: 'Dikirim',
    verified: 'Diverifikasi',
    rejected: 'Ditolak',
    assigned: 'Ditugaskan',
    in_progress: 'Sedang Diproses',
    responded: 'Dijawab',
    resolved: 'Selesai',
    reopened: 'Dibuka Kembali',
};

/** Warna badge untuk setiap status */
export const STATUS_COLORS: Record<ComplaintStatus, string> = {
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    verified: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    responded: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    reopened: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

/** Label prioritas */
export const PRIORITY_LABELS: Record<string, string> = {
    low: 'Rendah',
    normal: 'Normal',
    high: 'Tinggi',
    urgent: 'Mendesak',
};

/** Label klasifikasi data */
export const CLASSIFICATION_LABELS: Record<string, string> = {
    public: 'Publik',
    internal: 'Internal',
    confidential: 'Rahasia',
};

/** Format tanggal ke format Indonesia */
export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/** Format tanggal dan waktu ke format Indonesia */
export function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** Hitung sisa hari kerja dari sekarang ke deadline */
export function calculateRemainingDays(deadlineStr: string): number {
    const now = new Date();
    const deadline = new Date(deadlineStr);
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/** Persentase SLA yang terpakai */
export function calculateSlaPercentage(
    createdAt: string,
    deadline: string,
): number {
    const start = new Date(createdAt).getTime();
    const end = new Date(deadline).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    if (total <= 0) return 100;
    return Math.min(Math.round((elapsed / total) * 100), 100);
}

/** Format ukuran file ke format yang mudah dibaca */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/** Validasi format NIK (16 digit) */
export function validateNik(nik: string): boolean {
    return /^\d{16}$/.test(nik);
}

/** Validasi nomor HP Indonesia */
export function validatePhoneIndonesia(phone: string): boolean {
    return /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(phone);
}

/** Masking NIK — hanya tampilkan 4 digit terakhir */
export function maskNik(nik: string): string {
    if (nik.length < 4) return '****';
    return '****-****-****-' + nik.slice(-4);
}
