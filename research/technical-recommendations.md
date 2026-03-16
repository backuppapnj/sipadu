# SIPADU - Technical Research & Recommendations

> Sistem Informasi Pengaduan Layanan - Pengadilan Agama Penajam
> Tanggal Riset: 16 Maret 2026
> Tech Stack: Laravel 12, Inertia.js v2, React 19 (TypeScript), Tailwind CSS, MySQL, Sanctum, Spatie Permission, Spatie Activitylog v4

---

## 1. Laravel 12 Best Practices

### 1.1 Service / Repository Pattern

Gunakan **Action Classes** sebagai pengganti service layer yang terlalu besar. Action class mengikuti prinsip Single Responsibility.

```php
// app/Actions/Complaint/CreateComplaintAction.php
class CreateComplaintAction
{
    public function __construct(
        private GenerateTicketNumberAction $generateTicket,
        private StoreComplaintAttachmentsAction $storeAttachments,
    ) {}

    public function execute(array $validated, User $user): Complaint
    {
        return DB::transaction(function () use ($validated, $user) {
            $ticket = $this->generateTicket->execute();

            $complaint = Complaint::create([
                'ticket_number' => $ticket,
                'user_id' => $user->id,
                'subject' => $validated['subject'],
                'description' => $validated['description'],
                'service_type' => $validated['service_type'],
                'status' => ComplaintStatus::PENDING,
            ]);

            if (!empty($validated['attachments'])) {
                $this->storeAttachments->execute($complaint, $validated['attachments']);
            }

            return $complaint;
        });
    }
}
```

**Rekomendasi:** Gunakan Action classes (bukan service layer monolitik). Repository pattern hanya jika ada kebutuhan multi-database atau caching layer yang kompleks.

### 1.2 Form Requests

```php
// app/Http/Requests/StoreComplaintRequest.php
class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Semua user terautentikasi boleh mengajukan pengaduan
    }

    public function rules(): array
    {
        return [
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'service_type' => 'required|in:perdata,pidana,hukum,administrasi,lainnya',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => [
                'file',
                'max:10240', // 10MB
                'mimes:jpg,jpeg,png,pdf,doc,docx',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'subject.required' => 'Subjek pengaduan wajib diisi.',
            'description.required' => 'Deskripsi pengaduan wajib diisi.',
            'attachments.*.max' => 'Ukuran file maksimal 10MB.',
            'attachments.*.mimes' => 'Format file harus JPG, PNG, PDF, DOC, atau DOCX.',
        ];
    }
}
```

### 1.3 API Resources

```php
// app/Http/Resources/ComplaintResource.php
class ComplaintResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_number' => $this->ticket_number,
            'subject' => $this->subject,
            'description' => $this->description,
            'service_type' => $this->service_type,
            'status' => $this->status,
            'created_at' => $this->created_at->format('d M Y H:i'),
            'updated_at' => $this->updated_at->format('d M Y H:i'),
            'complainant' => new UserResource($this->whenLoaded('user')),
            'attachments' => AttachmentResource::collection($this->whenLoaded('attachments')),
            'responses' => ComplaintResponseResource::collection($this->whenLoaded('responses')),
        ];
    }
}
```

**Catatan Inertia.js:** Untuk Inertia, API Resources tetap berguna untuk konsistensi format data yang dikirim ke frontend, meskipun tidak melalui JSON API tradisional. Gunakan `->toArray()` saat passing props:

```php
return Inertia::render('Complaints/Show', [
    'complaint' => new ComplaintResource($complaint->load(['user', 'attachments', 'responses'])),
]);
```

### 1.4 Controller Pattern

Controller harus tipis — delegasi ke Action classes:

```php
class ComplaintController extends Controller
{
    public function store(StoreComplaintRequest $request, CreateComplaintAction $action): RedirectResponse
    {
        $complaint = $action->execute($request->validated(), $request->user());

        return redirect()->route('complaints.show', $complaint)
            ->with('success', 'Pengaduan berhasil dikirim.');
    }
}
```

---

## 2. Inertia.js v2 + React 19 Patterns

### 2.1 Inertia v2 Key Features

