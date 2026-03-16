<?php

namespace App\Http\Controllers\Public;

use App\Actions\Complaint\CreateComplaintAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreComplaintRequest;
use App\Models\ComplaintCategory;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintFormController extends Controller
{
    /**
     * Menampilkan form pengaduan publik.
     */
    public function create(): Response
    {
        return Inertia::render('Pengaduan/Buat', [
            'categories' => ComplaintCategory::active()->orderBy('name')->get(['id', 'name', 'code', 'sla_days']),
        ]);
    }

    /**
     * Menyimpan pengaduan baru.
     */
    public function store(StoreComplaintRequest $request, CreateComplaintAction $action)
    {
        $complaint = $action->execute($request->validated());

        return Inertia::render('Pengaduan/Buat', [
            'categories' => ComplaintCategory::active()->orderBy('name')->get(['id', 'name', 'code', 'sla_days']),
            'success' => [
                'ticket_no' => $complaint->ticket_no,
                'title' => $complaint->title,
                'category' => $complaint->category->name,
                'created_at' => $complaint->created_at->format('d M Y H:i'),
                'sla_deadline' => $complaint->sla_deadline->format('d M Y'),
            ],
        ]);
    }
}
