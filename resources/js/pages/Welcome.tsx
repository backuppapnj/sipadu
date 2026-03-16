import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    SendIcon,
    SearchIcon,
    ClipboardCheckIcon,
    UsersIcon,
    CheckCircleIcon,
    ClockIcon,
    FileTextIcon,
    ShieldCheckIcon,
    EyeIcon,
} from 'lucide-react';

interface WelcomeProps {
    stats?: {
        total: number;
        resolved: number;
        resolved_percentage: number;
        avg_resolution_days: number;
    };
}

/**
 * Halaman utama SIPADU — landing page publik.
 * Menampilkan branding PA Penajam, tombol aksi, dan statistik agregat.
 */
export default function Welcome({ stats }: WelcomeProps) {
    const trackForm = useForm({ ticket_no: '' });

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackForm.data.ticket_no.trim()) {
            trackForm.get(`/pengaduan/cek?ticket_no=${trackForm.data.ticket_no}`);
        }
    };

    return (
        <GuestLayout>
            <Head title="Sistem Informasi Pengaduan Layanan" />

            {/* Hero section */}
            <section className="py-12 md:py-20 text-center">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                    Sistem Informasi
                    <br />
                    <span className="text-primary">Pengaduan Layanan</span>
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Sampaikan pengaduan Anda terkait layanan Pengadilan Agama Penajam
                    secara mudah, cepat, dan transparan.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link href="/pengaduan/buat">
                            <SendIcon className="mr-2 h-5 w-5" />
                            Ajukan Pengaduan
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="/pengaduan/cek">
                            <SearchIcon className="mr-2 h-5 w-5" />
                            Lacak Pengaduan
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Lacak pengaduan cepat */}
            <section className="py-8">
                <Card className="max-w-xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-center text-lg">Lacak Status Pengaduan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleTrack} className="flex gap-2">
                            <Input
                                placeholder="Masukkan nomor tiket (PA-PNJ-YYYY-XXXXX)"
                                value={trackForm.data.ticket_no}
                                onChange={(e) => trackForm.setData('ticket_no', e.target.value)}
                                aria-label="Nomor tiket pengaduan"
                            />
                            <Button type="submit" disabled={trackForm.processing}>
                                <SearchIcon className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-2">Cari</span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </section>

            {/* Alur pengaduan */}
            <section className="py-12">
                <h2 className="text-2xl font-bold text-center mb-8">Alur Pengaduan</h2>
                <div className="grid gap-6 md:grid-cols-4">
                    {[
                        { step: 1, icon: FileTextIcon, title: 'Isi Formulir', desc: 'Lengkapi formulir pengaduan dengan data dan bukti pendukung.' },
                        { step: 2, icon: ClipboardCheckIcon, title: 'Verifikasi', desc: 'Petugas memverifikasi kelengkapan dan validitas pengaduan.' },
                        { step: 3, icon: UsersIcon, title: 'Penanganan', desc: 'Pengaduan ditugaskan ke petugas terkait untuk ditindaklanjuti.' },
                        { step: 4, icon: CheckCircleIcon, title: 'Penyelesaian', desc: 'Anda mendapat tanggapan dan pengaduan diselesaikan.' },
                    ].map((item) => (
                        <Card key={item.step} className="text-center">
                            <CardContent className="pt-6">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                                </div>
                                <div className="text-xs font-medium text-primary mb-1">Langkah {item.step}</div>
                                <h3 className="font-semibold mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Statistik publik */}
            {stats && (
                <section className="py-12">
                    <h2 className="text-2xl font-bold text-center mb-8">Statistik Pengaduan</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="text-center">
                            <CardContent className="pt-6">
                                <FileTextIcon className="mx-auto h-8 w-8 text-primary mb-2" aria-hidden="true" />
                                <p className="text-3xl font-bold">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">Total Pengaduan</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                            <CardContent className="pt-6">
                                <CheckCircleIcon className="mx-auto h-8 w-8 text-green-600 mb-2" aria-hidden="true" />
                                <p className="text-3xl font-bold">{stats.resolved_percentage}%</p>
                                <p className="text-sm text-muted-foreground">Tingkat Penyelesaian</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                            <CardContent className="pt-6">
                                <ClockIcon className="mx-auto h-8 w-8 text-blue-600 mb-2" aria-hidden="true" />
                                <p className="text-3xl font-bold">{stats.avg_resolution_days}</p>
                                <p className="text-sm text-muted-foreground">Rata-rata Hari Penyelesaian</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}

            {/* Jaminan keamanan */}
            <section className="py-12">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="flex items-start gap-3">
                        <ShieldCheckIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                            <h3 className="font-semibold">Data Terenkripsi</h3>
                            <p className="text-sm text-muted-foreground">
                                Data pribadi Anda dienkripsi dan dilindungi sesuai UU PDP No. 27/2022.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <EyeIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                            <h3 className="font-semibold">Transparan</h3>
                            <p className="text-sm text-muted-foreground">
                                Lacak status pengaduan Anda secara real-time kapan saja.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <ClockIcon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                            <h3 className="font-semibold">Batas Waktu Jelas</h3>
                            <p className="text-sm text-muted-foreground">
                                Setiap pengaduan memiliki SLA penyelesaian yang terukur.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