- **Async Request Batching**: Multiple requests dapat di-batch untuk performa lebih baik.
- **Improved Prefetching**: `WhenVisible` dan `Link prefetch` untuk UX lebih responsif.
- **Deferred Props**: Props yang di-lazy-load setelah halaman pertama render.
- **Merge Props**: Props yang di-merge (bukan replace) saat partial reload.

### 2.2 useForm dengan TypeScript (React 19)

```tsx
import { useForm } from '@inertiajs/react';

interface ComplaintFormData {
    subject: string;
    description: string;
    service_type: string;
    attachments: File[];
}

export default function CreateComplaint() {
    const { data, setData, post, processing, errors, reset } = useForm<ComplaintFormData>({
        subject: '',
        description: '',
        service_type: '',
        attachments: [],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/complaints', {
            forceFormData: true, // Diperlukan untuk file upload
            onSuccess: () => reset(),
        });
    }

    return (
        <form onSubmit={submit}>
            <input
                type="text"
                value={data.subject}
                onChange={e => setData('subject', e.target.value)}
            />
            {errors.subject && <div className="text-red-500">{errors.subject}</div>}

            <textarea
                value={data.description}
                onChange={e => setData('description', e.target.value)}
            />
            {errors.description && <div className="text-red-500">{errors.description}</div>}

            <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                onChange={e => setData('attachments', Array.from(e.target.files || []))}
            />
            {errors['attachments.0'] && <div className="text-red-500">{errors['attachments.0']}</div>}

            <button type="submit" disabled={processing}>
                {processing ? 'Mengirim...' : 'Kirim Pengaduan'}
            </button>
        </form>
    );
}
```

### 2.3 Shared Data Pattern

Server-side (HandleInertiaRequests middleware):

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'roles' => $request->user()->getRoleNames(),
                'permissions' => $request->user()->getAllPermissions()->pluck('name'),
            ] : null,
        ],
        'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
        ],
    ];
}
```

Client-side:

```tsx
import { usePage } from '@inertiajs/react';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            roles: string[];
            permissions: string[];
        } | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const { auth, flash } = usePage<PageProps>().props;

    return (
        <main>
            {flash.success && <div className="bg-green-100 p-4">{flash.success}</div>}
            {flash.error && <div className="bg-red-100 p-4">{flash.error}</div>}
            <header>
                {auth.user ? `Selamat datang, ${auth.user.name}` : 'Silakan login'}
            </header>
            <article>{children}</article>
        </main>
    );
}
```

### 2.4 Deferred Props (Inertia v2)

Untuk data berat seperti daftar pengaduan dengan statistik:

```php
use Inertia\Inertia;

return Inertia::render('Dashboard', [
    'stats' => Inertia::defer(fn () => [
        'total_complaints' => Complaint::count(),
        'pending' => Complaint::where('status', 'pending')->count(),
        'resolved' => Complaint::where('status', 'resolved')->count(),
    ]),
]);
```

```tsx
import { Deferred } from '@inertiajs/react';

<Deferred data="stats" fallback={<div>Memuat statistik...</div>}>
    <StatsCards />
</Deferred>
```

---

## 3. Laravel Queue untuk Notifikasi

### 3.1 Queue Driver Recommendation

| Driver   | Kelebihan                           | Kekurangan                      | Rekomendasi           |
|----------|-------------------------------------|---------------------------------|-----------------------|
| database | Tidak perlu service tambahan        | Performa lebih lambat           | **Development & Small Scale** |
| Redis    | Sangat cepat, fitur lengkap         | Perlu install Redis             | **Production**        |

**Rekomendasi SIPADU:** Mulai dengan `database` driver. Migrasi ke Redis jika volume pengaduan > 100/hari.

```env
# .env
QUEUE_CONNECTION=database
```

```bash
php artisan queue:table
php artisan migrate
```

### 3.2 Email Notification (Queued)

```php
// app/Notifications/ComplaintSubmittedNotification.php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ComplaintSubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Complaint $complaint,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Pengaduan #{$this->complaint->ticket_number} Diterima")
            ->greeting("Yth. {$notifiable->name}")
            ->line("Pengaduan Anda dengan nomor tiket {$this->complaint->ticket_number} telah diterima.")
            ->line("Subjek: {$this->complaint->subject}")
            ->action('Lihat Status Pengaduan', route('complaints.show', $this->complaint))
            ->line('Kami akan memproses pengaduan Anda dalam waktu 3 hari kerja.');
    }
}
```

### 3.3 WhatsApp Notification via Fonnte

**Fonnte** adalah provider WhatsApp API unofficial paling populer di Indonesia. Harga terjangkau, mudah setup (scan QR), dan sudah ada Laravel package.

**Package options:**
- `tianrosandhy/laravel-fonnte` — wrapper HTTP sederhana
- `mansjoer/fonnte` — Packagist package (v1.0.3, April 2025)

**Implementasi custom notification channel:**

```php
// app/Channels/WhatsAppChannel.php
namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;

class WhatsAppChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        $message = $notification->toWhatsApp($notifiable);
        $phone = $notifiable->routeNotificationForWhatsApp();

        if (!$phone) {
            return;
        }

        Http::withHeaders([
            'Authorization' => config('services.fonnte.token'),
        ])->post('https://api.fonnte.com/send', [
            'target' => $phone,
            'message' => $message,
            'countryCode' => '62',
        ]);
    }
}
```

```php
// Pada Notification class, tambahkan channel:
public function via(object $notifiable): array
{
    return ['mail', WhatsAppChannel::class];
}

public function toWhatsApp(object $notifiable): string
{
    return "Pengaduan #{$this->complaint->ticket_number} telah diterima.\n\n"
         . "Subjek: {$this->complaint->subject}\n"
         . "Status: Menunggu Proses\n\n"
         . "Cek status di: " . route('complaints.show', $this->complaint);
}
```

```php
// config/services.php
'fonnte' => [
    'token' => env('FONNTE_TOKEN'),
],
```

**Alternatif provider:** Wablas, WooWA, WhatsApp Official Business API (Meta). Fonnte direkomendasikan untuk tahap awal karena biaya rendah dan setup mudah.

---

## 4. Spatie Activitylog v4 — Audit Trail

### 4.1 Konfigurasi Dasar

```php
// config/activitylog.php
return [
    'enabled' => env('ACTIVITY_LOGGER_ENABLED', true),
    'delete_records_older_than_days' => 365, // Simpan 1 tahun
    'default_log_name' => 'default',
    'default_auth_driver' => null,
    'subject_returns_soft_deleted_models' => false,
    'activity_model' => \Spatie\Activitylog\Models\Activity::class,
];
```

### 4.2 Model Logging dengan LogsActivity Trait

```php
// app/Models/Complaint.php
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Complaint extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['subject', 'description', 'status', 'service_type', 'assigned_to'])
            ->logOnlyDirty()           // Hanya log field yang berubah
            ->dontSubmitEmptyLogs()    // Jangan log jika tidak ada perubahan
            ->useLogName('complaint')
            ->setDescriptionForEvent(fn(string $eventName) => match($eventName) {
                'created' => 'Pengaduan baru dibuat',
                'updated' => 'Pengaduan diperbarui',
                'deleted' => 'Pengaduan dihapus',
                default => "Pengaduan {$eventName}",
            });
    }
}
```

### 4.3 Custom Activity Logging untuk Aksi Penting

```php
// Contoh: logging perubahan status pengaduan
activity('complaint')
    ->performedOn($complaint)
    ->causedBy(auth()->user())
    ->withProperties([
        'old_status' => $complaint->getOriginal('status'),
        'new_status' => $newStatus,
        'reason' => $reason,
        'ip_address' => request()->ip(),
    ])
    ->event('status_changed')
    ->log("Status diubah dari {$complaint->getOriginal('status')} ke {$newStatus}");
```

### 4.4 Performance Considerations

- **`logOnlyDirty()`**: Wajib — hanya log field yang berubah, hemat storage.
- **`dontSubmitEmptyLogs()`**: Cegah record kosong.
- **Batch operations**: Untuk import massal, disable logging sementara:

```php
activity()->disableLogging();
// ... operasi massal ...
activity()->enableLogging();
```

- **Cleanup schedule**: Tambahkan di `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('activitylog:clean')->daily();
```

- **Index**: Pastikan ada index pada kolom `log_name`, `subject_type`, `subject_id`, `causer_type`, `causer_id` untuk query performa.

---

## 5. File Upload Security

### 5.1 Allowed MIME Types

| Tipe File | MIME Type | Ekstensi |
|-----------|-----------|----------|
| JPEG      | image/jpeg | .jpg, .jpeg |
| PNG       | image/png  | .png |
| PDF       | application/pdf | .pdf |
| Word      | application/msword | .doc |
| Word (OpenXML) | application/vnd.openxmlformats-officedocument.wordprocessingml.document | .docx |

### 5.2 Server-Side Validation (10MB Max)

```php
// Dalam Form Request
'attachments.*' => [
    'file',
    'max:10240', // 10MB dalam KB
    'mimes:jpg,jpeg,png,pdf,doc,docx',
    // Tambahan: validasi MIME type sebenarnya (bukan hanya ekstensi)
    'mimetypes:image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
],
```

### 5.3 Client-Side Validation (React)

```tsx
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

