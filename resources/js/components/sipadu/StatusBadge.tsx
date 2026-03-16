import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/sipadu-utils';
import type { ComplaintStatus } from '@/types';

interface StatusBadgeProps {
    status: ComplaintStatus;
    className?: string;
}

/**
 * Badge status pengaduan dengan warna sesuai status.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                STATUS_COLORS[status],
                className,
            )}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}
