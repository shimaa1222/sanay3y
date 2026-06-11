<?php

namespace Database\Factories;

use App\Models\Craftsman;
use Illuminate\Database\Eloquent\Factories\Factory;

class CraftsmanSkillFactory extends Factory
{
    private static array $skills = [
        'تركيب أنابيب PVC', 'صيانة ضخات المياه', 'عزل مائي',
        'تركيب لوحات كهربائية', 'تمديد كابلات', 'أنظمة إنذار',
        'نجارة خشب طبيعي', 'MDF وأعمال ديكور', 'باركيه',
        'دهان أكريليك', 'ورق حائط', 'ديكورات جبس',
        'صيانة تكييف سبليت', 'تكييف مركزي', 'شبكات تبريد',
        'سيراميك وبورسلان', 'رخام', 'موزاييك',
        'لحام CO2', 'لحام أسيتيلين', 'حدادة مشغولة',
        'ألومنيوم كومبوزيت', 'ستارة زجاجية', 'قواطع ألومنيوم',
    ];

    public function definition(): array
    {
        return [
            'craftsman_id' => Craftsman::factory()->approved(),
            'skill'        => $this->faker->unique()->randomElement(self::$skills),
        ];
    }
}
