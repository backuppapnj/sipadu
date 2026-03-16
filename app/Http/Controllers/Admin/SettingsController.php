<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(
        private AuditService $auditService,
    ) {}

    /**
     * Menampilkan halaman pengaturan sistem.
     */
    public function index(): Response
    {
        $settings = SystemSetting::orderBy('group')
            ->orderBy('key')
            ->get()
            ->groupBy('group');

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Memperbarui pengaturan sistem.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string'],
            'settings.*.value' => ['required', 'string'],
        ], [
            'settings.required' => 'Data pengaturan wajib diisi.',
        ]);

        foreach ($validated['settings'] as $setting) {
            $old = SystemSetting::find($setting['key']);
            $oldValue = $old?->value;

            SystemSetting::setValue(
                $setting['key'],
                $setting['value'],
                auth()->id()
            );

            if ($oldValue !== $setting['value']) {
                $this->auditService->log('update', $old, ['value' => $oldValue], ['value' => $setting['value']]);
            }
        }

        return back()->with('success', 'Pengaturan berhasil diperbarui.');
    }
}
