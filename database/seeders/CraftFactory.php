<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CraftFactory extends Factory
{
    // مهن حقيقية للمشروع
    private static array $crafts = [
        ['name' => 'سباكة',       'name_en' => 'Plumbing',       'icon' => '🔧'],
        ['name' => 'كهرباء',      'name_en' => 'Electrical',     'icon' => '⚡'],
        ['name' => 'نجارة',       'name_en' => 'Carpentry',      'icon' => '🪵'],
        ['name' => 'دهانات',      'name_en' => 'Painting',       'icon' => '🎨'],
        ['name' => 'تكييف',       'name_en' => 'AC Repair',      'icon' => '❄️'],
        ['name' => 'بلاط وسيراميك','name_en' => 'Tiling',        'icon' => '🏗️'],
        ['name' => 'حدادة',       'name_en' => 'Welding',        'icon' => '🔩'],
        ['name' => 'ألومنيوم',    'name_en' => 'Aluminum',       'icon' => '🪟'],
        ['name' => 'صيانة أجهزة', 'name_en' => 'Appliances',    'icon' => '📺'],
        ['name' => 'تنظيف',       'name_en' => 'Cleaning',       'icon' => '🧹'],
    ];

    private static int $index = 0;

    public function definition(): array
    {
        $craft = self::$crafts[self::$index % count(self::$crafts)];
        self::$index++;

        return [
            'name'        => $craft['name'],
            'name_en'     => $craft['name_en'],
            'icon'        => $craft['icon'],
            'description' => $this->faker->sentence(6),
            'is_active'   => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
