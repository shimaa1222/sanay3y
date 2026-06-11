<?php

namespace Database\Seeders;

use App\Models\AdminSetting;
use Illuminate\Database\Seeder;

class AdminSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'platform_fee_percent',       'value' => '10',                    'type' => 'integer', 'description' => 'نسبة عمولة المنصة %'],
            ['key' => 'max_images_per_post',         'value' => '5',                     'type' => 'integer', 'description' => 'أقصى عدد صور لكل منشور'],
            ['key' => 'booking_cancellation_hours',  'value' => '24',                    'type' => 'integer', 'description' => 'ساعات الإلغاء المسموح بها'],
            ['key' => 'auto_approve_craftsmen',      'value' => '0',                     'type' => 'boolean', 'description' => 'موافقة تلقائية على الحرفيين'],
            ['key' => 'maintenance_mode',            'value' => '0',                     'type' => 'boolean', 'description' => 'وضع الصيانة'],
            ['key' => 'support_email',               'value' => 'support@sanay3y.com',   'type' => 'string',  'description' => 'إيميل الدعم الفني'],
            ['key' => 'support_phone',               'value' => '+201000000000',         'type' => 'string',  'description' => 'رقم الدعم الفني'],
            ['key' => 'otp_expiry_minutes',          'value' => '5',                     'type' => 'integer', 'description' => 'مدة انتهاء الـ OTP بالدقائق'],
            ['key' => 'max_otp_attempts',            'value' => '3',                     'type' => 'integer', 'description' => 'أقصى عدد محاولات OTP'],
            ['key' => 'min_booking_advance_hours',   'value' => '1',                     'type' => 'integer', 'description' => 'أقل مدة حجز مسبق بالساعات'],
            ['key' => 'max_portfolio_images',        'value' => '12',                    'type' => 'integer', 'description' => 'أقصى صور في البورتفوليو'],
            ['key' => 'featured_craftsmen_limit',    'value' => '8',                     'type' => 'integer', 'description' => 'عدد الحرفيين المميزين'],
        ];

        foreach ($settings as $setting) {
            AdminSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
        $this->command->info('✅ Admin settings seeded successfully');
    }
}
