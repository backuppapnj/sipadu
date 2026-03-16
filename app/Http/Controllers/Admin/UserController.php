<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    /**
     * Menampilkan daftar pengguna.
     */
    public function index(): Response
    {
        $users = User::orderByDesc('created_at')
            ->paginate(15)
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at?->format('d M Y H:i'),
                'created_at' => $user->created_at->format('d M Y'),
            ]);

        $this->auditService->log('read', null, null, ['page' => 'admin_users_index']);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Menampilkan form buat pengguna baru.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create');
    }

    /**
     * Menyimpan pengguna baru.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create($request->validated());
        $user->assignRole($request->validated('role'));

        $this->auditService->log('create', $user, null, $user->only(['name', 'email', 'role']));

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Menampilkan form edit pengguna.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'is_active' => $user->is_active,
            ],
        ]);
    }

    /**
     * Memperbarui data pengguna.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $oldValues = $user->only(['name', 'email', 'role', 'is_active']);
        $data = $request->validated();

        // Hapus password dari data jika kosong
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        // Sinkronkan role Spatie
        $user->syncRoles([$data['role']]);

        $this->auditService->log('update', $user, $oldValues, $user->only(['name', 'email', 'role', 'is_active']));

        return redirect()->route('admin.users.index')
            ->with('success', 'Data pengguna berhasil diperbarui.');
    }

    /**
     * Menghapus pengguna (soft delete — SPBE).
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->auditService->log('delete', $user, $user->only(['name', 'email', 'role']), null);

        $user->delete(); // Soft delete

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil dihapus.');
    }
}
