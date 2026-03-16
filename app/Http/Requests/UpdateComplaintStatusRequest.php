<?php

namespace App\Http\Requests;

use App\Enums\ComplaintStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateComplaintStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(ComplaintStatusEnum::class)],
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Status baru wajib dipilih.',
            'status.Illuminate\Validation\Rules\Enum' => 'Status yang dipilih tidak valid.',
            'note.max' => 'Catatan maksimal 2000 karakter.',
        ];
    }
}
