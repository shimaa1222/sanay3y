@extends('layouts.admin')

@section('title', 'لوحة التحكم')
@section('page-title', 'لوحة التحكم')

@section('content')

    {{-- ===== إحصائيات المستخدمين ===== --}}
    <div class="stats-grid">
        <x-stat-card label="إجمالي المستخدمين" :value="$stats['users']['total']" sub="{{ $stats['users']['new_this_month'] }} جديد هذا الشهر" />
        <x-stat-card label="العملاء" :value="$stats['users']['clients']" />
        <x-stat-card label="الحرفيون" :value="$stats['users']['craftsmen']" />
        <x-stat-card label="طلبات حرفيين معلقة" :value="$stats['craftsmen_requests']['pending']" sub="بحاجة مراجعة" />
    </div>

    <div class="stats-grid">
        <x-stat-card label="إجمالي الحجوزات" :value="$stats['bookings']['total']" sub="{{ $stats['bookings']['this_month'] }} هذا الشهر" />
        <x-stat-card label="حجوزات مكتملة" :value="$stats['bookings']['completed']" />
        <x-stat-card label="إيرادات المنصة" :value="number_format($stats['bookings']['revenue'], 2) . ' ر.س'" />
        <x-stat-card label="متوسط التقييم" :value="$stats['reviews']['avg_rating'] ?? '0'" sub="{{ $stats['reviews']['total'] }} تقييم" />
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">

        {{-- ===== طلبات الحرفيين المعلقة ===== --}}
        <div class="card">
            <div class="card-header">
                <span class="card-title">طلبات حرفيين معلقة</span>
                <a href="{{ route('admin.craftsmen.index', ['status' => 'pending']) }}" class="btn btn-outline btn-sm">عرض الكل</a>
            </div>

            @if($pendingCraftsmen->isEmpty())
                <p style="color:#9ca3af; font-size:0.88rem; text-align:center; padding: 20px 0;">لا توجد طلبات معلقة حالياً</p>
            @else
                <table>
                    <thead>
                        <tr><th>الاسم</th><th>المدينة</th><th>تاريخ التقديم</th><th></th></tr>
                    </thead>
                    <tbody>
                        @foreach($pendingCraftsmen as $craftsman)
                            <tr>
                                <td>{{ $craftsman->first_name }} {{ $craftsman->last_name }}</td>
                                <td>{{ $craftsman->city }}</td>
                                <td>{{ $craftsman->created_at->diffForHumans() }}</td>
                                <td><a href="{{ route('admin.craftsmen.show', $craftsman->id) }}" class="btn btn-primary btn-sm">مراجعة</a></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        {{-- ===== آخر الحجوزات ===== --}}
        <div class="card">
            <div class="card-header">
                <span class="card-title">آخر الحجوزات</span>
                <a href="{{ route('admin.bookings.index') }}" class="btn btn-outline btn-sm">عرض الكل</a>
            </div>

            @if($recentBookings->isEmpty())
                <p style="color:#9ca3af; font-size:0.88rem; text-align:center; padding: 20px 0;">لا توجد حجوزات حتى الآن</p>
            @else
                <table>
                    <thead>
                        <tr><th>العميل</th><th>الحرفي</th><th>الحالة</th></tr>
                    </thead>
                    <tbody>
                        @foreach($recentBookings as $booking)
                            <tr>
                                <td>{{ $booking->client->name ?? '—' }}</td>
                                <td>{{ $booking->craftsman->first_name ?? '' }} {{ $booking->craftsman->last_name ?? '' }}</td>
                                <td>
                                    @php
                                        $statusMap = [
                                            'pending' => 'pending', 'confirmed' => 'approved', 'in_progress' => 'pending',
                                            'completed' => 'active', 'rejected' => 'rejected', 'cancelled' => 'rejected',
                                        ];
                                    @endphp
                                    <x-badge :type="$statusMap[$booking->status] ?? 'gray'" :text="$booking->status_label" />
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>
    </div>

@endsection
