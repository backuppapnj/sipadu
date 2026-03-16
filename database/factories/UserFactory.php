<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Password default yang digunakan oleh factory.
     */
    protected static ?string $password;

    /**
     * Mendefinisikan state default model.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('Password123!'),
            'nik' => fake()->numerify('################'),
            'phone' => '08' . fake()->numerify('##########'),
            'address' => fake()->address(),
            'role' => 'masyarakat',
            'is_active' => true,
            'last_login_at' => null,
            'last_login_ip' => null,
            'failed_login_count' => 0,
            'locked_until' => null,
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ];
    }

    /**
     * Menandakan email belum diverifikasi.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * State: pengguna dengan peran admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    /**
     * State: pengguna dengan peran panitera.
     */
    public function panitera(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'panitera',
        ]);
    }

    /**
     * State: pengguna dengan peran petugas_layanan.
     */
    public function petugas(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'petugas_layanan',
        ]);
    }

    /**
     * State: pengguna dengan peran masyarakat.
     */
    public function masyarakat(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'masyarakat',
        ]);
    }

    /**
     * State: akun terkunci.
     */
    public function locked(): static
    {
        return $this->state(fn (array $attributes) => [
            'failed_login_count' => 5,
            'locked_until' => now()->addMinutes(30),
        ]);
    }

    /**
     * State: two-factor authentication aktif.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }
}
