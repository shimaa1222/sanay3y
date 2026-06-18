<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\ServicePost;
use Illuminate\Http\Request;

class AdminPostsController extends Controller
{
    /**
     * GET /admin/posts
     * نفس AdminController::postsList
     */
    public function index(Request $request)
    {
        $query = ServicePost::with(['client:id,name', 'craft']);

        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('is_approved')) {
            $query->where('is_approved', $request->boolean('is_approved'));
        }

        $posts = $query->latest()->paginate(15)->withQueryString();

        return view('admin.posts.index', compact('posts'));
    }

    /**
     * PATCH /admin/posts/{id}/toggle-visibility
     * نفس AdminController::togglePostVisibility
     */
    public function toggleVisibility(int $id)
    {
        $post = ServicePost::findOrFail($id);
        $post->update(['is_approved' => !$post->is_approved]);

        $status = $post->is_approved ? 'ظاهر' : 'مخفي';

        return back()->with('success', "تم تغيير حالة المنشور إلى: {$status}");
    }

    /**
     * DELETE /admin/posts/{id}
     * نفس AdminController::deletePost
     */
    public function destroy(int $id)
    {
        ServicePost::findOrFail($id)->delete();

        return back()->with('success', 'تم حذف المنشور');
    }
}
