import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

/**
 * Komponen indikator kekuatan password.
 * Menampilkan bar visual dan label sesuai kompleksitas password.
 */
function PasswordStrengthIndicator({ password }: { password: string }) {
    const getStrength = (pw: string) => {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?~`]/.test(pw)) score++;
        return score;
    };

    const strength = getStrength(password);
    const labels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
    const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    if (!password) return null;

    return (
        <div className="mt-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={`h-1 flex-1 rounded ${level <= strength ? colors[strength] : 'bg-gray-200'}`}
                    />
                ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
                Kekuatan: {labels[strength] || 'Sangat Lemah'}
            </p>
        </div>
    );
}

export default function Register() {
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    return (
        <AuthLayout
            title="Daftar Akun Baru"
            description="Isi data di bawah untuk membuat akun masyarakat"
        >
            <Head title="Daftar" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="nik">NIK (Nomor Induk Kependudukan)</Label>
                                <Input
                                    id="nik"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="off"
                                    name="nik"
                                    placeholder="Masukkan 16 digit NIK"
                                    maxLength={16}
                                    pattern="[0-9]{16}"
                                />
                                <InputError message={errors.nik} />
                                <p className="text-xs text-muted-foreground">
                                    NIK Anda akan dienkripsi dan disimpan dengan aman.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama lengkap sesuai KTP"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@contoh.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Nomor HP</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    required
                                    tabIndex={4}
                                    autoComplete="tel"
                                    name="phone"
                                    placeholder="08123456789"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minimal 8 karakter"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <PasswordStrengthIndicator password={password} />
                                <InputError message={errors.password} />
                                <p className="text-xs text-muted-foreground">
                                    Minimal 8 karakter, mengandung huruf kapital, angka, dan simbol.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={6}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="terms"
                                    tabIndex={7}
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) =>
                                        setTermsAccepted(checked === true)
                                    }
                                />
                                <Label htmlFor="terms" className="text-sm leading-relaxed">
                                    Saya menyetujui bahwa data yang saya berikan adalah benar
                                    dan bersedia digunakan sesuai ketentuan layanan SIPADU
                                    Pengadilan Agama Penajam.
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={8}
                                disabled={processing || !termsAccepted}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Daftar
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Sudah punya akun?{' '}
                            <TextLink href={login()} tabIndex={9}>
                                Masuk
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
