import { Head, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ComplaintStatusTimeline } from '@/components/sipadu/ComplaintStatusTimeline';
import { SlaIndicator } from '@/components/sipadu/SlaIndicator';
import { StatusBadge } from '@/components/sipadu/StatusBadge';
import { formatDate } from '@/lib/sipadu-utils';
import InputError from '@/components/input-error';
import { SearchIcon, AlertCircleIcon } from 'lucide-react';
import type { Complaint } from '@/types';

interface CekProps {
    complaint?: Complaint;
    ticket_no?: string;
    notFound?: boolean;
}

/**
 * Halaman lacak pengaduan — input nomor tiket, tampilkan timeline & SLA.
 * Tidak menampilkan identitas pelapor atau detail rahasia.
 */
export default function Cek({ complaint, ticket_no, notFound }: CekProps) {
    const form = useForm({ ticket_no: ticket_no ?? '' });

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (form.data.ticket_no.trim()) {
            form.get('/pengaduan/cek', {
                preserveState: true,
            });
        }
    };

    return (
        <GuestLayout>
            <Head title="Lacak Pengaduan" />

            <div className="py-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Lacak Status Pengaduan</h1>
                <p className="text-muted-foreground mb-6">
                    Masukkan nomor tiket yang Anda terima saat mengajukan pengaduan.
                </p>

                {/* Form pencarian */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ticket_no">Nomor Tiket</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="ticket_no"
                                        type="text"
                                        placeholder="PA-PNJ-YYYY-XXXXX"
                                        value={form.data.ticket_no}
                                        onChange={(e) => form.setData('ticket_no', e.target.value)}
                                        aria-label="Nomor tiket pengaduan"
                                    />
                                    <Button type="submit" disabled={form.processing}>
                                        <SearchIcon className="mr-2 h-4 w-4" />
                                        Cari
                                    </Button>
                                </div>
                                <InputError message={form.errors.ticket_no} />
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Tidak ditemukan */}
                {notFound && (
                    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                        <CardContent className="flex items-center gap-3 py-6">
                            <AlertCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-red-800 dark:text-red-200">
                                    Pengaduan Tidak Ditemukan
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    Nomor tiket &ldquo;{ticket_no}&rdquo; tidak ditemukan di sistem.
                                    Pastikan Anda memasukkan nomor tiket dengan benar.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Hasil pengaduan */}
                {complaint && (
                    <div className="space-y-6">
                        {/* Ringkasan */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <CardTitle className="font-mono text-primary">
                                        {complaint.ticket_no}
                                    </CardTitle>
                                    <StatusBadge status={complaint.status} />
                                </div>
                                <CardDescription>{complaint.title}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid gap-3 text-sm sm:grid-cols-2">
                                    <div>
                                        <span className="text-muted-foreground">Kategori:</span>
                                        <span className="ml-2 font-medium">{complaint.category?.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tanggal Pengajuan:</span>
                                        <span className="ml-2 font-medium">{formatDate(complaint.created_at)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Tanggal Kejadian:</span>
                                        <span className="ml-2 font-medium">{formatDate(complaint.incident_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">SLA:</span>
                                        <SlaIndicator
                                            createdAt={complaint.created_at}
                                            deadline={complaint.sla_deadline}
                                            resolved={complaint.status === 'resolved'}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Riwayat Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ComplaintStatusTimeline statuses={complaint.statuses} />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}
