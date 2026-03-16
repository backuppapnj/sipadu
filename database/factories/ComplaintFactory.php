<?php

namespace Database\Factories;

use App\Enums\ComplaintStatusEnum;
use App\Enums\DataClassificationEnum;
use App\Enums\PriorityEnum;
use App\Models\Complaint;
use App\Models\ComplaintCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Complaint>
 */
class ComplaintFactory extends Factory
{
    protected $model = Complaint::class;

    /**
     * Mendefinisikan state default model.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $ticketCounter = 0;
        $ticketCounter++;

        return [
            'ticket_no' => sprintf('PA-PNJ-%d-%05d', now()->year, $ticketCounter),
            'user_id' => User::factory(),
            'category_id' => ComplaintCategory::factory(),
            'title' => fake()->sentence(6),
            'description' => fake()->paragraphs(2, true),
            'reported_party' => fake()->optional(0.3)->name(),
            'incident_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'incident_location' => 'Kantor PA Penajam, Jl. Provinsi KM. 9',
            'status' => ComplaintStatusEnum::SUBMITTED,
            'priority' => PriorityEnum::NORMAL,
            'assigned_to' => null,
            'sla_deadline' => now()->addWeekdays(14),
            'resolved_at' => null,
            'is_anonymous' => false,
            'is_confidential' => false,
            'data_classification' => DataClassificationEnum::INTERNAL,
            'complainant_name' => fake()->name(),
            'complainant_phone' => '08' . fake()->numerify('##########'),
            'complainant_email' => fake()->safeEmail(),
            'complainant_address' => fake()->address(),
        ];
    }

    /**
     * State: status submitted.
     */
    public function submitted(): static
    {
        return $this->state(fn () => ['status' => ComplaintStatusEnum::SUBMITTED]);
    }

    /**
     * State: status verified.
     */
    public function verified(): static
    {
        return $this->state(fn () => ['status' => ComplaintStatusEnum::VERIFIED]);
    }

    /**
     * State: status assigned.
     */
    public function assigned(): static
    {
        return $this->state(fn () => [
            'status' => ComplaintStatusEnum::ASSIGNED,
            'assigned_to' => User::factory()->petugas(),
        ]);
    }

    /**
     * State: status in_progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn () => [
            'status' => ComplaintStatusEnum::IN_PROGRESS,
            'assigned_to' => User::factory()->petugas(),
        ]);
    }

    /**
     * State: status responded.
     */
    public function responded(): static
    {
        return $this->state(fn () => [
            'status' => ComplaintStatusEnum::RESPONDED,
            'assigned_to' => User::factory()->petugas(),
        ]);
    }

    /**
     * State: status resolved.
     */
    public function resolved(): static
    {
        return $this->state(fn () => [
            'status' => ComplaintStatusEnum::RESOLVED,
            'assigned_to' => User::factory()->petugas(),
            'resolved_at' => now(),
        ]);
    }

    /**
     * State: status rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn () => ['status' => ComplaintStatusEnum::REJECTED]);
    }

    /**
     * State: overdue (SLA terlewat).
     */
    public function overdue(): static
    {
        return $this->state(fn () => [
            'sla_deadline' => now()->subDays(5),
            'status' => ComplaintStatusEnum::IN_PROGRESS,
            'assigned_to' => User::factory()->petugas(),
        ]);
    }

    /**
     * State: pengaduan anonim.
     */
    public function anonymous(): static
    {
        return $this->state(fn () => [
            'is_anonymous' => true,
            'user_id' => null,
        ]);
    }

    /**
     * State: pengaduan rahasia.
     */
    public function confidential(): static
    {
        return $this->state(fn () => [
            'is_confidential' => true,
            'data_classification' => DataClassificationEnum::CONFIDENTIAL,
        ]);
    }

    /**
     * Mengatur kategori pengaduan.
     */
    public function withCategory(ComplaintCategory $category): static
    {
        return $this->state(fn () => ['category_id' => $category->id]);
    }

    /**
     * Mengatur pengguna pelapor.
     */
    public function byUser(User $user): static
    {
        return $this->state(fn () => [
            'user_id' => $user->id,
            'complainant_name' => $user->name,
            'complainant_email' => $user->email,
            'complainant_phone' => $user->phone,
        ]);
    }

    /**
     * Mengatur petugas yang ditugaskan.
     */
    public function assignedTo(User $petugas): static
    {
        return $this->state(fn () => ['assigned_to' => $petugas->id]);
    }
}
