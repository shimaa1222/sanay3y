<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AdminSetting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'description'];

    // ─── Static Helpers ────────────────────────────────────────

    /**
     * جلب إعداد بمفتاحه مع قيمة افتراضية
     *
     * Usage:
     *   AdminSetting::get('platform_fee_percent', 10)
     *   AdminSetting::get('auto_approve_craftsmen', false)
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $settings = Cache::remember('admin_settings', 3600, function () {
            return static::pluck('value', 'key')->toArray();
        });

        $value = $settings[$key] ?? null;

        if ($value === null) return $default;

        // Cast based on type
        $type = static::where('key', $key)->value('type');
        return match($type) {
            'boolean' => (bool)(int)$value,
            'integer' => (int)$value,
            'json'    => json_decode($value, true),
            default   => $value,
        };
    }

    /**
     * تحديث إعداد وتنظيف الـ cache
     */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key'   => $key],
            ['value' => is_bool($value) ? (int)$value : $value]
        );
        Cache::forget('admin_settings');
    }

    /**
     * القيم الافتراضية للمشروع
     */
    public static function defaults(): array
    {
        return [
            'platform_fee_percent'       => 10,
            'max_images_per_post'        => 5,
            'booking_cancellation_hours' => 24,
            'auto_approve_craftsmen'     => false,
            'maintenance_mode'           => false,
            'support_email'              => 'support@sanay3y.com',
            'support_phone'              => '+966500000000',
            'otp_expiry_minutes'         => 5,
            'max_otp_attempts'           => 3,
            'min_booking_advance_hours'  => 1,
            'max_portfolio_images'       => 12,
            'featured_craftsmen_limit'   => 8,
        ];
    }
}
