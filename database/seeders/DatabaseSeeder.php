<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSettingSeeder::class,   // 1. الإعدادات أولاً
            UserSeeder::class,           // 2. المستخدمين
            CraftSeeder::class,          // 3. المهن
            CraftsmanSeeder::class,      // 4. الحرفيين
            ServicePostSeeder::class,    // 5. المنشورات
            BookingSeeder::class,        // 6. الحجوزات
            ReviewSeeder::class,         // 7. التقييمات
        ]);
    }
}
