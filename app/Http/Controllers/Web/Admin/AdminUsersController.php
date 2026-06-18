<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUsersController extends Controller
{
    /**
     * GET /admin/users
     * نفس AdminController::usersList
     */
    public function index(Request $request)
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

        $users = $query->latest()->paginate(15)->withQueryString();

        return view('admin.users.index', compact('users'));
    }

    /**
     * PATCH /admin/users/{id}/toggle-status
     * نفس AdminController::toggleUserStatus — لا يمكن تعطيل الأدمن
     */
    public function toggleStatus(int $id)
    {
        $user = User::where('role', '!=', 'admin')->findOrFail($id);
        $user->update(['is_active' => !$user->is_active]);

        $status = $user->is_active ? 'مفعّل' : 'موقوف';

        return back()->with('success', "تم تغيير حالة المستخدم إلى: {$status}");
    }
}
