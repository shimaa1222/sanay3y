@extends('layouts.admin')

@section('title', 'الإعدادات')
@section('page-title', 'إعدادات المنصة')

@section('content')

    <div class="card" style="max-width:640px;">
        <form action="{{ route('admin.settings.update') }}" method="POST">
            @csrf @method('PUT')

            <div class="form-group">
                <label class="form-label">نسبة عمولة المنصة (%)</label>
                <input type="number" name="platform_fee_percent" class="form-control"
                       value="{{ $settings['platform_fee_percent'] }}" min="0" max="50" step="0.1">
            </div>

            <div class="form-group">
                <label class="form-label">مدة السماح بإلغاء الحجز (ساعات)</label>
                <input type="number" name="booking_cancellation_hours" class="form-control"
                       value="{{ $settings['booking_cancellation_hours'] }}" min="1" max="168">
            </div>

            <div class="form-group">
                <label class="form-label">أقصى عدد صور لكل منشور</label>
                <input type="number" name="max_images_per_post" class="form-control"
                       value="{{ $settings['max_images_per_post'] }}" min="1" max="20">
            </div>

            <div class="form-group">
                <label class="form-label">أقصى عدد صور في معرض الحرفي</label>
                <input type="number" name="max_portfolio_images" class="form-control"
                       value="{{ $settings['max_portfolio_images'] }}" min="1" max="50">
            </div>

            <div class="form-group">
                <label class="form-label">عدد الحرفيين المميزين بالصفحة الرئيسية</label>
                <input type="number" name="featured_craftsmen_limit" class="form-control"
                       value="{{ $settings['featured_craftsmen_limit'] }}" min="1" max="20">
            </div>

            <div class="form-group">
                <label class="form-label">بريد الدعم الفني</label>
                <input type="email" name="support_email" class="form-control" value="{{ $settings['support_email'] }}">
            </div>

            <div class="form-group">
                <label class="form-label">رقم الدعم الفني</label>
                <input type="text" name="support_phone" class="form-control" value="{{ $settings['support_phone'] }}">
            </div>

            <div class="form-group">
                <label class="form-label">مدة صلاحية كود OTP (دقائق)</label>
                <input type="number" name="otp_expiry_minutes" class="form-control"
                       value="{{ $settings['otp_expiry_minutes'] }}" min="1" max="30">
            </div>

            <div class="form-group">
                <label class="form-label">أقصى عدد محاولات OTP</label>
                <input type="number" name="max_otp_attempts" class="form-control"
                       value="{{ $settings['max_otp_attempts'] }}" min="1" max="10">
            </div>

            <div class="form-group" style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" name="auto_approve_craftsmen" id="auto_approve" value="1"
                       {{ $settings['auto_approve_craftsmen'] ? 'checked' : '' }}>
                <label for="auto_approve" style="font-weight:600; font-size:0.88rem;">الموافقة التلقائية على طلبات الحرفيين</label>
            </div>

            <div class="form-group" style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" name="maintenance_mode" id="maintenance" value="1"
                       {{ $settings['maintenance_mode'] ? 'checked' : '' }}>
                <label for="maintenance" style="font-weight:600; font-size:0.88rem;">وضع الصيانة</label>
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">حفظ الإعدادات</button>
        </form>
    </div>

@endsection
