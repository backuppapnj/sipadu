import { Head, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileUploadZone } from '@/components/sipadu/FileUploadZone';
import InputError from '@/components/input-error';
import { validateNik, validatePhoneIndonesia } from '@/lib/sipadu-utils';
import { CheckCircleIcon, SendIcon, CopyIcon, PrinterIcon, CheckIcon } from 'lucide-react';
import type { ComplaintCategory, ComplaintFormData } from '@/types';

interface SuccessData {
    ticket_no: string;
    title: string;
    category: string;
    created_at: string;
    sla_deadline: string;
}

interface BuatProps {
    categories: ComplaintCategory[];
    success?: SuccessData;
}

/**
 * Halaman formulir pengaduan publik — tidak perlu login.
 * Semua field sesuai spesifikasi proyek bagian 3.1.2.
 */
export default function Buat({ categories, success }: BuatProps) {
    const [files, setFiles] = useState<File[]>([]);

    const form = useForm<ComplaintFormData>({
        complainant_nik: '',
        complainant_name: '',
        complainant_address: '',
        complainant_phone: '',
        complainant_email: '',
        category_id: '',
        title: '',
        incident_date: '',
        incident_location: '',
        description: '',
        reported_party: '',
        attachments: [],
        is_anonymous: false,
        is_confidential: false,
    });

    // Validasi klien sebelum submit
    const validate = (): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (!form.data.complainant_nik) {
            errors.complainant_nik = 'NIK wajib diisi.';
        } else if (!validateNik(form.data.complainant_nik)) {
            errors.complainant_nik = 'NIK harus terdiri dari 16 digit angka.';
        }

        if (!form.data.complainant_name.trim()) errors.complainant_name = 'Nama lengkap wajib diisi.';
        if (!form.data.complainant_address.trim()) errors.complainant_address = 'Alamat wajib diisi.';

        if (!form.data.complainant_phone) {
            errors.complainant_phone = 'Nomor HP wajib diisi.';
        } else if (!validatePhoneIndonesia(form.data.complainant_phone)) {
            errors.complainant_phone = 'Format nomor HP tidak valid. Contoh: 08123456789';
        }

        if (form.data.complainant_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.data.complainant_email)) {
            errors.complainant_email = 'Format email tidak valid.';
        }

        if (!form.data.category_id) errors.category_id = 'Kategori pengaduan wajib dipilih.';
        if (!form.data.title.trim()) errors.title = 'Judul pengaduan wajib diisi.';
        if (!form.data.incident_date) errors.incident_date = 'Tanggal kejadian wajib diisi.';
        if (!form.data.incident_location.trim()) errors.incident_location = 'Lokasi kejadian wajib diisi.';

        if (!form.data.description.trim()) {
            errors.description = 'Uraian lengkap wajib diisi.';
        } else if (form.data.description.trim().length < 50) {
            errors.description = 'Uraian lengkap minimal 50 karakter.';
        }

        return errors;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const clientErrors = validate();
        if (Object.keys(clientErrors).length > 0) {
            // Tampilkan error pertama
            Object.entries(clientErrors).forEach(([key, msg]) => {
                form.setError(key as keyof ComplaintFormData, msg);
            });
            return;
        }

        // Kirim form dengan file menggunakan FormData
        form.post('/pengaduan/buat', {
            forceFormData: true,
            onBefore: () => {
                // Set file ke form data
                form.setData('attachments', files as unknown as File[]);
            },
        });
    };

    // State untuk tombol salin
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!success) return;
        navigator.clipboard.writeText(success.ticket_no).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handlePrint = () => {
        window.print();
    };

    // Halaman sukses — nomor tiket ditampilkan permanen, bisa dicetak/disalin
    if (success) {
        return (
            <GuestLayout>
                <Head title="Pengaduan Berhasil Dikirim" />

                {/* Area cetak — hanya muncul saat print */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #bukti-pengaduan, #bukti-pengaduan * { visibility: visible; }
                        #bukti-pengaduan { position: absolute; top: 0; left: 0; width: 100%; padding: 2rem; }
                        .no-print { display: none !important; }
                    }
                `}</style>

                <div className="py-12 max-w-lg mx-auto" id="bukti-pengaduan">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Pengaduan Berhasil Dikirim!</h1>
                        <p className="text-muted-foreground">
                            Simpan atau cetak bukti pengaduan ini untuk melacak status pengaduan Anda.
                        </p>
                    </div>

                    {/* Kartu bukti pengaduan */}
                    <Card className="mb-6 border-2 border-primary/20">
                        <CardHeader className="text-center pb-2">
                            <CardDescription>Bukti Pengaduan Layanan</CardDescription>
                            <CardTitle className="text-sm text-muted-foreground">
                                Pengadilan Agama Penajam
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Nomor tiket — besar & menonjol */}
                            <div className="text-center py-4 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                                    Nomor Tiket
                                </p>
                                <p className="text-3xl font-mono font-bold text-primary tracking-wide">
                                    {success.ticket_no}
                                </p>
                            </div>

                            {/* Detail pengaduan */}
                            <div className="grid gap-3 text-sm">
                                <div className="flex justify-between border-b border-dashed pb-2">
                                    <span className="text-muted-foreground">Judul Pengaduan</span>
                                    <span className="font-medium text-right max-w-[60%]">{success.title}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed pb-2">
                                    <span className="text-muted-foreground">Kategori</span>
                                    <span className="font-medium">{success.category}</span>
                                </div>
                                <div className="flex justify-between border-b border-dashed pb-2">
                                    <span className="text-muted-foreground">Tanggal Pengajuan</span>
                                    <span className="font-medium">{success.created_at}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Batas Penyelesaian (SLA)</span>
                                    <span className="font-medium">{success.sla_deadline}</span>
                                </div>
                            </div>

                            {/* Catatan */}
                            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 text-xs text-yellow-800 dark:text-yellow-200">
                                <p className="font-semibold mb-1">Penting:</p>
                                <ul className="list-disc list-inside space-y-0.5">
                                    <li>Simpan nomor tiket ini untuk melacak status pengaduan.</li>
                                    <li>Anda dapat mencetak atau menyalin halaman ini sebagai bukti.</li>
                                    <li>Gunakan menu &ldquo;Lacak Pengaduan&rdquo; untuk melihat perkembangan.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tombol aksi */}
                    <div className="flex flex-wrap justify-center gap-3 no-print">
                        <Button onClick={handleCopy} variant="outline">
                            {copied ? (
                                <>
                                    <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                                    Tersalin!
                                </>
                            ) : (
                                <>
                                    <CopyIcon className="mr-2 h-4 w-4" />
                                    Salin Nomor Tiket
                                </>
                            )}
                        </Button>
                        <Button onClick={handlePrint} variant="outline">
                            <PrinterIcon className="mr-2 h-4 w-4" />
                            Cetak Bukti
                        </Button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mt-3 no-print">
                        <Button asChild>
                            <a href={`/pengaduan/cek?ticket_no=${success.ticket_no}`}>
                                Lacak Pengaduan
                            </a>
                        </Button>
                        <Button variant="ghost" asChild>
                            <a href="/">Kembali ke Beranda</a>
                        </Button>
                    </div>
                </div>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="Ajukan Pengaduan" />

            <div className="py-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-2">Formulir Pengaduan Layanan</h1>
                <p className="text-muted-foreground mb-6">
                    Sampaikan pengaduan Anda terkait layanan Pengadilan Agama Penajam.
                    Formulir ini dapat diisi tanpa login.
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Data Pelapor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Pelapor</CardTitle>
                            <CardDescription>Identitas Anda akan dilindungi sesuai peraturan yang berlaku.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* NIK */}
                            <div className="space-y-2">
                                <Label htmlFor="nik">
                                    NIK <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="nik"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={16}
                                    placeholder="Masukkan 16 digit NIK"
                                    value={form.data.complainant_nik}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        form.setData('complainant_nik', val);
                                    }}
                                    aria-describedby="nik-help"
                                    aria-invalid={!!form.errors.complainant_nik}
                                />
                                <p id="nik-help" className="text-xs text-muted-foreground">
                                    NIK akan dienkripsi dan tidak ditampilkan secara publik.
                                </p>
                                <InputError message={form.errors.complainant_nik} />
                            </div>

                            {/* Nama Lengkap */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    maxLength={255}
                                    placeholder="Sesuai KTP"
                                    value={form.data.complainant_name}
                                    onChange={(e) => form.setData('complainant_name', e.target.value)}
                                    aria-invalid={!!form.errors.complainant_name}
                                />
                                <InputError message={form.errors.complainant_name} />
                            </div>

                            {/* Alamat */}
                            <div className="space-y-2">
                                <Label htmlFor="address">
                                    Alamat Lengkap <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="address"
                                    placeholder="Alamat domisili lengkap"
                                    maxCharacters={500}
                                    showCount
                                    value={form.data.complainant_address}
                                    onChange={(e) => form.setData('complainant_address', e.target.value)}
                                    aria-invalid={!!form.errors.complainant_address}
                                />
                                <InputError message={form.errors.complainant_address} />
                            </div>

                            {/* Nomor HP */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Nomor HP <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="08123456789"
                                    value={form.data.complainant_phone}
                                    onChange={(e) => form.setData('complainant_phone', e.target.value)}
                                    aria-invalid={!!form.errors.complainant_phone}
                                />
                                <InputError message={form.errors.complainant_phone} />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Opsional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@contoh.com"
                                    value={form.data.complainant_email}
                                    onChange={(e) => form.setData('complainant_email', e.target.value)}
                                    aria-invalid={!!form.errors.complainant_email}
                                />
                                <InputError message={form.errors.complainant_email} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detail Pengaduan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Pengaduan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Kategori */}
                            <div className="space-y-2">
                                <Label htmlFor="category_id">
                                    Kategori Pengaduan <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={form.data.category_id}
                                    onValueChange={(val) => form.setData('category_id', val)}
                                >
                                    <SelectTrigger className="w-full" aria-invalid={!!form.errors.category_id}>
                                        <SelectValue placeholder="Pilih kategori pengaduan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.category_id} />
                            </div>

                            {/* Judul */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Judul Pengaduan <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    maxLength={255}
                                    placeholder="Ringkasan singkat pengaduan"
                                    value={form.data.title}
                                    onChange={(e) => form.setData('title', e.target.value)}
                                    aria-invalid={!!form.errors.title}
                                />
                                <InputError message={form.errors.title} />
                            </div>

                            {/* Tanggal Kejadian */}
                            <div className="space-y-2">
                                <Label htmlFor="incident_date">
                                    Tanggal Kejadian <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="incident_date"
                                    type="date"
                                    max={new Date().toISOString().split('T')[0]}
                                    value={form.data.incident_date}
                                    onChange={(e) => form.setData('incident_date', e.target.value)}
                                    aria-invalid={!!form.errors.incident_date}
                                />
                                <InputError message={form.errors.incident_date} />
                            </div>

                            {/* Lokasi Kejadian */}
                            <div className="space-y-2">
                                <Label htmlFor="incident_location">
                                    Lokasi Kejadian <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="incident_location"
                                    type="text"
                                    maxLength={500}
                                    placeholder="Lokasi spesifik kejadian"
                                    value={form.data.incident_location}
                                    onChange={(e) => form.setData('incident_location', e.target.value)}
                                    aria-invalid={!!form.errors.incident_location}
                                />
                                <InputError message={form.errors.incident_location} />
                            </div>

                            {/* Uraian Lengkap */}
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Uraian Lengkap <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Jelaskan kronologi kejadian secara lengkap (minimal 50 karakter)"
                                    rows={6}
                                    showCount
                                    maxCharacters={5000}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    aria-describedby="desc-help"
                                    aria-invalid={!!form.errors.description}
                                />
                                <p id="desc-help" className="text-xs text-muted-foreground">
                                    Minimal 50 karakter. Jelaskan secara kronologis.
                                </p>
                                <InputError message={form.errors.description} />
                            </div>

                            {/* Pihak yang Dilaporkan */}
                            <div className="space-y-2">
                                <Label htmlFor="reported_party">Pihak yang Dilaporkan (Opsional)</Label>
                                <Input
                                    id="reported_party"
                                    type="text"
                                    maxLength={255}
                                    placeholder="Nama, jabatan, unit"
                                    value={form.data.reported_party}
                                    onChange={(e) => form.setData('reported_party', e.target.value)}
                                />
                                <InputError message={form.errors.reported_party} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bukti Pendukung */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Bukti Pendukung (Opsional)</CardTitle>
                            <CardDescription>
                                Lampirkan foto, dokumen, atau tangkapan layar sebagai bukti.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUploadZone
                                files={files}
                                onChange={setFiles}
                                error={form.errors.attachments}
                            />
                        </CardContent>
                    </Card>

                    {/* Opsi Pelaporan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Opsi Pelaporan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="is_anonymous"
                                    checked={form.data.is_anonymous}
                                    onCheckedChange={(checked) =>
                                        form.setData('is_anonymous', checked === true)
                                    }
                                />
                                <div>
                                    <Label htmlFor="is_anonymous" className="cursor-pointer">
                                        Laporan Anonim
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Identitas Anda tidak akan ditampilkan kepada pihak yang dilaporkan.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="is_confidential"
                                    checked={form.data.is_confidential}
                                    onCheckedChange={(checked) =>
                                        form.setData('is_confidential', checked === true)
                                    }
                                />
                                <div>
                                    <Label htmlFor="is_confidential" className="cursor-pointer">
                                        Laporan Rahasia
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Seluruh isi pengaduan tidak akan ditampilkan secara publik.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tombol Submit */}
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" disabled={form.processing}>
                            <SendIcon className="mr-2 h-5 w-5" />
                            {form.processing ? 'Mengirim...' : 'Kirim Pengaduan'}
                        </Button>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
