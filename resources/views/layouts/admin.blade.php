<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'لوحة التحكم') - صنايعي</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --primary-light: #dbeafe;
            --success: #059669;
            --success-light: #d1fae5;
            --danger: #dc2626;
            --danger-light: #fee2e2;
            --warning: #d97706;
            --warning-light: #fef3c7;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-700: #374151;
            --gray-900: #111827;
            --sidebar-bg: #1e293b;
            --sidebar-hover: #334155;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Tahoma', 'Segoe UI', sans-serif;
            background: var(--gray-50);
            color: var(--gray-900);
            display: flex;
            min-height: 100vh;
        }

        /* ===== SIDEBAR ===== */
        .sidebar {
            width: 260px;
            background: var(--sidebar-bg);
            color: #fff;
            position: fixed;
            top: 0; right: 0; bottom: 0;
            overflow-y: auto;
            z-index: 50;
        }
        .sidebar-logo {
            padding: 22px 20px;
            font-size: 1.3rem;
            font-weight: bold;
            border-bottom: 1px solid #334155;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .sidebar-logo span { color: var(--primary-light); }
        .sidebar-nav { padding: 14px 10px; }
        .sidebar-section-title {
            font-size: 0.72rem;
            color: var(--gray-400);
            padding: 14px 12px 6px;
            text-transform: uppercase;
        }
        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 11px 14px;
            color: #cbd5e1;
            text-decoration: none;
            border-radius: 8px;
            margin-bottom: 2px;
            font-size: 0.92rem;
            transition: background 0.15s;
        }
        .sidebar-link:hover { background: var(--sidebar-hover); color: #fff; }
        .sidebar-link.active {
            background: var(--primary);
            color: #fff;
        }
        .sidebar-link .badge-count {
            margin-right: auto;
            background: var(--danger);
            color: #fff;
            font-size: 0.7rem;
            padding: 1px 7px;
            border-radius: 10px;
            font-weight: bold;
        }

        /* ===== MAIN CONTENT ===== */
        .main {
            margin-right: 260px;
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        .topbar {
            background: #fff;
            border-bottom: 1px solid var(--gray-200);
            padding: 14px 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .topbar h1 {
            font-size: 1.15rem;
            color: var(--gray-900);
        }
        .topbar-user {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .topbar-user span { font-size: 0.9rem; color: var(--gray-700); }
        .logout-btn {
            background: var(--danger-light);
            color: var(--danger);
            border: none;
            padding: 7px 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            cursor: pointer;
            font-family: inherit;
        }
        .logout-btn:hover { background: #fecaca; }

        .content { padding: 28px; }

        /* ===== ALERTS ===== */
        .alert {
            padding: 13px 18px;
            border-radius: 8px;
            margin-bottom: 18px;
            font-size: 0.9rem;
        }
        .alert-success { background: var(--success-light); color: var(--success); }
        .alert-error   { background: var(--danger-light);  color: var(--danger); }

        /* ===== CARDS ===== */
        .card {
            background: #fff;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 20px;
        }
        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        .card-title { font-size: 1rem; font-weight: bold; color: var(--gray-900); }

        /* ===== STAT CARDS ===== */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .stat-card {
            background: #fff;
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 18px 20px;
        }
        .stat-card .stat-label { font-size: 0.82rem; color: var(--gray-500); margin-bottom: 6px; }
        .stat-card .stat-value { font-size: 1.7rem; font-weight: bold; color: var(--gray-900); }
        .stat-card .stat-sub { font-size: 0.78rem; color: var(--gray-400); margin-top: 4px; }

        /* ===== TABLE ===== */
        table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        thead th {
            text-align: right;
            padding: 10px 12px;
            background: var(--gray-50);
            color: var(--gray-500);
            font-weight: 600;
            border-bottom: 1px solid var(--gray-200);
            font-size: 0.8rem;
        }
        tbody td {
            padding: 12px;
            border-bottom: 1px solid var(--gray-100);
            color: var(--gray-700);
        }
        tbody tr:hover { background: var(--gray-50); }

        /* ===== BADGES ===== */
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .badge-pending { background: var(--warning-light); color: var(--warning); }
        .badge-approved, .badge-active, .badge-success { background: var(--success-light); color: var(--success); }
        .badge-rejected, .badge-closed, .badge-danger { background: var(--danger-light); color: var(--danger); }
        .badge-gray { background: var(--gray-100); color: var(--gray-500); }

        /* ===== BUTTONS ===== */
        .btn {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            border: none;
            cursor: pointer;
            text-decoration: none;
            font-family: inherit;
        }
        .btn-primary { background: var(--primary); color: #fff; }
        .btn-primary:hover { background: var(--primary-dark); }
        .btn-success { background: var(--success); color: #fff; }
        .btn-danger { background: var(--danger); color: #fff; }
        .btn-outline { background: #fff; border: 1px solid var(--gray-200); color: var(--gray-700); }
        .btn-sm { padding: 5px 12px; font-size: 0.78rem; }

        /* ===== FORMS ===== */
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 0.85rem; color: var(--gray-700); margin-bottom: 6px; font-weight: 600; }
        .form-control {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--gray-200);
            border-radius: 8px;
            font-size: 0.9rem;
            font-family: inherit;
        }
        .form-control:focus { outline: none; border-color: var(--primary); }

        /* ===== PAGINATION ===== */
        .pagination { display: flex; gap: 6px; margin-top: 18px; }
        .pagination a, .pagination span {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            text-decoration: none;
            color: var(--gray-700);
            border: 1px solid var(--gray-200);
        }
        .pagination .active { background: var(--primary); color: #fff; border-color: var(--primary); }

        /* ===== FILTER BAR ===== */
        .filter-bar { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
        .filter-bar select, .filter-bar input {
            padding: 8px 12px;
            border: 1px solid var(--gray-200);
            border-radius: 8px;
            font-size: 0.85rem;
            font-family: inherit;
        }
    </style>
    @stack('styles')
</head>
<body>

    {{-- ===== SIDEBAR ===== --}}
    <aside class="sidebar">
        <div class="sidebar-logo">
            🛠️ صنايعي <span>Admin</span>
        </div>

        <nav class="sidebar-nav">
            <div class="sidebar-section-title">الرئيسية</div>
            <a href="{{ route('admin.dashboard') }}" class="sidebar-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                📊 لوحة التحكم
            </a>

            <div class="sidebar-section-title">إدارة المنصة</div>
            <a href="{{ route('admin.craftsmen.index') }}" class="sidebar-link {{ request()->routeIs('admin.craftsmen.*') ? 'active' : '' }}">
                👷 الحرفيون
                @php($pendingCount = \App\Models\Craftsman::pending()->count())
                @if($pendingCount > 0)
                    <span class="badge-count">{{ $pendingCount }}</span>
                @endif
            </a>
            <a href="{{ route('admin.users.index') }}" class="sidebar-link {{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
                👥 المستخدمون
            </a>
            <a href="{{ route('admin.bookings.index') }}" class="sidebar-link {{ request()->routeIs('admin.bookings.*') ? 'active' : '' }}">
                📅 الحجوزات
            </a>
            <a href="{{ route('admin.posts.index') }}" class="sidebar-link {{ request()->routeIs('admin.posts.*') ? 'active' : '' }}">
                📝 المنشورات
            </a>
            <a href="{{ route('admin.reviews.index') }}" class="sidebar-link {{ request()->routeIs('admin.reviews.*') ? 'active' : '' }}">
                ⭐ التقييمات
            </a>
            <a href="{{ route('admin.crafts.index') }}" class="sidebar-link {{ request()->routeIs('admin.crafts.*') ? 'active' : '' }}">
                🔧 المهن
            </a>

            <div class="sidebar-section-title">النظام</div>
            <a href="{{ route('admin.settings.stats') }}" class="sidebar-link {{ request()->routeIs('admin.settings.stats') ? 'active' : '' }}">
                📈 إحصائيات متقدمة
            </a>
            <a href="{{ route('admin.settings.index') }}" class="sidebar-link {{ request()->routeIs('admin.settings.index') ? 'active' : '' }}">
                ⚙️ الإعدادات
            </a>
        </nav>
    </aside>

    {{-- ===== MAIN ===== --}}
    <div class="main">
        <header class="topbar">
            <h1>@yield('page-title', 'لوحة التحكم')</h1>
            <div class="topbar-user">
                <span>{{ auth('web')->user()->name ?? '' }}</span>
                <form action="{{ route('admin.logout') }}" method="POST" style="margin:0">
                    @csrf
                    <button type="submit" class="logout-btn">تسجيل الخروج</button>
                </form>
            </div>
        </header>

        <main class="content">
            @if(session('success'))
                <div class="alert alert-success">{{ session('success') }}</div>
            @endif
            @if(session('error'))
                <div class="alert alert-error">{{ session('error') }}</div>
            @endif
            @if($errors->any())
                <div class="alert alert-error">{{ $errors->first() }}</div>
            @endif

            @yield('content')
        </main>
    </div>

    @stack('scripts')
</body>
</html>
