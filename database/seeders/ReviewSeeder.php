<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // بنجيب الـ completed bookings اللي معندهاش review
        $completedBookings = Booking::where('status', 'completed')
            ->whereDoesntHave('review')
            ->with('craftsman')
            ->get();

        if ($completedBookings->isEmpty()) {
            $this->command->warn('⚠️ No completed bookings found for reviews');
            return;
        }

        // نعمل review لـ 75% من الـ completed bookings
        $toReview = $completedBookings->random((int) ceil($completedBookings->count() * 0.75));

        foreach ($toReview as $booking) {
            if (!$booking->craftsman) continue;

            Review::create([
                'booking_id'   => $booking->id,
                'client_id'    => $booking->client_id,
                'craftsman_id' => $booking->craftsman_id,
                'rating'       => fake()->numberBetween(3, 5),
                'comment'      => fake()->randomElement([
                    'شغل ممتاز وسريع، أنصح بيه بشدة',
                    'محترف ونظيف في شغله، هتعامل معاه تاني',
                    'جيد لكن تأخر شوية عن الموعد',
                    'أفضل حرفي تعاملت معاه، سعر مناسب',
                    'تعامل راقي وشغل متقن، ممتاز',
                    'وصل في الموعد وأنهى الشغل بدون مشاكل',
                    'نتيجة أحسن من المتوقع، شكراً',
                    'يستاهل التقييم العالي، شغله محترم',
                ]),
                'is_visible' => true,
            ]);
        }

        $this->command->info('✅ Reviews seeded (' . $toReview->count() . ' reviews)');
    }
}
