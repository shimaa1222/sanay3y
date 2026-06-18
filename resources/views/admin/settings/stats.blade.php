@extends('layouts.admin')

@section('title', 'إحصائيات متقدمة')
@section('page-title', 'إحصائيات متقدمة')

@section('content')

    {{-- ===== الإيرادات ===== --}}
    <div class="stats-grid">
        <x-stat-card label="إجمالي الإيرادات" :value="number_format($revenue['total'], 2) . ' ر.س'" />
        <x-stat-card label="إيرادات هذا الشهر" :value="number_format($revenue['this_month'], 2) . ' ر.س'" />
        <x-stat-card label="إيرادات الشهر السابق" :value="number_format($revenue['last_month'], 2) . ' ر.س'" />
        <x-stat-card label="نسبة النمو" :value="$revenue['growth_percent'] . '%'"
                     :sub="$revenue['growth_percent'] >= 0 ? '↑ نمو إيجابي' : '↓ تراجع'" />
    </div>

    {{-- ===== المستخدمون والحجوزات ===== --}}
    <div class="stats-grid">
        <x-stat-card label="إجمالي المستخدمين" :value="$users['total']" sub="{{ $users['new_this_week'] }} جديد هذا الأسبوع" />
        <x-stat-card label="العملاء" :value="$users['clients']" />
        <x-stat-card label="الحرفيون" :value="$users['craftsmen']" />
        <x-stat-card label="نسبة إتمام الحجوزات" :value="$bookings['completion_rate'] . '%'"
                     sub="{{ $bookings['completed'] }} من {{ $bookings['total'] }}" />
    </div>

    {{-- ===== أفضل الحرفيين ===== --}}
    <div class="card">
        <div class="card-header"><span class="card-title">أفضل 5 حرفيين (حسب الحجوزات المكتملة)</span></div>

        @if($top_craftsmen->isEmpty())
            <p style="color:#9ca3af; text-align:center; padding: 20px 0;">لا توجد بيانات كافية حتى الآن</p>
        @else
            <table>
                <thead>
                    <tr><th>الاسم</th><th>المدينة</th><th>التقييم</th><th>حجوزات مكتملة</th></tr>
                </thead>
                <tbody>
                    @foreach($top_craftsmen as $craftsman)
                        <tr>
                            <td>{{ $craftsman->first_name }} {{ $craftsman->last_name }}</td>
                            <td>{{ $craftsman->city }}</td>
                            <td>{{ $craftsman->rating }} ⭐</td>
                            <td>{{ $craftsman->completed_count }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>

@endsection
