
{{--
    استخدام:
    <x-pagination-links :paginator="$craftsmen" />
--}}
@props(['paginator'])

@if($paginator->hasPages())
<div class="pagination">
    @if($paginator->onFirstPage())
        <span>« السابق</span>
    @else
        <a href="{{ $paginator->previousPageUrl() }}">« السابق</a>
    @endif

    @foreach($paginator->getUrlRange(max(1, $paginator->currentPage() - 2), min($paginator->lastPage(), $paginator->currentPage() + 2)) as $page => $url)
        @if($page == $paginator->currentPage())
            <span class="active">{{ $page }}</span>
        @else
            <a href="{{ $url }}">{{ $page }}</a>
        @endif
    @endforeach

    @if($paginator->hasMorePages())
        <a href="{{ $paginator->nextPageUrl() }}">التالي »</a>
    @else
        <span>التالي »</span>
    @endif
</div>
@endif
