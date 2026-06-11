<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Craftsman;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    private static array $comments = [
        'شغل ممتاز وسريع، أنصح بيه',
        'محترف ونظيف في شغله',
        'جيد لكن تأخر في الموعد',
        'أفضل حرفي تعاملت معاه',
        'سعر مناسب وجودة عالية',
        'تعامل راقي وشغل متقن',
        'وصل في الموعد وأنهى الشغل بسرعة',
        'نتيجة أحسن من المتوقع',
    ];

    public function definition(): array
    {
        return [
            'booking_id'   => Booking::factory()->completed(),
            'client_id'    => User::factory()->client(),
            'craftsman_id' => Craftsman::factory()->approved(),
            'rating'       => $this->faker->numberBetween(1, 5),
            'comment'      => $this->faker->randomElement(self::$comments),
            'is_visible'   => true,
        ];
    }

    public function hidden(): static
    {
        return $this->state(['is_visible' => false]);
    }
}
