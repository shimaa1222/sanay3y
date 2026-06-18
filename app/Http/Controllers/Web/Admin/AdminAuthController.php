<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    /**
     * عرض صفحة تسجيل الدخول
     */
    public function showLogin()
    {
        if (Auth::guard('web')->check() && Auth::guard('web')->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return view('auth.admin-login');
    }

    /**
     * تسجيل دخول الأدمن — Session عادي (auth:web)
     * منفصل عن AdminController::login في الـ API (اللي بيرجع Sanctum token)
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required'    => 'البريد الإلكتروني مطلوب',
            'password.required' => 'كلمة المرور مطلوبة',
        ]);

        $remember = $request->boolean('remember');

        if (!Auth::guard('web')->attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => 'بيانات الدخول غير صحيحة',
            ]);
        }

        $user = Auth::guard('web')->user();

        if ($user->role !== 'admin') {
            Auth::guard('web')->logout();

            throw ValidationException::withMessages([
                'email' => 'هذا الحساب غير مصرح له بالدخول للوحة التحكم',
            ]);
        }

        if (!$user->is_active) {
            Auth::guard('web')->logout();

            throw ValidationException::withMessages([
                'email' => 'حسابك موقوف. تواصل مع الدعم الفني.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'))
            ->with('success', 'مرحباً بك ' . $user->name);
    }

    /**
     * تسجيل الخروج
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')
            ->with('success', 'تم تسجيل الخروج بنجاح');
    }
}
