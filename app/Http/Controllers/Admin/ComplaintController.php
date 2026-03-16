<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Complaint\AssignComplaintAction;
use App\Actions\Complaint\UpdateComplaintStatusAction;
use App\Enums\ComplaintStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignComplaintRequest;
use App\Http\Requests\UpdateComplaintStatusRequest;
use App\Models\Complaint;
use App\Models\ComplaintDisposition;
use App\Models\User;
use App\Services\AuditService;
use App\Services\SlaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintController extends Controller
{
    public function __construct(
        private SlaService $slaService,
        private AuditService $auditService,
    ) {}

    /**
     * Menampilkan daftar semua pengaduan.
     */
    public function index(Request $request): Response
    {
        $query = Complaint::with(['category', 'assignee'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('ticket_no', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('complainant_name', 'like', "%{$search}%");
            });
        }

        $complaints = $query->paginate(15)
            ->through(fn ($c) => [
                'id' => $c->id,
                'ticket_no' => $c->ticket_no,
                'title' => $c->title,
                'category' => $c->category->name,
                'complainant_name' => $c->is_anonymous ? 'Anonim' : $c->complainant_name,
                'status' => $c->status->value,
                'status_label' => $c->status->label(),
                'status_color' => $c->status->color(),
                'priority' => $c->priority->value,
                'priority_label' => $c->priority->label(),
                'assigned_to_name' => $c->assignee?->name,
                'sla_deadline' => $c->sla_deadline->format('d M Y'),
                'is_overdue' => $c->isOverdue(),
                'created_at' => $c->created_at->format('d M Y H:i'),
            ]);

        return Inertia::render('Admin/Complaints/Index', [
            'complaints' => $complaints,
            'filters' => $request->only(['status', 'category_id', 'search']),
            'statuses' => collect(ComplaintStatusEnum::cases())->map(fn ($s) => ['value' => $s->value, 'label' => $s->label()]),
        ]);
    }

    /**
     * Menampilkan detail pengaduan.
     */
    public function show(Complaint $complaint): Response
    {
        $complaint->load(['category', 'assignee', 'user', 'statusHistory.updater', 'attachments', 'dispositions.sender', 'dispositions.receiver']);

        $this->auditService->log('read', $complaint);

        return Inertia::render('Admin/Complaints/Show', [
            'complaint' => [
                'id' => $complaint->id,
                'ticket_no' => $complaint->ticket_no,
                'title' => $complaint->title,
                'description' => $complaint->description,
                'category' => $complaint->category->name,
                'complainant_name' => $complaint->is_anonymous ? 'Anonim' : $complaint->complainant_name,
                'complainant_phone' => $complaint->is_anonymous ? null : $complaint->complainant_phone,
                'complainant_email' => $complaint->is_anonymous ? null : $complaint->complainant_email,
                'reported_party' => $complaint->reported_party,
                'incident_date' => $complaint->incident_date->format('d M Y'),
                'incident_location' => $complaint->incident_location,
                'status' => $complaint->status->value,
                'status_label' => $complaint->status->label(),
                'priority' => $complaint->priority->value,
                'priority_label' => $complaint->priority->label(),
                'assigned_to_name' => $complaint->assignee?->name,
                'sla_deadline' => $complaint->sla_deadline->format('d M Y'),
                'is_overdue' => $complaint->isOverdue(),
                'remaining_days' => $this->slaService->getRemainingDays($complaint),
                'percentage_used' => $this->slaService->getPercentageUsed($complaint),
                'is_anonymous' => $complaint->is_anonymous,
                'is_confidential' => $complaint->is_confidential,
                'data_classification' => $complaint->data_classification->value,
                'created_at' => $complaint->created_at->format('d M Y H:i'),
                'resolved_at' => $complaint->resolved_at?->format('d M Y H:i'),
            ],
            'timeline' => $complaint->statusHistory->map(fn ($s) => [
                'status' => $s->status->value,
                'label' => $s->status->label(),
                'color' => $s->status->color(),
                'note' => $s->note,
                'updated_by' => $s->updater->name,
                'created_at' => $s->created_at->format('d M Y H:i'),
            ]),
            'attachments' => $complaint->attachments->map(fn ($a) => [
                'id' => $a->id,
                'original_name' => $a->original_name,
                'mime_type' => $a->mime_type,
                'formatted_size' => $a->formatted_size,
            ]),
            'dispositions' => $complaint->dispositions->map(fn ($d) => [
                'id' => $d->id,
                'from' => $d->sender->name,
                'to' => $d->receiver->name,
                'note' => $d->note,
                'created_at' => $d->created_at->format('d M Y H:i'),
            ]),
            'petugas' => User::role('petugas')->where('is_active', true)->get(['id', 'name']),
            'allowedTransitions' => $complaint->status->allowedTransitions(),
        ]);
    }

    /**
     * Menugaskan pengaduan ke petugas.
     */
    public function assign(AssignComplaintRequest $request, Complaint $complaint, AssignComplaintAction $action): RedirectResponse
    {
        $assignee = User::findOrFail($request->validated('assigned_to'));

        $action->execute($complaint, $assignee, $request->validated('note'));

        return back()->with('success', "Pengaduan berhasil ditugaskan kepada {$assignee->name}.");
    }

    /**
     * Memperbarui status pengaduan.
     */
    public function updateStatus(UpdateComplaintStatusRequest $request, Complaint $complaint, UpdateComplaintStatusAction $action): RedirectResponse
    {
        $newStatus = ComplaintStatusEnum::from($request->validated('status'));

        try {
            $action->execute($complaint, $newStatus, $request->validated('note'));

            return back()->with('success', "Status pengaduan berhasil diubah menjadi {$newStatus->label()}.");
        } catch (\InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Membuat disposisi pengaduan ke petugas/unit lain.
     */
    public function disposisi(Request $request, Complaint $complaint): RedirectResponse
    {
        $validated = $request->validate([
            'to_user' => ['required', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ], [
            'to_user.required' => 'Penerima disposisi wajib dipilih.',
            'to_user.exists' => 'Penerima disposisi tidak ditemukan.',
        ]);

        ComplaintDisposition::create([
            'complaint_id' => $complaint->id,
            'from_user' => auth()->id(),
            'to_user' => $validated['to_user'],
            'note' => $validated['note'] ?? null,
        ]);

        // Update assigned_to jika disposisi ke petugas baru
        $complaint->update(['assigned_to' => $validated['to_user']]);

        $this->auditService->log('disposisi', $complaint, null, [
            'to_user' => $validated['to_user'],
            'note' => $validated['note'] ?? null,
        ]);

        $receiver = User::find($validated['to_user']);

        return back()->with('success', "Pengaduan berhasil didisposisikan kepada {$receiver->name}.");
    }
}