function validateFiles(files: FileList): string | null {
    for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
            return `File "${file.name}" melebihi batas 10MB.`;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `File "${file.name}" memiliki format yang tidak didukung.`;
        }
    }
    return null;
}
```

### 5.4 Storage & Encryption at Rest

```php
// config/filesystems.php
'disks' => [
    'complaints' => [
        'driver' => 'local',
        'root' => storage_path('app/complaints'),
        'visibility' => 'private', // Tidak bisa diakses publik
    ],
],
```

**Enkripsi at rest:**

```php
// app/Actions/Complaint/StoreComplaintAttachmentsAction.php
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

class StoreComplaintAttachmentsAction
{
    public function execute(Complaint $complaint, array $files): void
    {
        foreach ($files as $file) {
            $content = file_get_contents($file->getRealPath());
            $hash = hash('sha256', $content);

            // Simpan terenkripsi
            $path = "complaints/{$complaint->id}/" . Str::uuid() . '.' . $file->getClientOriginalExtension();
            Storage::disk('complaints')->put($path, Crypt::encrypt($content));

            $complaint->attachments()->create([
                'original_name' => $file->getClientOriginalName(),
                'stored_path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'sha256_hash' => $hash,
            ]);
        }
    }
}
```

**Dekripsi saat download:**

```php
public function download(Attachment $attachment)
{
    $encrypted = Storage::disk('complaints')->get($attachment->stored_path);
    $content = Crypt::decrypt($encrypted);

    return response($content)
        ->header('Content-Type', $attachment->mime_type)
        ->header('Content-Disposition', 'attachment; filename="' . $attachment->original_name . '"');
}
```

### 5.5 SHA-256 Checksum

Checksum disimpan saat upload (lihat contoh di atas). Verifikasi integritas:

```php
public function verifyIntegrity(Attachment $attachment): bool
{
    $encrypted = Storage::disk('complaints')->get($attachment->stored_path);
    $content = Crypt::decrypt($encrypted);
    return hash('sha256', $content) === $attachment->sha256_hash;
}
```

### 5.6 Malware Scanning

**Opsi 1 — ClamAV (open source, self-hosted):**

```bash
sudo apt install clamav clamav-daemon
```

```php
// Gunakan package: sunspikes/clamav-validator
// composer require sunspikes/clamav-validator

// Dalam Form Request rules:
'attachments.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'clamav'],
```

**Opsi 2 — Scan manual via shell:**

```php
use Symfony\Component\Process\Process;

function scanFile(string $path): bool
{
    $process = new Process(['clamscan', '--no-summary', $path]);
    $process->run();
    return $process->isSuccessful(); // exit 0 = clean, exit 1 = infected
}
```

**Rekomendasi:** Install ClamAV di server production. Untuk development, bisa dilewati. Jalankan scan sebelum enkripsi dan penyimpanan.

---

## 6. Laravel Sanctum — Session-Based Auth untuk Inertia SPA

### 6.1 Konfigurasi

Inertia.js menggunakan **session-based authentication** (bukan token-based). Sanctum mendukung ini secara native.

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->statefulApi();

    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
    ]);
})
```

```env
# .env
SESSION_DRIVER=database
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,127.0.0.1:8000
```

### 6.2 CSRF Protection

Inertia.js menangani CSRF secara otomatis melalui cookie `XSRF-TOKEN` yang diset oleh Laravel. **Tidak perlu konfigurasi tambahan** jika menggunakan Inertia's built-in request methods (`router.post`, `useForm().post`, dll).

Axios setup (jika digunakan langsung):

