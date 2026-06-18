@extends('layouts.admin')

@section('title', 'إدارة المنشورات')
@section('page-title', 'إدارة المنشورات')

@section('content')

    <div class="card">

        <form method="GET" class="filter-bar">
            <select name="status" onchange="this.form.submit()">
                <option value="">كل الحالات</option>
                <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>نشط</option>
                <option value="closed" {{ request('status') === 'closed' ? 'selected' : '' }}>مغلق</option>
            </select>

            <select name="is_approved" onchange="this.form.submit()">
                <option value="">الكل (ظاهر/مخفي)</option>
                <option value="1" {{ request('is_approved') === '1' ? 'selected' : '' }}>ظاهر فقط</option>
                <option value="0" {{ request('is_approved') === '0' ? 'selected' : '' }}>مخفي فقط</option>
            </select>

            @if(request()->anyFilled(['status', 'is_approved']))
                <a href="{{ route('admin.posts.index') }}" class="btn btn-outline btn-sm">إعادة تعيين</a>
            @endif
        </form>

        @if($posts->isEmpty())
            <p style="color:#9ca3af; text-align:center; padding: 30px 0;">لا توجد نتائج</p>
        @else
            <table>
                <thead>
                    <tr><th>العنوان</th><th>العميل</th><th>المهنة</th><th>الحالة</th><th>الظهور</th><th></th></tr>
                </thead>
                <tbody>
                    @foreach($posts as $post)
                        <tr>
                            <td>{{ \Illuminate\Support\Str::limit($post->title, 40) }}</td>
                            <td>{{ $post->client->name ?? '—' }}</td>
                            <td>{{ $post->craft->name ?? $post->custom_craft ?? '—' }}</td>
                            <td>
                                <x-badge :type="$post->status === 'active' ? 'active' : 'closed'" :text="$post->status === 'active' ? 'نشط' : 'مغلق'" />
                            </td>
                            <td>
                                <x-badge :type="$post->is_approved ? 'active' : 'gray'" :text="$post->is_approved ? 'ظاهر' : 'مخفي'" />
                            </td>
                            <td style="display:flex; gap:6px;">
                                <form action="{{ route('admin.posts.toggle-visibility', $post->id) }}" method="POST">
                                    @csrf @method('PATCH')
                                    <button type="submit" class="btn btn-outline btn-sm">
                                        {{ $post->is_approved ? 'إخفاء' : 'إظهار' }}
                                    </button>
                                </form>
                                <form action="{{ route('admin.posts.destroy', $post->id) }}" method="POST" onsubmit="return confirm('تأكيد الحذف؟')">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-sm">حذف</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <x-pagination-links :paginator="$posts" />
        @endif
    </div>

@endsection
