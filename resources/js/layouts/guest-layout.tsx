import { Link } from '@inertiajs/react';
import { FlashAlert } from '@/components/sipadu/FlashAlert';
import { ScaleIcon, PhoneIcon, MapPinIcon, MailIcon } from 'lucide-react';

interface GuestLayoutProps {
    children: React.ReactNode;
}

/**
 * Layout untuk halaman publik (landing, form pengaduan, lacak).
 * Header dengan branding PA Penajam, footer dengan info kontak.
 */
export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-ring rounded">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <ScaleIcon className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="block text-sm font-bold leading-tight text-foreground">
                                SIPADU
                            </span>
                            <span className="block text-xs text-muted-foreground">
                                PA Penajam
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-4" aria-label="Navigasi utama">
                        <Link
                            href="/pengaduan/buat"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Ajukan Pengaduan
                        </Link>
                        <Link
                            href="/pengaduan/cek"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Lacak Pengaduan
                        </Link>
                        <Link
                            href="/login"
                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Masuk
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Konten utama */}
            <main className="flex-1">
                <div className="mx-auto max-w-6xl px-4 py-6">
                    <FlashAlert />
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="mx-auto max-w-6xl px-4 py-8">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <ScaleIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                                <h3 className="font-semibold">Pengadilan Agama Penajam</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Sistem Informasi Pengaduan Layanan (SIPADU) untuk masyarakat pencari keadilan
                                di wilayah hukum Pengadilan Agama Penajam.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Tautan</h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/pengaduan/buat" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Ajukan Pengaduan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pengaduan/cek" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Lacak Pengaduan
                                    </Link>
                                </li>
                                <li>
                                    <a href="https://pa-penajam.go.id/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                        Website PA Penajam
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Kontak</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                    <span>Jl. Provinsi KM. 9, Kec. Penajam, Kab. PPU, Kaltim 76142</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                    <span>0822-5693-1508</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MailIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                    <span>info@pa-penajam.go.id</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Pengadilan Agama Penajam. Hak cipta dilindungi.
                    </div>
                </div>
            </footer>
        </div>
    );
}
