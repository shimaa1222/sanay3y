@extends('layouts.admin')

@section('title', 'إدارة المهن')
@section('page-title', 'إدارة المهن')

@section('content')

    <div style="display:grid; grid-template-columns: 1fr 320px; gap: 20px;">

        {{-- ===== جدول المهن ===== --}}
        <div class="card">
            @if($crafts->isEmpty())
                <p style="color:#9ca3af; text-align:center; padding: 30px 0;">لا توجد مهن مسجلة</p>
            @else
                <table>
                    <thead>
                        <tr><th>الأيقونة</th><th>الاسم</th><th>الاسم بالإنجليزية</th><th>عدد الحرفيين</th><th>الحالة</th><th></th></tr>
                    </thead>
                    <tbody>
                        @foreach($crafts as $craft)
                            <tr>
                                <td>{{ $craft->icon ?: '🔧' }}</td>
                                <td>{{ $craft->name }}</td>
                                <td>{{ $craft->name_en ?: '—' }}</td>
                                <td>{{ $craft->craftsmen_count }}</td>
                                <td>
                                    <x-badge :type="$craft->is_active ? 'active' : 'gray'" :text="$craft->is_active ? 'مفعّل' : 'معطّل'" />
                                </td>
                                <td style="display:flex; gap:6px;">
                                    <form action="{{ route('admin.crafts.update', $craft->id) }}" method="POST">
                                        @csrf @method('PUT')
                                        <input type="hidden" name="is_active" value="{{ $craft->is_active ? 0 : 1 }}">
                                        <button type="submit" class="btn btn-outline btn-sm">
                                            {{ $craft->is_active ? 'تعطيل' : 'تفعيل' }}
                                        </button>
                                    </form>

                                    @if($craft->craftsmen_count == 0)
                                        <form action="{{ route('admin.crafts.destroy', $craft->id) }}" method="POST" onsubmit="return confirm('تأكيد حذف هذه المهنة؟')">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-sm">حذف</button>
                                        </form>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        {{-- ===== إضافة مهنة جديدة ===== --}}
        <div class="card">
            <div class="card-header"><span class="card-title">إضافة مهنة جديدة</span></div>

            <form action="{{ route('admin.crafts.store') }}" method="POST">
                @csrf

                <div class="form-group">
                    <label class="form-label">اسم المهنة *</label>
                    <input type="text" name="name" class="form-control" required>
                </div>

                <div class="form-group">
                    <label class="form-label">الاسم بالإنجليزية</label>
                    <input type="text" name="name_en" class="form-control">
                </div>

                <div class="form-group">
                    <label class="form-label">الأيقونة (emoji)</label>
                    <input type="text" name="icon" class="form-control" placeholder="🔧">
                </div>

                <div class="form-group">
                    <label class="form-label">الوصف</label>
                    <textarea name="description" class="form-control" style="min-height:70px;"></textarea>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%;">إضافة المهنة</button>
            </form>
        </div>
    </div>

@endsection
