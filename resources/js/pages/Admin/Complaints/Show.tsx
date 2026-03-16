import { Head, router, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ArrowLeftIcon, ClockIcon, PaperclipIcon, SendIcon, UserIcon } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, CLASSIFICATION_LABELS } from '@/lib/sipadu-utils';
import type { ComplaintStatus, BreadcrumbItem } from '@/types';

interface ComplaintDetail {
    id: number;
    ticket_no: string;
    title: string;
    description: string;
    category: string;
    complainant_name: string;
    complainant_phone: string | null;
    complainant_email: string | null;
    reported_party: string;
    incident_date: string;
    incident_location: string;
    status: ComplaintStatus;
    status_label: string;
    priority: string;
    priority_label: string;
    assigned_to_name: string | null;
    sla_deadline: string;
    is_overdue: boolean;
    remaining_days: number;
    percentage_used: number;
    is_anonymous: boolean;
    is_confidential: boolean;
    data_classification: string;
    created_at: string;
    resolved_at: string | null;
}

interface TimelineEntry {
    status: ComplaintStatus;
    label: string;
    color: string;
    note: string | null;
    updated_by: string;
    created_at: string;
}

interface Attachment {
    id: number;
    original_name: string;
    mime_type: string;
    formatted_size: string;
}

interface Disposition {
    id: number;
    from: string;
    to: string;
    note: string | null;
    created_at: string;
}

interface Petugas {
    id: number;
    name: string;
}

interface AllowedTransition {
    value: string;
    label: string;
}

interface ShowProps {
    complaint: ComplaintDetail;
    timeline: TimelineEntry[];
    attachments: Attachment[];
    dispositions: Disposition[];
    petugas: Petugas[];
    allowedTransitions: AllowedTransition[];
}

