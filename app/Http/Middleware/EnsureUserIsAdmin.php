<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * يتأكد إن المستخدم مسجّل دخوله (session) وإن دوره admin.
     * مستخدم فقط في لوحة تحكم الأدمن (Blade) — منفصل تماماً عن auth:sanctum بتاع الـ API.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user('web');

        if (!$user) {
            return redirect()->route('admin.login')
                ->with('error', 'يجب تسجيل الدخول أولاً');
        }

        if ($user->role !== 'admin') {
            auth('web')->logout();
            $request->session()->invalidate();

            return redirect()->route('admin.login')
                ->with('error', 'غير مصرح لك بالوصول لهذه الصفحة');
        }

        if (!$user->is_active) {
            auth('web')->logout();
            $request->session()->invalidate();

            return redirect()->route('admin.login')
                ->with('error', 'حسابك موقوف. تواصل مع الدعم الفني.');
        }

        return $next($request);
    }
}
