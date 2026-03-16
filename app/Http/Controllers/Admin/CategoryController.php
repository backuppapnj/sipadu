<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplaintCategory;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    /**
     * Menampilkan daftar kategori pengaduan.
     */
    public function index(): Response
    {
        $categories = ComplaintCategory::withCount('complaints')
            ->orderBy('name')
            ->paginate(15);

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Menampilkan form buat kategori baru.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Categories/Create');
    }

    /**
     * Menyimpan kategori baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:10', 'unique:complaint_categories,code'],
            'sla_days' => ['required', 'integer', 'min:1', 'max:365'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'Nama kategori wajib diisi.',
            'code.required' => 'Kode kategori wajib diisi.',
            'code.unique' => 'Kode kategori sudah digunakan.',
            'sla_days.required' => 'SLA hari kerja wajib diisi.',
            'sla_days.min' => 'SLA minimal 1 hari kerja.',
        ]);

        $category = ComplaintCategory::create($validated);

        $this->auditService->log('create', $category, null, $category->toArray());

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategori pengaduan berhasil ditambahkan.');
    }

    /**
     * Menampilkan form edit kategori.
     */
    public function edit(ComplaintCategory $category): Response
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
        ]);
    }

    /**
     * Memperbarui kategori.
     */
    public function update(Request $request, ComplaintCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:10', 'unique:complaint_categories,code,' . $category->id],
            'sla_days' => ['required', 'integer', 'min:1', 'max:365'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'Nama kategori wajib diisi.',
            'code.required' => 'Kode kategori wajib diisi.',
            'code.unique' => 'Kode kategori sudah digunakan.',
            'sla_days.required' => 'SLA hari kerja wajib diisi.',
        ]);

        $oldValues = $category->toArray();
        $category->update($validated);

        $this->auditService->log('update', $category, $oldValues, $category->fresh()->toArray());

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategori pengaduan berhasil diperbarui.');
    }

    /**
     * Menghapus kategori.
     */
    public function destroy(ComplaintCategory $category): RedirectResponse
    {
        if ($category->complaints()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki pengaduan terkait.');
        }

        $this->auditService->log('delete', $category, $category->toArray(), null);
        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', 'Kategori pengaduan berhasil dihapus.');
    }
}
