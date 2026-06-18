{{--
    استخدام:
    <x-stat-card label="إجمالي المستخدمين" :value="$stats['users']['total']" sub="+12 هذا الشهر" />
--}}
@props(['label', 'value', 'sub' => null])

<div class="stat-card">
    <div class="stat-label">{{ $label }}</div>
    <div class="stat-value">{{ $value }}</div>
    @if($sub)
        <div class="stat-sub">{{ $sub }}</div>
    @endif
</div>
