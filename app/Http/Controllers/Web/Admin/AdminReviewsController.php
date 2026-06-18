<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminReviewsController extends Controller
{
    /**
     * GET /admin/reviews
     * نفس AdminController::reviewsList
     */
    public function index(Request $request)
    {
        $reviews = Review::with(['client:id,name', 'craftsman:id,first_name,last_name'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return view('admin.reviews.index', compact('reviews'));
    }

    /**
     * PATCH /admin/reviews/{id}/toggle-visibility
     * نفس AdminController::toggleReviewVisibility
     */
    public function toggleVisibility(int $id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_visible' => !$review->is_visible]);

        $status = $review->is_visible ? 'ظاهر' : 'مخفي';

        return back()->with('success', "تم تغيير حالة التقييم إلى: {$status}");
    }
}
