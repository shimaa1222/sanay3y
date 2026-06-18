@extends('layouts.admin')

@section('title', 'إدارة الحرفيين')
@section('page-title', 'إدارة الحرفيين')

@section('content')

    <div class="card">

        {{-- ===== فلاتر ===== --}}
        <form method="GET" class="filter-bar">
            <select name="status" onchange="this.form.submit()">
                <option value="">كل الحالات</option>
                <option value="pending"  {{ request('status') === 'pending'  ? 'selected' : '' }}>معلق</option>
                <option value="approved" {{ request('status') === 'approved' ? 'selected' : '' }}>مقبول</option>
                <option value="rejected" {{ request('status') === 'rejected' ? 'selected' : '' }}>مرفوض</option>
            </select>

            <input type="text" name="city" placeholder="المدينة" value="{{ request('city') }}">
            <input type="text" name="search" placeholder="بحث بالاسم أو الإيميل" value="{{ request('search') }}">

            <button type="submit" class="btn btn-primary btn-sm">تصفية</button>
            @if(request()->anyFilled(['status', 'city', 'search']))
                <a href="{{ route('admin.craftsmen.index') }}" class="btn btn-outline btn-sm">إعادة تعيين</a>
            @endif
        </form>

        {{-- ===== الجدول ===== --}}
        @if($craftsmen->isEmpty())
            <p style="color:#9ca3af; text-align:center; padding: 30px 0;">لا توجد نتائج</p>
        @else
            <table>
                <thead>
                    <tr>
                        <th>الاسم</th><th>الإيميل</th><th>المدينة</th><th>الحالة</th><th>مميز</th><th>تاريخ التقديم</th><th></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($craftsmen as $craftsman)
                        <tr>
                            <td>{{ $craftsman->first_name }} {{ $craftsman->last_name }}</td>
                            <td>{{ $craftsman->email }}</td>
                            <td>{{ $craftsman->city }}</td>
                            <td>
                                @php
                                    $statusBadge = ['pending' => 'pending', 'approved' => 'approved', 'rejected' => 'rejected'];
                                    $statusText  = ['pending' => 'معلق', 'approved' => 'مقبول', 'rejected' => 'مرفوض'];
                                @endphp
                                <x-badge :type="$statusBadge[$craftsman->status]" :text="$statusText[$craftsman->status]" />
                            </td>
                            <td>{{ $craftsman->is_featured ? '⭐' : '—' }}</td>
                            <td>{{ $craftsman->created_at->format('Y-m-d') }}</td>
                            <td>
                                <a href="{{ route('admin.craftsmen.show', $craftsman->id) }}" class="btn btn-outline btn-sm">عرض</a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <x-pagination-links :paginator="$craftsmen" />
        @endif
    </div>

@endsection
