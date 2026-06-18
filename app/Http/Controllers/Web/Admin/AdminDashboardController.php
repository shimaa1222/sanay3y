<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Craftsman;
use App\Models\Review;
use App\Models\ServicePost;
use App\Models\User;

class AdminDashboardController extends Controller
{
    /**
     * GET /admin/dashboard
     *
     * نفس منطق AdminController::dashboard في الـ API
     * بس بترجع Blade view بدل JSON
     */
    public function index()
    {
        $stats = [
            'users' => [
                'total'          => User::count(),
                'clients'        => User::where('role', 'client')->count(),
                'craftsmen'      => User::where('role', 'craftsman')->count(),
                'new_this_month' => User::whereMonth('created_at', now()->month)->count(),
            ],
            'craftsmen_requests' => [
                'pending'  => Craftsman::pending()->count(),
                'approved' => Craftsman::approved()->count(),
                'rejected' => Craftsman::where('status', 'rejected')->count(),
                'total'    => Craftsman::count(),
            ],
            'bookings' => [
                'total'      => Booking::count(),
                'pending'    => Booking::where('status', 'pending')->count(),
                'completed'  => Booking::where('status', 'completed')->count(),
                'cancelled'  => Booking::where('status', 'cancelled')->count(),
                'revenue'    => Booking::where('status', 'completed')->sum('platform_fee'),
                'this_month' => Booking::whereMonth('created_at', now()->month)->count(),
            ],
            'posts' => [
                'total'  => ServicePost::count(),
                'active' => ServicePost::where('status', 'active')->count(),
                'closed' => ServicePost::where('status', 'closed')->count(),
            ],
            'reviews' => [
                'total'      => Review::count(),
                'avg_rating' => round(Review::avg('rating'), 2),
                'this_month' => Review::whereMonth('created_at', now()->month)->count(),
            ],
        ];

        $pendingCraftsmen = Craftsman::pending()
            ->latest()
            ->limit(5)
            ->get(['id', 'first_name', 'last_name', 'email', 'city', 'created_at']);

        $recentBookings = Booking::with(['client:id,name', 'craftsman:id,first_name,last_name'])
            ->latest()
            ->limit(5)
            ->get();

        return view('admin.dashboard', [
            'stats'             => $stats,
            'pendingCraftsmen'  => $pendingCraftsmen,
            'recentBookings'    => $recentBookings,
        ]);
    }
}
