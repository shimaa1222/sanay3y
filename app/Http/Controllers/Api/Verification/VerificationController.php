<?php

namespace App\Http\Controllers\Api\Verification;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\OtpCode;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class VerificationController extends Controller
{
    // ================================================================
    // EMAIL VERIFICATION
    // ================================================================

    /**
     * POST /api/auth/otp/send
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $this->generateAndSendOtp($request->email);

        return response()->json([
            'message' => 'تم إرسال كود التحقق على البريد الإلكتروني',
            'expires_in' => 300
        ]);
    }

    /**
     * POST /api/auth/otp/verify
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'purpose' => 'required|in:register,password_reset',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $record = OtpCode::where('email', $request->email)
            ->where('code', $request->otp)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$record) {
            OtpCode::where('email', $request->email)
                ->where('used', false)
                ->increment('attempts');

            return response()->json([
                'message' => 'الكود غير صحيح أو منتهي الصلاحية'
            ], 422);
        }

        // ✅ حذف الكود بعد التحقق
        $record->delete();

        $response = [
            'message' => 'تم التحقق بنجاح',
            'verified' => true,
        ];

        if ($request->purpose === 'register') {
            $token = Str::random(64);
            Cache::put(
                "email_verification:$token",
                $request->email,
                now()->addMinutes(30)
            );
            $response['verified_token'] = $token;
        }

        if ($request->purpose === 'password_reset') {
            $resetToken = Str::random(64);
            Cache::put(
                "password_reset_otp:$resetToken",
                $request->email,
                now()->addMinutes(15)
            );
            $response['reset_token'] = $resetToken;
        }

        return response()->json($response);
    }

    /**
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $this->generateAndSendOtp($request->email);
        }

        return response()->json([
            'message' => 'إذا كان البريد مسجلاً، سيتم إرسال كود إعادة التعيين'
        ]);
    }

    /**
     * POST /api/auth/reset-password-otp
     */
    public function resetPasswordWithOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reset_token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'reset_token.required' => 'رمز إعادة التعيين مطلوب',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور يجب ألا تقل عن 8 أحرف',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'فشل التحقق من البيانات',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = Cache::get("password_reset_otp:{$request->reset_token}");

        if (!$email) {
            return response()->json([
                'message' => 'الرابط منتهي الصلاحية أو غير صحيح. يرجى طلب كود جديد.',
            ], 422);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json(['message' => 'المستخدم غير موجود'], 404);
        }

        $user->update([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ]);

        Cache::forget("password_reset_otp:{$request->reset_token}");

        return response()->json([
            'message' => 'تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
        ]);
    }

    // ================================================================
    // PRIVATE HELPER
    // ================================================================

    private function generateAndSendOtp(string $email): void
    {
        OtpCode::where('email', $email)
            ->where('used', false)
            ->update(['used' => true]);

        $code = str_pad(
            random_int(0, 999999),
            6,
            '0',
            STR_PAD_LEFT
        );

        OtpCode::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => now()->addMinutes(5),
            'used' => false,
            'attempts' => 0,
        ]);

        Mail::to($email)->send(new OtpMail($code));
    }
}