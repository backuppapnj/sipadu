import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { SlaIndicator } from './SlaIndicator';
import { formatDate, CLASSIFICATION_LABELS } from '@/lib/sipadu-utils';
import { Badge } from '@/components/ui/badge';
import type { Complaint } from '@/types';
import { CalendarIcon, TagIcon, ShieldIcon, LockIcon } from 'lucide-react';

interface ComplaintCardProps {
    complaint: Complaint;
    /** URL tujuan ketika card diklik */
    href?: string;
}

/**
 * Kartu ringkasan pengaduan untuk daftar pengaduan.
 * Menampilkan: nomor tiket, judul, kategori, status, SLA, tanggal.
 */
export function ComplaintCard({ complaint, href }: ComplaintCardProps) {
    const content = (
        <Card className="transition-shadow hover:shadow-md cursor-pointer">
            <CardContent className="space-y-3">
                {/* Baris atas: tiket dan badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-primary">
                        {complaint.ticket_no}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={complaint.status} />
                        {complaint.is_confidential && (
                            <Badge variant="destructive" className="text-xs">
                                <LockIcon className="mr-1 h-3 w-3" />
                                Rahasia
                            </Badge>
                        )}
                        {complaint.data_classification !== 'public' && (
                            <Badge variant="outline" className="text-xs">
                                <ShieldIcon className="mr-1 h-3 w-3" />
                                {CLASSIFICATION_LABELS[complaint.data_classification]}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Judul */}
                <h3 className="text-base font-medium leading-snug line-clamp-2">
                    {complaint.title}
                </h3>

                {/* Info bawah */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <TagIcon className="h-3 w-3" aria-hidden="true" />
                        {complaint.category?.name}
                    </span>
                    <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" aria-hidden="true" />
                        {formatDate(complaint.created_at)}
                    </span>
                    <SlaIndicator
                        createdAt={complaint.created_at}
                        deadline={complaint.sla_deadline}
                        resolved={complaint.status === 'resolved'}
                        compact
                    />
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl">
                {content}
            </Link>
        );
    }

    return content;
}
