<?php

namespace Database\Factories;

use App\Models\Craftsman;
use Illuminate\Database\Eloquent\Factories\Factory;

class CraftsmanServiceFactory extends Factory
{
    private static array $services = [
        'تركيب وصيانة أنابيب المياه',
        'إصلاح تسربات المياه',
        'تركيب كهرباء المنازل',
        'صيانة لوحات الكهرباء',
        'نجارة ديكور وأثاث',
        'تركيب أبواب وشبابيك',
        'دهانات داخلية وخارجية',
        'تركيب وصيانة التكييف',
        'تركيب بلاط وسيراميك',
        'لحام وأعمال حدادة',
        'تركيب نوافذ ألومنيوم',
        'صيانة غسالات وثلاجات',
        'تنظيف شامل للمنازل',
        'عزل أسطح وحمامات',
    ];

    public function definition(): array
    {
        $priceFrom = $this->faker->randomFloat(2, 50, 300);
        return [
            'craftsman_id' => Craftsman::factory()->approved(),
            'title'        => $this->faker->randomElement(self::$services),
            'description'  => $this->faker->paragraph(2),
            'price_from'   => $priceFrom,
            'price_label'  => 'يبدأ من ' . $priceFrom . ' جنيه',
        ];
    }
}
