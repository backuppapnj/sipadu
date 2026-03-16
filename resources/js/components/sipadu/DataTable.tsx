import { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronUpIcon, ChevronDownIcon, SearchIcon } from 'lucide-react';
import type { PaginationLink } from '@/types';

export interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    headerClass?: string;
    cellClass?: string;
    hiddenOnMobile?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    paginationLinks?: PaginationLink[];
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    keyExtractor: (item: T) => string | number;
}

type SortDirection = 'asc' | 'desc';

/** Decode HTML entities dari label paginasi Laravel */
function decodePaginationLabel(label: string): string {
    return label
        .replace(/&laquo;/g, '\u00AB')
        .replace(/&raquo;/g, '\u00BB')
        .replace(/&amp;/g, '&');
}

/**
 * Tabel data dengan pengurutan, filter teks, dan paginasi.
 * Responsif: kartu di mobile, tabel di desktop.
 */
export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    paginationLinks,
    onRowClick,
    emptyMessage = 'Tidak ada data yang ditemukan.',
    searchable = true,
    searchPlaceholder = 'Cari...',
    keyExtractor,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDirection>('asc');

    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter((item) =>
            columns.some((col) => {
                const val = item[col.key];
                return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
            }),
        );
    }, [data, search, columns]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            const cmp = String(aVal).localeCompare(String(bVal), 'id');
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [filtered, sortKey, sortDir]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    return (
        <div className="space-y-4">
            {searchable && (
                <div className="relative max-w-sm">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                        aria-label="Cari data"
                    />
                </div>
            )}

            {/* Tabel desktop */}
            <div className="hidden md:block overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        'px-4 py-3 text-left font-medium text-muted-foreground',
                                        col.sortable && 'cursor-pointer select-none hover:text-foreground',
                                        col.headerClass,
                                    )}
                                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                    aria-sort={
                                        sortKey === col.key
                                            ? sortDir === 'asc' ? 'ascending' : 'descending'
                                            : undefined
                                    }
                                >
                                    <span className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && sortKey === col.key && (
                                            sortDir === 'asc'
                                                ? <ChevronUpIcon className="h-3 w-3" />
                                                : <ChevronDownIcon className="h-3 w-3" />
                                        )}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {sorted.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sorted.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    className={cn(
                                        'transition-colors hover:bg-muted/30',
                                        onRowClick && 'cursor-pointer',
                                    )}
                                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                                    tabIndex={onRowClick ? 0 : undefined}
                                    onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(item); } : undefined}
                                >
                                    {columns.map((col) => (
                                        <td key={col.key} className={cn('px-4 py-3', col.cellClass)}>
                                            {col.render ? col.render(item) : (item[col.key] as React.ReactNode) ?? '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Kartu mobile */}
            <div className="md:hidden space-y-3">
                {sorted.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>
                ) : (
                    sorted.map((item) => (
                        <Card
                            key={keyExtractor(item)}
                            className={cn(onRowClick && 'cursor-pointer')}
                            onClick={onRowClick ? () => onRowClick(item) : undefined}
                        >
                            <CardContent className="space-y-2">
                                {columns.filter((col) => !col.hiddenOnMobile).map((col) => (
                                    <div key={col.key} className="flex justify-between gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">{col.label}</span>
                                        <span className="text-sm text-right">
                                            {col.render ? col.render(item) : (item[col.key] as React.ReactNode) ?? '-'}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Paginasi */}
            {paginationLinks && paginationLinks.length > 3 && (
                <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="Navigasi halaman">
                    {paginationLinks.map((link, i) => (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled={!link.url}
                            asChild={!!link.url}
                        >
                            {link.url ? (
                                <Link href={link.url} preserveScroll>
                                    {decodePaginationLabel(link.label)}
                                </Link>
                            ) : (
                                <span>{decodePaginationLabel(link.label)}</span>
                            )}
                        </Button>
                    ))}
                </nav>
            )}
        </div>
    );
}
