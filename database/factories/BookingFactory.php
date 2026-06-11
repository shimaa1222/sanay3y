<?php

namespace Database\Factories;

use App\Models\Craftsman;
use App\Models\CraftsmanService;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BookingFactory extends Factory
{
    public function definition(): array
    {
        $servicePrice = $this->faker->randomFloat(2, 100, 1000);
        $platformFee  = round($servicePrice * 0.10, 2);
        $status       = $this->faker->randomElement(['pending', 'confirmed', 'completed', 'cancelled', 'rejected']);

        return [
            'booking_number'    => strtoupper(Str::random(8)),
            'client_id'         => User::factory()->client(),
            'craftsman_id'      => Craftsman::factory()->approved(),
            'service_id'        => null,
            'service_title'     => $this->faker->sentence(3),
            'booking_date'      => $this->faker->dateTimeBetween('-1 month', '+1 month'),
            'booking_time'      => $this->faker->time('H:i'),
            'notes'             => $this->faker->optional()->sentence(),
            'location'          => $this->faker->address(),
            'service_price'     => $servicePrice,
            'platform_fee'      => $platformFee,
            'total_price'       => $servicePrice + $platformFee,
            'status'            => $status,
            'cancellation_reason' => $status === 'cancelled' ? $this->faker->sentence() : null,
            'confirmed_at'      => in_array($status, ['confirmed', 'completed']) ? now() : null,
            'completed_at'      => $status === 'completed' ? now() : null,
            'cancelled_at'      => $status === 'cancelled' ? now() : null,
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending', 'confirmed_at' => null, 'completed_at' => null, 'cancelled_at' => null]);
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed', 'confirmed_at' => now()->subDays(2), 'completed_at' => now()]);
    }

    public function cancelled(): static
    {
        return $this->state(['status' => 'cancelled', 'cancelled_at' => now(), 'cancellation_reason' => 'تم الإلغاء من قِبل العميل']);
    }
}
