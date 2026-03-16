import { StatusBadge } from './StatusBadge';
import { formatDateTime } from '@/lib/sipadu-utils';
import type { ComplaintStatusHistory, ComplaintStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ComplaintStatusTimelineProps {
    statuses: ComplaintStatusHistory[];
}

/** Warna garis timeline berdasarkan status */
function getTimelineColor(status: ComplaintStatus): string {
    switch (status) {
        case 'resolved':
        case 'verified':
            return 'bg-green-500';
        case 'in_progress':
        case 'assigned':
        case 'submitted':
        case 'responded':
            return 'bg-primary';
        case 'rejected':
            return 'bg-red-500';
        case 'reopened':
            return 'bg-orange-500';
        default:
            return 'bg-gray-400';
    }
}

/**
 * Timeline vertikal yang menampilkan riwayat perubahan status pengaduan.
 * Setiap entri menampilkan badge status, tanggal/waktu, nama petugas, dan catatan.
 */
export function ComplaintStatusTimeline({ statuses }: ComplaintStatusTimelineProps) {
    if (!statuses || statuses.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Belum ada riwayat status.
            </p>
        );
    }

    // Urutkan dari yang terbaru di atas
    const sorted = [...statuses].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return (
        <div className="space-y-0" role="list" aria-label="Riwayat status pengaduan">
            {sorted.map((entry, index) => (
                <div key={entry.id} className="relative flex gap-4 pb-6" role="listitem">
                    {/* Garis vertikal */}
                    {index < sorted.length - 1 && (
                        <div
                            className="absolute left-[11px] top-6 h-full w-0.5 bg-border"
                            aria-hidden="true"
                        />
                    )}

                    {/* Titik timeline */}
                    <div className="relative z-10 flex-shrink-0">
                        <div
                            className={cn(
                                'h-6 w-6 rounded-full border-2 border-background',
                                getTimelineColor(entry.status),
                            )}
                            aria-hidden="true"
                        />
                    </div>

                    {/* Konten */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={entry.status} />
                            <span className="text-xs text-muted-foreground">
                                {formatDateTime(entry.created_at)}
                            </span>
                        </div>
                        {entry.updated_by && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                oleh {entry.updated_by.name}
                            </p>
                        )}
                        {entry.note && (
                            <p className="mt-1 text-sm text-foreground">
                                {entry.note}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
