<?php

namespace Database\Factories;

use App\Models\Craft;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServicePostFactory extends Factory
{
    private static array $cities    = ['القاهرة', 'الجيزة', 'الإسكندرية', 'أسيوط', 'المنصورة', 'طنطا'];
    private static array $titles    = [
        'محتاج سباك لإصلاح تسرب في الحمام',
        'تركيب لمبات ومفاتيح كهرباء',
        'دهان شقة 3 غرف',
        'تركيب تكييف سبليت',
        'تبليط حمام صغير',
        'صيانة باب خشبي',
        'تنظيف شقة بعد تشطيب',
        'تركيب نافذة ألومنيوم',
        'إصلاح غسالة أوتوماتيك',
        'عزل سطح المنزل',
    ];

    public function definition(): array
    {
        $budgetFrom = $this->faker->randomFloat(2, 100, 1000);
        $budgetTo   = $budgetFrom + $this->faker->randomFloat(2, 100, 500);

        return [
            'client_id'       => User::factory()->client(),
            'title'           => $this->faker->randomElement(self::$titles),
            'description'     => $this->faker->paragraph(3),
            'craft_id'        => Craft::inRandomOrder()->first()?->id ?? Craft::factory(),
            'custom_craft'    => null,
            'location'        => $this->faker->address(),
            'city'            => $this->faker->randomElement(self::$cities),
            'budget_from'     => $budgetFrom,
            'budget_to'       => $budgetTo,
            'needed_by'       => $this->faker->dateTimeBetween('+1 day', '+30 days'),
            'urgency'         => $this->faker->randomElement(['low', 'medium', 'high', 'emergency']),
            'status'          => 'active',
            'is_approved'     => true,
            'views_count'     => $this->faker->numberBetween(0, 100),
            'responses_count' => 0,
        ];
    }

    public function pending(): static
    {
        return $this->state(['is_approved' => false, 'status' => 'active']);
    }

    public function closed(): static
    {
        return $this->state(['status' => 'closed']);
    }
}
