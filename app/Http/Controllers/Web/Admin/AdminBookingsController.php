<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class AdminBookingsController extends Controller
{
    /**
     * GET /admin/bookings
     * نفس فلترة AdminController::bookingsList تماماً
     */
    public function index(Request $request)
    {
        $query = Booking::with(['client:id,name,email', 'craftsman:id,first_name,last_name']);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->date_from) {
            $query->where('booking_date', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->where('booking_date', '<=', $request->date_to);
        }

        $bookings = $query->latest()->paginate(20)->withQueryString();

        return view('admin.bookings.index', compact('bookings'));
    }
}