```typescript
// resources/js/bootstrap.ts
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

### 6.3 Route Protection

```php
// routes/web.php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('complaints', ComplaintController::class);
});

// Untuk route yang butuh permission spesifik
Route::middleware(['auth', 'role_or_permission:admin|handle complaints'])->group(function () {
    Route::patch('/complaints/{complaint}/assign', [ComplaintController::class, 'assign']);
    Route::patch('/complaints/{complaint}/resolve', [ComplaintController::class, 'resolve']);
});
```

### 6.4 Login Flow

```php
// app/Http/Controllers/Auth/AuthenticatedSessionController.php
public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate();

    return redirect()->intended(route('dashboard'));
}
```

---

## 7. Format Nomor Tiket Pengaduan

### 7.1 Format yang Diusulkan

```
PA-PNJ-{YYYY}-{5-digit-sequence}
```

Contoh: `PA-PNJ-2026-00001`

Keterangan:
- `PA` = Pengadilan Agama
- `PNJ` = Penajam
- `YYYY` = Tahun pengaduan
- `5-digit-sequence` = Nomor urut, reset setiap tahun

Format ini mengikuti konvensi penomoran lembaga peradilan Indonesia yang menggunakan pola `kode-satker/tahun/urut`. Referensi: format nomor perkara PA menggunakan pola `123/Pdt.G/2025/PA.Pnj`.

### 7.2 Atomic Sequence Generation

```php
// app/Actions/Complaint/GenerateTicketNumberAction.php
namespace App\Actions\Complaint;

use App\Models\Complaint;
use Illuminate\Support\Facades\DB;

class GenerateTicketNumberAction
{
    public function execute(): string
    {
        $year = now()->year;
        $prefix = "PA-PNJ-{$year}-";

        // Atomic: menggunakan database lock untuk mencegah duplikasi
        return DB::transaction(function () use ($year, $prefix) {
            $lastComplaint = Complaint::where('ticket_number', 'like', $prefix . '%')
                ->lockForUpdate()
                ->orderByDesc('ticket_number')
                ->first();

            if ($lastComplaint) {
                $lastSequence = (int) substr($lastComplaint->ticket_number, -5);
                $newSequence = $lastSequence + 1;
            } else {
                $newSequence = 1;
            }

            return $prefix . str_pad($newSequence, 5, '0', STR_PAD_LEFT);
        });
    }
}
```

**Penting:**
- `lockForUpdate()` memastikan tidak ada race condition saat concurrent requests.
- Transaksi database menjamin atomicity.
- Reset otomatis setiap tahun karena prefix mengandung tahun.
- Kolom `ticket_number` harus `UNIQUE` di database.

```php
// Migration
$table->string('ticket_number')->unique();
$table->index('ticket_number'); // Untuk pencarian cepat
```

### 7.3 Alternatif: Sequence Table

Untuk volume sangat tinggi, gunakan tabel sequence terpisah:

```php
// Migration: create_ticket_sequences_table
Schema::create('ticket_sequences', function (Blueprint $table) {
    $table->id();
    $table->year('year')->unique();
    $table->unsignedInteger('last_sequence')->default(0);
});

// Action
$sequence = DB::table('ticket_sequences')
    ->where('year', $year)
    ->lockForUpdate()
    ->first();

