import { cn } from '@/lib/utils';
import { calculateRemainingDays, calculateSlaPercentage, formatDate } from '@/lib/sipadu-utils';

interface SlaIndicatorProps {
    /** Tanggal pembuatan pengaduan */
    createdAt: string;
    /** Tanggal batas waktu SLA */
    deadline: string;
    /** Status pengaduan — jika resolved, tampilkan selesai */
    resolved?: boolean;
    /** Tampilkan dalam format ringkas */
    compact?: boolean;
}

/**
 * Indikator SLA — menampilkan sisa hari kerja atau badge TERLAMBAT.
 * Warna: hijau (<75%), kuning (75-90%), merah (>90% atau lewat batas).
 */
export function SlaIndicator({ createdAt, deadline, resolved = false, compact = false }: SlaIndicatorProps) {
    if (resolved) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                Selesai
            </span>
        );
    }

    const remaining = calculateRemainingDays(deadline);
    const percentage = calculateSlaPercentage(createdAt, deadline);
    const isOverdue = remaining < 0;

    const colorClass = isOverdue || percentage > 90
        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        : percentage > 75
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';

    const label = isOverdue
        ? 'TERLAMBAT'
        : `${remaining} hari lagi`;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                colorClass,
            )}
            title={`Batas waktu: ${formatDate(deadline)}`}
            aria-label={`SLA: ${label}. Batas waktu: ${formatDate(deadline)}`}
        >
            {!compact && (
                <span
                    className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        isOverdue || percentage > 90
                            ? 'bg-red-500'
                            : percentage > 75
                                ? 'bg-yellow-500'
                                : 'bg-green-500',
                    )}
                    aria-hidden="true"
                />
            )}
            {label}
        </span>
    );
}
