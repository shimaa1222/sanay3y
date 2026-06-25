<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Craft;
use App\Models\Craftsman;
use App\Models\Review;
use App\Models\ServicePost;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Mail\CraftsmanApprovedMail;
use App\Mail\CraftsmanRejectedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;


class AdminController extends Controller
{
    // ====================================================
    // لوحة التحكم - إحصائيات عامة
    // GET /api/admin/dashboard
    // ====================================================
    public function login(Request $request)
{
    $credentials = $request->validate([
        'email'    => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $credentials['email'])
                ->where('role', 'admin')  // ← الفرق هنا
                ->first();

    if (!$user || !Hash::check($credentials['password'], $user->password)) {
        return response()->json(['message' => 'بيانات غلط أو مش admin'], 401);
    }

    $token = $user->createToken('admin-token', ['role:admin'])->plainTextToken;

    return response()->json(['token' => $token, 'user' => $user]);
}
    public function dashboard(): JsonResponse
    {
        $stats = [
            'users' => [
                'total'     => User::count(),
                'clients'   => User::where('role', 'client')->count(),
                'craftsmen' => User::where('role', 'craftsman')->count(),
                'new_this_month' => User::whereMonth('created_at', now()->month)->count(),
            ],
            'craftsmen_requests' => [
                'pending'  => Craftsman::pending()->count(),
                'approved' => Craftsman::approved()->count(),
                'rejected' => Craftsman::where('status', 'rejected')->count(),
                'total'    => Craftsman::count(),
            ],
            'bookings' => [
                'total'     => Booking::count(),
                'pending'   => Booking::where('status', 'pending')->count(),
                'completed' => Booking::where('status', 'completed')->count(),
                'cancelled' => Booking::where('status', 'cancelled')->count(),
                'revenue'   => Booking::where('status', 'completed')->sum('platform_fee'),
                'this_month'=> Booking::whereMonth('created_at', now()->month)->count(),
            ],
            'posts' => [
                'total'  => ServicePost::count(),
                'active' => ServicePost::where('status', 'active')->count(),
                'closed' => ServicePost::where('status', 'closed')->count(),
            ],
            'reviews' => [
                'total'        => Review::count(),
                'avg_rating'   => round(Review::avg('rating'), 2),
                'this_month'   => Review::whereMonth('created_at', now()->month)->count(),
            ],
        ];

        // آخر الطلبات المعلقة
        $pendingCraftsmen = Craftsman::pending()
            ->latest()
            ->limit(5)
            ->get(['id', 'first_name', 'last_name', 'email', 'city', 'created_at']);

        // آخر الحجوزات
        $recentBookings = Booking::with(['client:id,name', 'craftsman:id,first_name,last_name'])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'stats'              => $stats,
            'pending_craftsmen'  => $pendingCraftsmen,
            'recent_bookings'    => $recentBookings,
        ]);
    }

    // ====================================================
    // إدارة طلبات الحرفيين
    // ====================================================

    /**
     * قائمة طلبات الحرفيين مع فلترة
     * GET /api/admin/craftsmen
     */
    public function craftsmenList(Request $request): JsonResponse
    {
        $query = Craftsman::with(['crafts', 'approvedBy']);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->city) {
            $query->where('city', $request->city);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $craftsmen = $query->latest()->paginate(15);

        return response()->json(['craftsmen' => $craftsmen]);
    }

    /**
     * تفاصيل طلب حرفي (للمراجعة)
     * GET /api/admin/craftsmen/{id}
     */
    public function craftsmanDetail(int $id): JsonResponse
    {
        $craftsman = Craftsman::with(['crafts', 'skills', 'approvedBy'])->findOrFail($id);

        return response()->json(['craftsman' => $craftsman]);
    }

    /**
     * قبول تسجيل حرفي
     * POST /api/admin/craftsmen/{id}/approve
     *
     * هذا هو المنطق الأساسي:
     * 1. إنشاء حساب User للحرفي
     * 2. ربط الحرفي بالحساب
     * 3. إرسال بيانات الدخول بالإيميل
     */
   public function approveCraftsman(Request $request, int $id): JsonResponse
{
    $craftsman = Craftsman::findOrFail($id);

    if ($craftsman->status !== 'pending') {
        return response()->json([
            'message' => 'تم التعامل مع هذا الحرفي مسبقاً'
        ], 422);
    }

    if (User::where('email', $craftsman->email)->exists()) {
        return response()->json([
            'message' => 'يوجد مستخدم مسجل بنفس الإيميل مسبقاً',
        ], 422);
    }
//DB::transaction(function () use ($craftsman, $request) {

    $user = User::create([
        'name' => $craftsman->first_name . ' ' . $craftsman->last_name,
        'email' => $craftsman->email,
        'password' => $craftsman->password,
        'role' => 'craftsman',
        'phone' => $craftsman->phone,
        'is_active' => true,
    ]);

    $craftsman->update([
        'user_id' => $user->id,
        'status' => 'approved',
        'approved_by' => $request->user()->id ?? null,
    ]);
//});
Log::info('Before craftsman approved mail', [
    'email' => $craftsman->email
]);
   Mail::to($craftsman->email)
            ->send(new CraftsmanApprovedMail($craftsman));
// Mail::raw('Test approval email', function ($message) use ($craftsman) {
//     $message->to($craftsman->email)
//             ->subject('Test');
// });
Log::info('After craftsman approved mail');

    return response()->json([
        'message' => "تمت الموافقة على {$craftsman->first_name} وتم إرسال بيانات الدخول على إيميله",
    ]);
}

    /**
     * رفض تسجيل حرفي
     * POST /api/admin/craftsmen/{id}/reject
     */
    public function rejectCraftsman(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);