export default function ComplaintShow({
    complaint,
    timeline,
    attachments,
    dispositions,
    petugas,
    allowedTransitions,
}: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: '/admin/dashboard' },
        { title: 'Pengaduan', href: '/admin/complaints' },
        { title: complaint.ticket_no, href: `/admin/complaints/${complaint.id}` },
    ];

    const assignForm = useForm({ assigned_to: '', note: '' });
    const handleAssign = (e: FormEvent) => {
        e.preventDefault();
        assignForm.post(`/admin/complaints/${complaint.id}/assign`, { preserveScroll: true });
    };

    const statusForm = useForm({ status: '', note: '' });
    const handleStatusUpdate = (e: FormEvent) => {
        e.preventDefault();
        statusForm.post(`/admin/complaints/${complaint.id}/status`, { preserveScroll: true });
    };

    const disposisiForm = useForm({ to_user: '', note: '' });
    const handleDisposisi = (e: FormEvent) => {
        e.preventDefault();
        disposisiForm.post(`/admin/complaints/${complaint.id}/disposisi`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pengaduan ${complaint.ticket_no}`} />
            <div className="flex flex-col gap-6 p-4">
                <FlashAlert />

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <a href="/admin/complaints" onClick={(e) => { e.preventDefault(); router.visit('/admin/complaints'); }}>
                            <ArrowLeftIcon className="h-4 w-4" />
                        </a>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{complaint.title}</h1>
                        <p className="text-muted-foreground">{complaint.ticket_no}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[complaint.status] ?? ''}`}>
                        {STATUS_LABELS[complaint.status] ?? complaint.status_label}
                    </span>
                    <Badge variant="outline">
                        {PRIORITY_LABELS[complaint.priority] ?? complaint.priority_label}
                    </Badge>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Kolom kiri: Detail utama */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Deskripsi */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Deskripsi Pengaduan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{complaint.description}</p>
                            </CardContent>
                        </Card>

                        {/* Info pelapor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Pelapor</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2 sm:grid-cols-2">
                                <div>
                                    <span className="text-sm text-muted-foreground">Nama</span>
                                    <p className="font-medium">{complaint.complainant_name}</p>
                                </div>
                                {complaint.complainant_phone && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Telepon</span>
                                        <p className="font-medium">{complaint.complainant_phone}</p>
                                    </div>
                                )}
                                {complaint.complainant_email && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Email</span>
                                        <p className="font-medium">{complaint.complainant_email}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm text-muted-foreground">Pihak Terlapor</span>
                                    <p className="font-medium">{complaint.reported_party}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Tanggal Kejadian</span>
                                    <p className="font-medium">{complaint.incident_date}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Lokasi Kejadian</span>
                                    <p className="font-medium">{complaint.incident_location}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Klasifikasi Data</span>
                                    <p className="font-medium">{CLASSIFICATION_LABELS[complaint.data_classification] ?? complaint.data_classification}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lampiran */}
                        {attachments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lampiran</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {attachments.map((a) => (
                                            <li key={a.id} className="flex items-center gap-2 text-sm">
                                                <PaperclipIcon className="h-4 w-4 text-muted-foreground" />
                                                <span>{a.original_name}</span>
                                                <span className="text-muted-foreground">({a.formatted_size})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Riwayat Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {timeline.map((entry, i) => (
                                        <div key={i} className="flex gap-3">
                                            <ClockIcon className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[entry.status] ?? ''}`}>
                                                        {STATUS_LABELS[entry.status] ?? entry.label}
                                                    </span>
                                                    <span className="text-muted-foreground font-normal ml-2">oleh {entry.updated_by}</span>
                                                </p>
                                                {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                                                <p className="text-xs text-muted-foreground">{entry.created_at}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Disposisi */}
                        {dispositions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Riwayat Disposisi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {dispositions.map((d) => (
                                            <div key={d.id} className="flex gap-3">
                                                <SendIcon className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                                                <div>
                                                    <p className="text-sm">
                                                        <span className="font-medium">{d.from}</span>
                                                        {' → '}
                                                        <span className="font-medium">{d.to}</span>
                                                    </p>
                                                    {d.note && <p className="text-sm text-muted-foreground">{d.note}</p>}
                                                    <p className="text-xs text-muted-foreground">{d.created_at}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Kolom kanan: Aksi */}
                    <div className="flex flex-col gap-6">
                        {/* Info SLA */}
                        <Card>
                            <CardHeader>
                                <CardTitle>SLA</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Batas Waktu</span>
                                    <span className={complaint.is_overdue ? 'text-destructive font-semibold' : ''}>
                                        {complaint.sla_deadline}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Sisa Hari</span>
                                    <span>{complaint.remaining_days} hari</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${complaint.percentage_used > 80 ? 'bg-destructive' : 'bg-primary'}`}
                                        style={{ width: `${Math.min(complaint.percentage_used, 100)}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assign petugas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tugaskan Petugas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAssign} className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="assigned_to">Petugas <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={assignForm.data.assigned_to}
                                            onValueChange={(v) => assignForm.setData('assigned_to', v)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih petugas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {petugas.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={assignForm.errors.assigned_to} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="assign_note">Catatan</Label>
                                        <Textarea
                                            id="assign_note"
                                            value={assignForm.data.note}
                                            onChange={(e) => assignForm.setData('note', e.target.value)}
                                            placeholder="Catatan penugasan (opsional)"
                                        />
                                        <InputError message={assignForm.errors.note} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={assignForm.processing || !assignForm.data.assigned_to}>
                                        <UserIcon className="mr-2 h-4 w-4" />
                                        {assignForm.processing ? 'Memproses...' : 'Tugaskan'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Update status */}
                        {allowedTransitions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ubah Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleStatusUpdate} className="space-y-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="new_status">Status Baru <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={statusForm.data.status}
                                                onValueChange={(v) => statusForm.setData('status', v)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allowedTransitions.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={statusForm.errors.status} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status_note">Catatan</Label>
                                            <Textarea
                                                id="status_note"
                                                value={statusForm.data.note}
                                                onChange={(e) => statusForm.setData('note', e.target.value)}
                                                placeholder="Alasan perubahan status"
                                            />
                                            <InputError message={statusForm.errors.note} />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={statusForm.processing || !statusForm.data.status}>
                                            {statusForm.processing ? 'Memproses...' : 'Perbarui Status'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Disposisi */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Disposisi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleDisposisi} className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="to_user">Penerima <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={disposisiForm.data.to_user}
                                            onValueChange={(v) => disposisiForm.setData('to_user', v)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih penerima" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {petugas.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={disposisiForm.errors.to_user} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="disposisi_note">Catatan</Label>
                                        <Textarea
                                            id="disposisi_note"
                                            value={disposisiForm.data.note}
                                            onChange={(e) => disposisiForm.setData('note', e.target.value)}
                                            placeholder="Catatan disposisi (opsional)"
                                        />
                                        <InputError message={disposisiForm.errors.note} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={disposisiForm.processing || !disposisiForm.data.to_user}>
                                        <SendIcon className="mr-2 h-4 w-4" />
                                        {disposisiForm.processing ? 'Memproses...' : 'Kirim Disposisi'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
