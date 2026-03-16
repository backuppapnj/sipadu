<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('complaints.assign');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'assigned_to' => ['required', 'exists:users,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'assigned_to.required' => 'Petugas yang ditugaskan wajib dipilih.',
            'assigned_to.exists' => 'Petugas yang dipilih tidak ditemukan.',
            'note.max' => 'Catatan maksimal 1000 karakter.',
        ];
    }
}