if (!$sequence) {
    DB::table('ticket_sequences')->insert(['year' => $year, 'last_sequence' => 1]);
    $newSequence = 1;
} else {
    $newSequence = $sequence->last_sequence + 1;
    DB::table('ticket_sequences')->where('year', $year)->update(['last_sequence' => $newSequence]);
}
```

---

## 8. Spatie Laravel Permission

### 8.1 Roles & Permissions Design untuk SIPADU

**Roles:**

| Role | Deskripsi |
|------|-----------|
| `admin` | Administrator sistem, full access |
| `panitera` | Panitera/Sekretaris, kelola pengaduan |
| `petugas` | Petugas pelayanan, handle pengaduan |
| `masyarakat` | Pengguna publik, ajukan pengaduan |

**Permissions:**

| Permission | Deskripsi |
|------------|-----------|
| `complaints.create` | Membuat pengaduan baru |
| `complaints.view` | Melihat detail pengaduan |
| `complaints.view-all` | Melihat semua pengaduan (admin/panitera) |
| `complaints.assign` | Menugaskan pengaduan ke petugas |
| `complaints.respond` | Merespon pengaduan |
| `complaints.resolve` | Menyelesaikan pengaduan |
| `complaints.delete` | Menghapus pengaduan |
| `users.manage` | Manajemen pengguna |
| `roles.manage` | Manajemen role & permission |
| `reports.view` | Melihat laporan statistik |

### 8.2 Seeder Setup

```php
// database/seeders/RolePermissionSeeder.php
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'complaints.create', 'complaints.view', 'complaints.view-all',
            'complaints.assign', 'complaints.respond', 'complaints.resolve',
            'complaints.delete', 'users.manage', 'roles.manage', 'reports.view',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        Role::create(['name' => 'admin'])->givePermissionTo(Permission::all());

        Role::create(['name' => 'panitera'])->givePermissionTo([
            'complaints.view', 'complaints.view-all', 'complaints.assign',
            'complaints.respond', 'complaints.resolve', 'reports.view',
        ]);

        Role::create(['name' => 'petugas'])->givePermissionTo([
            'complaints.view', 'complaints.respond', 'complaints.resolve',
        ]);

        Role::create(['name' => 'masyarakat'])->givePermissionTo([
            'complaints.create', 'complaints.view',
        ]);
    }
}
```

### 8.3 Middleware Usage

```php
// routes/web.php
Route::middleware(['auth'])->group(function () {
    // Masyarakat bisa buat pengaduan
    Route::middleware('permission:complaints.create')
        ->post('/complaints', [ComplaintController::class, 'store']);

    // Admin/Panitera bisa lihat semua
    Route::middleware('permission:complaints.view-all')
        ->get('/complaints/all', [ComplaintController::class, 'index']);

    // Panitera assign ke petugas
    Route::middleware('permission:complaints.assign')
        ->patch('/complaints/{complaint}/assign', [ComplaintController::class, 'assign']);

    // Admin manage users
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::resource('users', UserController::class);
    });
});
```

### 8.4 Blade/React Authorization Check

Di Inertia, kirim permissions via shared data (lihat section 2.3), lalu check di React:

```tsx
// hooks/usePermission.ts
import { usePage } from '@inertiajs/react';

export function usePermission() {
    const { auth } = usePage().props;

    return {
        can: (permission: string) => auth.user?.permissions?.includes(permission) ?? false,
        hasRole: (role: string) => auth.user?.roles?.includes(role) ?? false,
    };
}

// Penggunaan:
const { can } = usePermission();
{can('complaints.assign') && <AssignButton />}
```

---

## 9. Ringkasan Rekomendasi Arsitektur

| Aspek | Rekomendasi |
|-------|-------------|
| Backend Pattern | Action Classes + Form Requests + API Resources |
| Frontend | Inertia v2 useForm + TypeScript + Deferred Props |
| Auth | Sanctum session-based (bukan token) |
| Queue | Database driver (awal), migrasi ke Redis jika perlu |
| Email | Laravel Notification + ShouldQueue |
| WhatsApp | Fonnte API via custom notification channel |
| Audit Trail | Spatie Activitylog v4, logOnlyDirty, custom events |
| File Upload | Server: mimetypes validation, Client: type+size check |
| File Storage | Encrypted at rest (Laravel Crypt), SHA-256 checksum |
| Malware Scan | ClamAV di production |
| Ticket Format | PA-PNJ-YYYY-XXXXX, atomic sequence via lockForUpdate |
| Authorization | Spatie Permission, 4 roles, 10 permissions |
| CSRF | Otomatis via Inertia + Sanctum session |

---

## 10. Referensi

- Laravel 12 Documentation: https://laravel.com/docs/12.x
- Inertia.js v2 Documentation: https://inertiajs.com
- Spatie Activitylog: https://spatie.be/docs/laravel-activitylog
- Spatie Laravel Permission v6: https://spatie.be/docs/laravel-permission/v6
- Laravel Sanctum: https://laravel.com/docs/12.x/sanctum
- Fonnte WhatsApp API: https://docs.fonnte.com
- SIWAS Mahkamah Agung RI: https://siwas.mahkamahagung.go.id
- PERMA No. 9/2016 tentang Pedoman Penanganan Pengaduan
