@extends('layouts.admin')

@section('title', 'إدارة المستخدمين')
@section('page-title', 'إدارة المستخدمين')

@section('content')

    <div class="card">

        <form method="GET" class="filter-bar">
            <select name="role" onchange="this.form.submit()">
                <option value="">كل الأدوار</option>
                <option value="client"    {{ request('role') === 'client'    ? 'selected' : '' }}>عميل</option>
                <option value="craftsman" {{ request('role') === 'craftsman' ? 'selected' : '' }}>حرفي</option>
                <option value="admin"     {{ request('role') === 'admin'     ? 'selected' : '' }}>أدمن</option>
            </select>

            <input type="text" name="search" placeholder="بحث بالاسم أو الإيميل" value="{{ request('search') }}">

            <button type="submit" class="btn btn-primary btn-sm">تصفية</button>
            @if(request()->anyFilled(['role', 'search']))
                <a href="{{ route('admin.users.index') }}" class="btn btn-outline btn-sm">إعادة تعيين</a>
            @endif
        </form>

        @if($users->isEmpty())
            <p style="color:#9ca3af; text-align:center; padding: 30px 0;">لا توجد نتائج</p>
        @else
            <table>
                <thead>
                    <tr><th>الاسم</th><th>الإيميل</th><th>الدور</th><th>الحالة</th><th>تاريخ التسجيل</th><th></th></tr>
                </thead>
                <tbody>
                    @foreach($users as $user)
                        <tr>
                            <td>{{ $user->name }}</td>
                            <td>{{ $user->email }}</td>
                            <td>
                                @php
                                    $roleText = ['client' => 'عميل', 'craftsman' => 'حرفي', 'admin' => 'أدمن'];
                                @endphp
                                {{ $roleText[$user->role] ?? $user->role }}
                            </td>
                            <td>
                                <x-badge :type="$user->is_active ? 'active' : 'rejected'" :text="$user->is_active ? 'مفعّل' : 'موقوف'" />
                            </td>
                            <td>{{ $user->created_at->format('Y-m-d') }}</td>
                            <td>
                                @if($user->role !== 'admin')
                                    <form action="{{ route('admin.users.toggle-status', $user->id) }}" method="POST">
                                        @csrf @method('PATCH')
                                        <button type="submit" class="btn btn-outline btn-sm">
                                            {{ $user->is_active ? 'تعطيل' : 'تفعيل' }}
                                        </button>
                                    </form>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <x-pagination-links :paginator="$users" />
        @endif
    </div>

@endsection
