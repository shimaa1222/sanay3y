@extends('layouts.admin')

@section('title', 'إدارة الحجوزات')
@section('page-title', 'إدارة الحجوزات')

@section('content')

    <div class="card">

        <form method="GET" class="filter-bar">
            <select name="status" onchange="this.form.submit()">
                <option value="">كل الحالات</option>
                <option value="pending"     {{ request('status') === 'pending'     ? 'selected' : '' }}>قيد الانتظار</option>
                <option value="confirmed"   {{ request('status') === 'confirmed'   ? 'selected' : '' }}>مؤكد</option>
                <option value="in_progress" {{ request('status') === 'in_progress' ? 'selected' : '' }}>قيد التنفيذ</option>
                <option value="completed"   {{ request('status') === 'completed'   ? 'selected' : '' }}>مكتمل</option>
                <option value="rejected"    {{ request('status') === 'rejected'    ? 'selected' : '' }}>مرفوض</option>
                <option value="cancelled"   {{ request('status') === 'cancelled'   ? 'selected' : '' }}>ملغي</option>
            </select>

            <input type="date" name="date_from" value="{{ request('date_from') }}">
            <input type="date" name="date_to" value="{{ request('date_to') }}">

            <button type="submit" class="btn btn-primary btn-sm">تصفية</button>
            @if(request()->anyFilled(['status', 'date_from', 'date_to']))
                <a href="{{ route('admin.bookings.index') }}" class="btn btn-outline btn-sm">إعادة تعيين</a>
            @endif
        </form>

        @if($bookings->isEmpty())
            <p style="color:#9ca3af; text-align:center; padding: 30px 0;">لا توجد نتائج</p>
        @else
            <table>
                <thead>
                    <tr>
                        <th>رقم الحجز</th><th>العميل</th><th>الحرفي</th><th>الخدمة</th>
                        <th>التاريخ</th><th>السعر الإجمالي</th><th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($bookings as $booking)
                        <tr>
                            <td>{{ $booking->booking_number }}</td>
                            <td>{{ $booking->client->name ?? '—' }}</td>
                            <td>{{ $booking->craftsman->first_name ?? '' }} {{ $booking->craftsman->last_name ?? '' }}</td>
                            <td>{{ $booking->service_title }}</td>
                            <td>{{ \Illuminate\Support\Carbon::parse($booking->booking_date)->format('Y-m-d') }}</td>
                            <td>{{ number_format($booking->total_price, 2) }} ر.س</td>
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

            <x-pagination-links :paginator="$bookings" />
        @endif
    </div>

@endsection