//$craftsman = Craftsman::pending()->findOrFail($id);
        $craftsman = Craftsman::findOrFail($id);
        $craftsman->reject($request->reason, $request->user()->id);
$craftsman->refresh();
Mail::to($craftsman->email)
            ->send(new CraftsmanRejectedMail($craftsman));


        return response()->json([
            'message' => "تم رفض طلب {$craftsman->full_name}",
        ]);
    }

    /**
     * تعطيل/تفعيل حساب حرفي
     * PATCH /api/admin/craftsmen/{id}/toggle-status
     */
    public function toggleCraftsmanStatus(int $id): JsonResponse
    {
        $craftsman = Craftsman::approved()->findOrFail($id);
        $user      = $craftsman->user;

        if ($user) {
            $user->update(['is_active' => !$user->is_active]);
            $status = $user->is_active ? 'مفعّل' : 'موقوف';
        }

        return response()->json(['message' => "تم تغيير حالة الحرفي إلى: {$status}"]);
    }

    /**
     * تبديل الحرفي كمميز
     * PATCH /api/admin/craftsmen/{id}/toggle-featured
     */
    public function toggleFeatured(int $id): JsonResponse
    {
        $craftsman = Craftsman::approved()->findOrFail($id);
        $craftsman->update(['is_featured' => !$craftsman->is_featured]);

        $status = $craftsman->is_featured ? 'مميز' : 'غير مميز';
        return response()->json(['message' => "تم تغيير الحرفي إلى: {$status}"]);
    }

    // ====================================================
    // إدارة المستخدمين
    // ====================================================

    /**
     * GET /api/admin/users
     */
    public function usersList(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->role) {
            $query->where('role', $request->role);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->latest()->paginate(15);

        return response()->json(['users' => $users]);
    }

    /**
     * تعطيل/تفعيل مستخدم
     * PATCH /api/admin/users/{id}/toggle-status
     */
    public function toggleUserStatus(int $id): JsonResponse
    {
        $user = User::where('role', '!=', 'admin')->findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'مفعّل' : 'موقوف';
        return response()->json(['message' => "تم تغيير حالة المستخدم إلى: {$status}"]);
    }

    // ====================================================
    // إدارة الحجوزات
    // ====================================================

    /**
     * GET /api/admin/bookings
     */
    public function bookingsList(Request $request): JsonResponse
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

        $bookings = $query->latest()->paginate(20);

        return response()->json(['bookings' => $bookings]);
    }

    // ====================================================
    // إدارة المنشورات (Posts)
    // ====================================================

    /**
     * GET /api/admin/posts
     */
    public function postsList(Request $request): JsonResponse
    {
        $query = ServicePost::with(['client:id,name', 'craft']);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('is_approved')) {
            $query->where('is_approved', $request->boolean('is_approved'));
        }

        $posts = $query->latest()->paginate(15);

        return response()->json(['posts' => $posts]);
    }

    /**
     * إخفاء/إظهار منشور
     * PATCH /api/admin/posts/{id}/toggle-visibility
     */
    public function togglePostVisibility(int $id): JsonResponse
    {
        $post = ServicePost::findOrFail($id);
        $post->update(['is_approved' => !$post->is_approved]);

        $status = $post->is_approved ? 'ظاهر' : 'مخفي';
        return response()->json(['message' => "تم تغيير حالة المنشور إلى: {$status}"]);
    }

    /**
     * حذف منشور
     * DELETE /api/admin/posts/{id}
     */
    public function deletePost(int $id): JsonResponse
    {
        ServicePost::findOrFail($id)->delete();
        return response()->json(['message' => 'تم حذف المنشور']);
    }

    // ====================================================
    // إدارة المهن
    // ====================================================

    /**
     * GET /api/admin/crafts
     */
    public function craftsList(): JsonResponse
    {
        $crafts = Craft::withCount('craftsmen')->get();
        return response()->json(['crafts' => $crafts]);
    }

    /**
     * POST /api/admin/crafts
     */
    public function storeCraft(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => 'required|string|max:100|unique:crafts,name',
            'name_en'     => 'nullable|string|max:100',
            'icon'        => 'nullable|string|max:50',
            'description' => 'nullable|string|max:255',
        ]);

        $craft = Craft::create($request->only(['name', 'name_en', 'icon', 'description']) + ['is_active' => true]);

        return response()->json(['message' => 'تمت إضافة المهنة', 'craft' => $craft], 201);
    }

    /**
     * PUT /api/admin/crafts/{id}
     */
    public function updateCraft(Request $request, int $id): JsonResponse
    {
        $craft = Craft::findOrFail($id);
        $request->validate([
            'name'      => 'sometimes|string|max:100|unique:crafts,name,' . $id,
            'is_active' => 'sometimes|boolean',
        ]);

        $craft->update($request->only(['name', 'name_en', 'icon', 'description', 'is_active']));

        return response()->json(['message' => 'تم تحديث المهنة', 'craft' => $craft]);
    }
    public function deleteCraft($id): JsonResponse
    {
        $craft = Craft::findOrFail($id);
        if($craft->craftsmen()->count() > 0){
            return response()->json(['message' => 'لا يمكن حذف المهنة لأنها مرتبطة بحرفيين'], 422);
        }
        $craft->delete();
        return response()->json(['message' => 'تم حذف المهنة'], 200);
    }
    // ====================================================
    // إدارة التقييمات
    // ====================================================

    /**
     * GET /api/admin/reviews
     */
    public function reviewsList(Request $request): JsonResponse
    {
        $reviews = Review::with(['client:id,name', 'craftsman:id,first_name,last_name'])
            ->latest()
            ->paginate(20);

        return response()->json(['reviews' => $reviews]);
    }

    /**
     * إخفاء/إظهار تقييم
     * PATCH /api/admin/reviews/{id}/toggle-visibility
     */
    public function toggleReviewVisibility(int $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->update(['is_visible' => !$review->is_visible]);

        $status = $review->is_visible ? 'ظاهر' : 'مخفي';
        return response()->json(['message' => "تم تغيير حالة التقييم إلى: {$status}"]);
    }
}
