<?php

namespace Database\Seeders;

use App\Models\Craft;
use Illuminate\Database\Seeder;

class CraftSeeder extends Seeder
{
    public function run(): void
    {
        $crafts = [
            ['name' => 'سباكة',            'name_en' => 'Plumbing',       'icon' => '🔧', 'description' => 'تركيب وإصلاح شبكات المياه والصرف الصحي'],
            ['name' => 'كهرباء',           'name_en' => 'Electrical',     'icon' => '⚡', 'description' => 'أعمال التمديدات الكهربائية والصيانة'],
            ['name' => 'نجارة',            'name_en' => 'Carpentry',      'icon' => '🪵', 'description' => 'تصنيع وتركيب الأثاث الخشبي والأبواب'],
            ['name' => 'دهانات',           'name_en' => 'Painting',       'icon' => '🎨', 'description' => 'دهانات داخلية وخارجية وديكور'],
            ['name' => 'تكييف وتبريد',     'name_en' => 'AC Repair',      'icon' => '❄️', 'description' => 'تركيب وصيانة أجهزة التكييف'],
            ['name' => 'بلاط وسيراميك',   'name_en' => 'Tiling',         'icon' => '🏗️', 'description' => 'تركيب أعمال التبليط والسيراميك'],
            ['name' => 'حدادة',            'name_en' => 'Welding',        'icon' => '🔩', 'description' => 'أعمال اللحام والحدادة المعمارية'],
            ['name' => 'ألومنيوم',         'name_en' => 'Aluminum',       'icon' => '🪟', 'description' => 'تركيب النوافذ والأبواب الألومنيوم'],
            ['name' => 'صيانة أجهزة',     'name_en' => 'Appliances',     'icon' => '📺', 'description' => 'صيانة الأجهزة المنزلية'],
            ['name' => 'تنظيف',            'name_en' => 'Cleaning',       'icon' => '🧹', 'description' => 'خدمات التنظيف الشامل'],
        ];

        foreach ($crafts as $craft) {
            Craft::updateOrCreate(
                ['name' => $craft['name']],
                array_merge($craft, ['is_active' => true])
            );
        }

        $this->command->info('✅ Crafts seeded');
    }
}
