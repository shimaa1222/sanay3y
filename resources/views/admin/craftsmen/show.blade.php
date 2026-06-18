@extends('layouts.admin')

@section('title', 'تفاصيل الحرفي')
@section('page-title', 'تفاصيل الحرفي')

@section('content')

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 20px;">

        {{-- ===== البيانات الأساسية ===== --}}
        <div class="card">
            <div class="card-header">
                <span class="card-title">{{ $craftsman->first_name }} {{ $craftsman->last_name }}</span>
                @php
                    $statusBadge = ['pending' => 'pending', 'approved' => 'approved', 'rejected' => 'rejected'];
                    $statusText  = ['pending' => 'معلق', 'approved' => 'مقبول', 'rejected' => 'مرفوض'];
                @endphp
                <x-badge :type="$statusBadge[$craftsman->status]" :text="$statusText[$craftsman->status]" />
            </div>

            <table>
                <tbody>
                    <tr><td style="width:160px; font-weight:600;">الإيميل</td><td>{{ $craftsman->email }}</td></tr>
                    <tr><td style="font-weight:600;">رقم الهاتف</td><td>{{ $craftsman->phone }}</td></tr>
                    <tr><td style="font-weight:600;">المدينة</td><td>{{ $craftsman->city }}</td></tr>
                    @if($craftsman->district)
                        <tr><td style="font-weight:600;">الحي</td><td>{{ $craftsman->district }}</td></tr>
                    @endif
                    @if($craftsman->full_address)
                        <tr><td style="font-weight:600;">العنوان</td><td>{{ $craftsman->full_address }}</td></tr>
                    @endif
                    @if($craftsman->bio)
                        <tr><td style="font-weight:600;">نبذة</td><td>{{ $craftsman->bio }}</td></tr>
                    @endif
                    @if($craftsman->hourly_rate)
                        <tr><td style="font-weight:600;">السعر بالساعة</td><td>{{ $craftsman->hourly_rate }} ر.س</td></tr>
                    @endif
                    <tr><td style="font-weight:600;">المهن</td><td>{{ $craftsman->crafts->pluck('name')->join('، ') ?: '—' }}</td></tr>
                    <tr><td style="font-weight:600;">المهارات</td><td>{{ $craftsman->skills->pluck('skill')->join('، ') ?: '—' }}</td></tr>
                    <tr><td style="font-weight:600;">التقييم</td><td>{{ $craftsman->rating }} ⭐ ({{ $craftsman->reviews_count }} تقييم)</td></tr>
                    <tr><td style="font-weight:600;">تاريخ التقديم</td><td>{{ $craftsman->created_at->format('Y-m-d H:i') }}</td></tr>
                    @if($craftsman->status === 'rejected' && $craftsman->rejection_reason)
                        <tr><td style="font-weight:600;">سبب الرفض</td><td>{{ $craftsman->rejection_reason }}</td></tr>
                    @endif
                    @if($craftsman->approvedBy)
                        <tr><td style="font-weight:600;">تمت المراجعة بواسطة</td><td>{{ $craftsman->approvedBy->name }}</td></tr>
                    @endif
                </tbody>
            </table>
        </div>

        {{-- ===== صور الهوية ===== --}}
        <div class="card">
            <div class="card-header"><span class="card-title">صور الهوية</span></div>
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                    <p style="font-size:0.8rem; color:#6b7280; margin-bottom:6px;">الوجه الأمامي</p>
                    <img src="{{ asset('storage/' . $craftsman->national_id_front) }}" style="width:100%; border-radius:8px; border:1px solid #e5e7eb;">
                </div>
                <div>
                    <p style="font-size:0.8rem; color:#6b7280; margin-bottom:6px;">الوجه الخلفي</p>
                    <img src="{{ asset('storage/' . $craftsman->national_id_back) }}" style="width:100%; border-radius:8px; border:1px solid #e5e7eb;">
                </div>
            </div>
        </div>
    </div>

    {{-- ===== إجراءات ===== --}}
    <div class="card" style="margin-top:20px;">
        <div class="card-header"><span class="card-title">الإجراءات</span></div>

        <div style="display:flex; gap:10px; flex-wrap:wrap;">

            @if($craftsman->status === 'pending')
                {{-- موافقة --}}
                <form action="{{ route('admin.craftsmen.approve', $craftsman->id) }}" method="POST" onsubmit="return confirm('تأكيد الموافقة على هذا الحرفي؟')">
                    @csrf
                    <button type="submit" class="btn btn-success">✓ قبول الطلب</button>
                </form>

                {{-- رفض (مع سبب) --}}
                <button type="button" class="btn btn-danger" onclick="document.getElementById('reject-form').style.display='flex'">✕ رفض الطلب</button>
            @endif

            @if($craftsman->status === 'approved')
                <form action="{{ route('admin.craftsmen.toggle-status', $craftsman->id) }}" method="POST">
                    @csrf @method('PATCH')
                    <button type="submit" class="btn btn-outline">
                        {{ $craftsman->user && $craftsman->user->is_active ? 'تعطيل الحساب' : 'تفعيل الحساب' }}
                    </button>
                </form>

                <form action="{{ route('admin.craftsmen.toggle-featured', $craftsman->id) }}" method="POST">
                    @csrf @method('PATCH')
                    <button type="submit" class="btn btn-outline">
                        {{ $craftsman->is_featured ? 'إلغاء التمييز' : 'تمييز الحرفي' }}
                    </button>
                </form>
            @endif

            <a href="{{ route('admin.craftsmen.index') }}" class="btn btn-outline">رجوع</a>
        </div>

        {{-- ===== نموذج الرفض المخفي ===== --}}
        @if($craftsman->status === 'pending')
        <form id="reject-form" action="{{ route('admin.craftsmen.reject', $craftsman->id) }}" method="POST"
              style="display:none; margin-top:16px; gap:10px; align-items:flex-start;">
            @csrf
            <div style="flex:1;">
                <textarea name="reason" class="form-control" placeholder="سبب الرفض (مطلوب)" required style="min-height:70px;"></textarea>
            </div>
            <button type="submit" class="btn btn-danger">تأكيد الرفض</button>
        </form>
        @endif
    </div>

@endsection
