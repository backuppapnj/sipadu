import { useState } from 'react';
import { DataTable, type Column } from './DataTable';
import { formatDateTime } from '@/lib/sipadu-utils';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import type { AuditLog, PaginationLink } from '@/types';

interface AuditLogViewerProps {
    logs: AuditLog[];
    paginationLinks?: PaginationLink[];
}

/**
 * Penampil audit log — tabel read-only dengan baris yang bisa diperluas
 * untuk menampilkan diff old_values/new_values.
 */
export function AuditLogViewer({ logs, paginationLinks }: AuditLogViewerProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const columns: Column<AuditLog & Record<string, unknown>>[] = [
        {
            key: 'created_at',
            label: 'Waktu',
            sortable: true,
            render: (log) => (
                <span className="text-xs whitespace-nowrap">{formatDateTime(log.created_at)}</span>
            ),
        },
        {
            key: 'user_name',
            label: 'Pengguna',
            render: (log) => log.user?.name ?? 'Sistem',
        },
        {
            key: 'action',
            label: 'Aksi',
            sortable: true,
            render: (log) => (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {log.action}
                </span>
            ),
        },
        {
            key: 'subject_type',
            label: 'Subjek',
            render: (log) => {
                const type = log.subject_type?.split('\\').pop() ?? '-';
                return `${type}${log.subject_id ? ` #${log.subject_id}` : ''}`;
            },
        },
        {
            key: 'user_ip',
            label: 'IP',
            hiddenOnMobile: true,
        },
        {
            key: 'detail',
            label: 'Detail',
            render: (log) => {
                const hasValues = log.old_values || log.new_values;
                if (!hasValues) return '-';
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === log.id ? null : log.id);
                        }}
                        aria-expanded={expandedId === log.id}
                        aria-label="Lihat detail perubahan"
                    >
                        {expandedId === log.id ? (
                            <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="space-y-2">
            <DataTable
                columns={columns}
                data={logs as (AuditLog & Record<string, unknown>)[]}
                paginationLinks={paginationLinks}
                keyExtractor={(log) => log.id}
                emptyMessage="Tidak ada log audit."
                searchPlaceholder="Cari log..."
            />

            {/* Detail yang diperluas */}
            {expandedId && (() => {
                const log = logs.find((l) => l.id === expandedId);
                if (!log) return null;
                return (
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-3">
                        <h4 className="font-medium">Detail Perubahan</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            {log.old_values && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Nilai Lama</p>
                                    <pre className="overflow-auto rounded bg-background p-2 text-xs">
                                        {JSON.stringify(log.old_values, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {log.new_values && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Nilai Baru</p>
                                    <pre className="overflow-auto rounded bg-background p-2 text-xs">
                                        {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
