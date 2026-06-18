@extends('layouts.admin')

@section('title', 'إدارة التقييمات')
@section('page-title', 'إدارة التقييمات')

@section('content')

    <div class="card">

        @if($reviews->isEmpty())
            <p style="color:#9ca3af; text-align:center; padding: 30px 0;">لا توجد تقييمات حتى الآن</p>
        @else
            <table>
                <thead>
                    <tr><th>العميل</th><th>الحرفي</th><th>التقييم</th><th>التعليق</th><th>الظهور</th><th></th></tr>
                </thead>
                <tbody>
                    @foreach($reviews as $review)
                        <tr>
                            <td>{{ $review->client->name ?? '—' }}</td>
                            <td>{{ $review->craftsman->first_name ?? '' }} {{ $review->craftsman->last_name ?? '' }}</td>
                            <td>{{ $review->rating }} ⭐</td>
                            <td>{{ \Illuminate\Support\Str::limit($review->comment, 50) ?: '—' }}</td>
                            <td>
                                <x-badge :type="$review->is_visible ? 'active' : 'gray'" :text="$review->is_visible ? 'ظاهر' : 'مخفي'" />
                            </td>
                            <td>
                                <form action="{{ route('admin.reviews.toggle-visibility', $review->id) }}" method="POST">
                                    @csrf @method('PATCH')
                                    <button type="submit" class="btn btn-outline btn-sm">
                                        {{ $review->is_visible ? 'إخفاء' : 'إظهار' }}
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <x-pagination-links :paginator="$reviews" />
        @endif
    </div>

@endsection
