<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use App\Models\Booking;
use App\Models\Craftsman;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminSettingsController extends Controller
{
    /**
     * GET /admin/settings
     * نفس AdminSettingsController::index في الـ API
     */
    public function index()
    {
        $settings = Cache::remember('admin_settings', 3600, function () {
            return AdminSetting::pluck('value', 'key');
        });

        // دمج القيم الافتراضية مع المخزّنة فعلاً
        $defaults = AdminSetting::defaults();
        $merged   = collect($defaults)->map(fn ($default, $key) => $settings[$key] ?? $default);

        return view('admin.settings.index', ['settings' => $merged]);
    }

    /**
     * PUT /admin/settings
     * نفس منطق التحقق والحفظ في AdminSettingsController::update بالـ API
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'platform_fee_percent'       => 'nullable|numeric|min:0|max:50',
            'booking_cancellation_hours' => 'nullable|integer|min:1|max:168',
            'max_images_per_post'        => 'nullable|integer|min:1|max:20',
            'auto_approve_craftsmen'     => 'nullable|boolean',
            'maintenance_mode'           => 'nullable|boolean',
            'support_email'              => 'nullable|email',
            'support_phone'              => 'nullable|string|max:20',
            'otp_expiry_minutes'         => 'nullable|integer|min:1|max:30',
            'max_otp_attempts'           => 'nullable|integer|min:1|max:10',
            'max_portfolio_images'       => 'nullable|integer|min:1|max:50',
            'featured_craftsmen_limit'   => 'nullable|integer|min:1|max:20',
        ]);

        // checkboxes غير المرسلة تعني false
        foreach (['auto_approve_craftsmen', 'maintenance_mode'] as $boolKey) {
            $validated[$boolKey] = $request->boolean($boolKey);
        }

        foreach ($validated as $key => $value) {
            if ($value === null) continue;
            AdminSetting::updateOrCreate(
                ['key'   => $key],
                ['value' => is_bool($value) ? (int) $value : $value]
            );
        }

        Cache::forget('admin_settings');

        return back()->with('success', 'تم حفظ الإعدادات بنجاح');
    }

    /**
     * GET /admin/settings/stats
     * نفس AdminSettingsController::advancedStats في الـ API — بترجع Blade view
     */
    public function stats()
    {
        $thisMonthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd   = now()->subMonth()->endOfMonth();

        $revenueThis = Booking::where('status', 'completed')
            ->where('created_at', '>=', $thisMonthStart)
            ->sum('platform_fee');

        $revenueLast = Booking::where('status', 'completed')
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('platform_fee');

        $growth = $revenueLast > 0
            ? round((($revenueThis - $revenueLast) / $revenueLast) * 100, 1)
            : 0;

        $totalBookings     = Booking::count();
        $completedBookings = Booking::where('status', 'completed')->count();

        $topCraftsmen = Craftsman::approved()
            ->withCount(['bookings as completed_count' => fn ($q) => $q->where('status', 'completed')])
            ->orderByDesc('completed_count')
            ->limit(5)
            ->get(['id', 'first_name', 'last_name', 'rating', 'city']);

        $data = [
            'revenue' => [
                'total'          => Booking::where('status', 'completed')->sum('platform_fee'),
                'this_month'     => $revenueThis,
                'last_month'     => $revenueLast,
                'growth_percent' => $growth,
            ],
            'users' => [
                'total'         => User::count(),
                'new_this_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
                'clients'       => User::where('role', 'client')->count(),
                'craftsmen'     => User::where('role', 'craftsman')->count(),
            ],
            'bookings' => [
                'total'           => $totalBookings,
                'completed'       => $completedBookings,
                'completion_rate' => $totalBookings > 0
                    ? round(($completedBookings / $totalBookings) * 100, 1)
                    : 0,
            ],
            'top_craftsmen' => $topCraftsmen,
        ];

        return view('admin.settings.stats', $data);
    }
}
