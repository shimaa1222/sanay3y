<?php

namespace App\Http\Controllers\API\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Craftsman;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Notifications\BookingStatusUpdatedNotification;
use function Symfony\Component\String\b;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{



    /**
     * إنشاء حجز جديد (العميل)
     * POST /api/bookings
     */
    public function store(Request $request): JsonResponse
    {
       $validator = Validator::make($request->all(), [
    'craftsman_id'  => 'required|exists:craftsmen,id',
    'service_id'    => 'nullable|exists:craftsman_services,id',
    'service_title' => 'required_without:service_id|string|max:200',
    'booking_date'  => 'required|date|after_or_equal:today',
    'booking_time'  => 'required|date_format:H:i',
    'notes'         => 'nullable|string|max:500',
    'location'      => 'nullable|string|max:255',
]);

if ($validator->fails()) {
    return response()->json([
        'message' => 'فشل التحقق من البيانات',
        'errors'  => $validator->errors(),
    ], 422);
}
        // dd(
        //     Craftsman::find(1),
        //     Craftsman::approved()->find(1));
        // dd($request->all());

        $craftsman = Craftsman::approved()->findOrFail($request->craftsman_id);

        // حساب السعر
        $servicePrice = 0;
        $serviceTitle = $request->service_title;

        if ($request->service_id) {
            $service = $craftsman->services()->findOrFail($request->service_id);
            $servicePrice = $service->price_from;
            $serviceTitle = $service->title;
        } else {
            $servicePrice = $craftsman->hourly_rate ?? 0;
        }

        $platformFee = $servicePrice * 0.10;

        $booking = Booking::create([
            'booking_number' => strtoupper(Str::random(8)),
            'client_id'      => $request->user()->id,
            'craftsman_id'   => $craftsman->id,
            'service_id'     => $request->service_id,
            'service_title'  => $serviceTitle,
            'booking_date'   => $request->booking_date,
            'booking_time'   => $request->booking_time,
            'notes'          => $request->notes,
            'location'       => $request->location,
            'service_price'  => $servicePrice,
            'platform_fee'   => $platformFee,
            'total_price'    => $servicePrice + $platformFee,
            'status'         => 'pending',
        ]);

        // إشعار الحرفي
        if ($craftsman->user) {
            $craftsman->user->notify(new \App\Notifications\NewBookingNotification($booking));
        }

        return response()->json([
            'message' => 'تم إرسال طلب الحجز بنجاح',
            'booking' => $booking->load(['craftsman', 'client']),
        ], 201);
    }







    /**
     * قائمة حجوزات العميل
     * GET /api/bookings
     */
    public function clientBookings(Request $request): JsonResponse
    {
        $tab = $request->get('tab', 'upcoming');

        $query = Booking::with(['craftsman.crafts'])
            ->where('client_id', $request->user()->id);

        if ($tab === 'upcoming') {
            $query->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                  ->orderBy('booking_date');
        } else {
            $query->whereIn('status', ['completed', 'cancelled', 'rejected'])
                  ->latest('booking_date');
        }

        $bookings = $query->paginate(10);

        return response()->json(['bookings' => $bookings]);
    }





    /**
     * قائمة حجوزات الحرفي
     * GET /api/craftsman/bookings
     */
    public function craftsmanBookings(Request $request): JsonResponse
    {
        $craftsman = $request->user()->craftsman;

        if (!$craftsman) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $bookings = Booking::with(['client'])
            ->where('craftsman_id', $craftsman->id)
            ->orderBy('booking_date')
            ->paginate(10);

        return response()->json(['bookings' => $bookings]);
    }






    /**
     * تفاصيل حجز معين
     * GET /api/bookings/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user    = $request->user();
        $booking = Booking::with(['craftsman', 'client', 'service', 'review'])->findOrFail($id);

        // التحقق من الصلاحية
        $isOwner = $booking->client_id === $user->id
            || ($user->craftsman && $booking->craftsman_id === $user->craftsman->id)
            || $user->isAdmin();

        if (!$isOwner) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        return response()->json(['booking' => $booking]);
    }






    /**
     * تحديث حالة الحجز (الحرفي)
     * PATCH /api/bookings/{id}/status
     */

public function updateStatus(Request $request, int $id): JsonResponse
{
    $validator = Validator::make($request->all(), [
        'status' => 'required|in:confirmed,in_progress,completed,rejected',
        'reason' => 'required_if:status,rejected|string|max:255',
    ]);
    if ($validator->fails()) {
        return response()->json([
            'message' => 'فشل التحقق من البيانات',
            'errors'  => $validator->errors(),
        ], 422);
    }

    // $request->validate([
    //     'status' => 'required|in:confirmed,in_progress,completed,rejected',
    //     'reason' => 'required_if:status,rejected|string|max:255',
    // ]);

    $craftsman = $request->user()->craftsman;
    $booking   = Booking::where('craftsman_id', $craftsman->id)->findOrFail($id);

    $updates = ['status' => $request->status];

    if ($request->status === 'confirmed') {
        $updates['confirmed_at'] = now();
    }

    if ($request->status === 'completed') {
        $updates['completed_at'] = now();
    }

    if ($request->status === 'rejected') {
        $updates['cancellation_reason'] = $request->reason;
    }

    $booking->update($updates);

    // إشعار العميل
    $booking->client->notify(
        new BookingStatusUpdatedNotification($booking)
    );

    return response()->json([
        'message' => 'تم تحديث حالة الحجز',
        'booking' => $booking->fresh(),
    ]);
}






    /**
     * إلغاء حجز (العميل)
     * DELETE /api/bookings/{id}
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'فشل التحقق من البيانات',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // $request->validate([
        //     'reason' => 'nullable|string|max:255',
        // ]);

        $booking = Booking::where('client_id', $request->user()->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->findOrFail($id);


        $booking->update([
            'status'               => 'cancelled',
            'cancellation_reason'  => $request->reason,
            'cancelled_at'         => now(),
        ]);

        return response()->json(['message' => 'تم إلغاء الحجز']);
    }

    /**
     * إضافة تقييم للحجز المكتمل
     * POST /api/bookings/{id}/review
     */
    public function addReview(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'فشل التحقق من البيانات',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // $request->validate([
        //     'rating'  => 'required|integer|min:1|max:5',
        //     'comment' => 'nullable|string|max:1000',
        // ]);
        // dd(Booking::find(2));

        $booking = Booking::where('client_id', $request->user()->id)
            ->where('status', 'completed')
            ->findOrFail($id);

        if ($booking->review()->exists()) {
            return response()->json(['message' => 'لقد قمت بتقييم هذا الحجز مسبقاً'], 422);
        }

        $review = \App\Models\Review::create([
            'booking_id'   => $booking->id,
            'client_id'    => $request->user()->id,
            'craftsman_id' => $booking->craftsman_id,
            'rating'       => $request->rating,
            'comment'      => $request->comment,
            'is_visible'   => true,
        ]);

        return response()->json([
            'message' => 'شكراً على تقييمك',
            'review'  => $review,
        ], 201);
    }
}
