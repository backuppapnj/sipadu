<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Form publik — semua orang boleh mengajukan pengaduan
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'complainant_nik' => ['required', 'string', 'digits:16'],
            'complainant_name' => ['required', 'string', 'max:255'],
            'complainant_address' => ['nullable', 'string', 'max:500'],
            'complainant_phone' => ['required', 'string', 'regex:/^(\+62|62|0)8[1-9][0-9]{6,10}$/'],
            'complainant_email' => ['nullable', 'email', 'max:255'],
            'category_id' => ['required', 'exists:complaint_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'incident_date' => ['required', 'date', 'before_or_equal:today'],
            'incident_location' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string', 'min:50', 'max:5000'],
            'reported_party' => ['nullable', 'string', 'max:255'],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'max:10240', // 10MB
                'mimes:jpg,jpeg,png,pdf,doc,docx',
                'mimetypes:image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            'is_anonymous' => ['nullable', 'boolean'],
            'is_confidential' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Pesan validasi dalam Bahasa Indonesia.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'complainant_nik.required' => 'NIK wajib diisi.',
            'complainant_nik.digits' => 'NIK harus terdiri dari 16 digit.',
            'complainant_name.required' => 'Nama lengkap wajib diisi.',
            'complainant_name.max' => 'Nama lengkap maksimal 255 karakter.',
            'complainant_phone.required' => 'Nomor HP wajib diisi.',
            'complainant_phone.regex' => 'Format nomor HP tidak valid. Gunakan format Indonesia (08xx).',
            'complainant_email.email' => 'Format email tidak valid.',
            'category_id.required' => 'Kategori pengaduan wajib dipilih.',
            'category_id.exists' => 'Kategori pengaduan tidak ditemukan.',
            'title.required' => 'Judul pengaduan wajib diisi.',
            'title.max' => 'Judul pengaduan maksimal 255 karakter.',
            'incident_date.required' => 'Tanggal kejadian wajib diisi.',
            'incident_date.before_or_equal' => 'Tanggal kejadian tidak boleh di masa depan.',
            'incident_location.required' => 'Lokasi kejadian wajib diisi.',
            'description.required' => 'Uraian lengkap wajib diisi.',
            'description.min' => 'Uraian lengkap minimal 50 karakter.',
            'description.max' => 'Uraian lengkap maksimal 5000 karakter.',
            'attachments.max' => 'Maksimal 5 file lampiran.',
            'attachments.*.max' => 'Ukuran file maksimal 10MB.',
            'attachments.*.mimes' => 'Format file harus JPG, PNG, PDF, DOC, atau DOCX.',
            'attachments.*.mimetypes' => 'Tipe file tidak valid.',
        ];
    }
}
