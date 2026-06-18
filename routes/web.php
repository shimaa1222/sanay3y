<?php

use App\Http\Controllers\Web\Admin\AdminAuthController;
use App\Http\Controllers\Web\Admin\AdminBookingsController;
use App\Http\Controllers\Web\Admin\AdminCraftsController;
use App\Http\Controllers\Web\Admin\AdminCraftsmenController;
use App\Http\Controllers\Web\Admin\AdminDashboardController;
use App\Http\Controllers\Web\Admin\AdminPostsController;
use App\Http\Controllers\Web\Admin\AdminReviewsController;
use App\Http\Controllers\Web\Admin\AdminSettingsController;
use App\Http\Controllers\Web\Admin\AdminUsersController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — لوحة تحكم الأدمن فقط (Blade)
|--------------------------------------------------------------------------
| هذا المشروع يستخدم React كواجهة للعملاء والحرفيين عبر API (انظر routes/api.php).
| الـ Blade مستخدم فقط في لوحة تحكم الأدمن، وتعتمد على Laravel session العادي
| (auth:web guard) — منفصل تماماً عن Sanctum المستخدم في الـ API.
*/

// Route::redirect('/', '/admin/login');
Route::get('/', function () {
    return "HOME WORKS";
});
// ============================================================
// AUTH — تسجيل دخول/خروج الأدمن (Session)
// ============================================================
Route::prefix('admin')->name('admin.')->group(function () {

   // Route::middleware('guest:web')->group(function () {
        Route::get('/login',  [AdminAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'login']);
  //  });

    Route::post('/logout', [AdminAuthController::class, 'logout'])
        ->middleware('auth:web')
        ->name('logout');
});

// ============================================================
// ADMIN PANEL — كل الصفحات محمية بـ EnsureUserIsAdmin
// ============================================================

Route::middleware(['auth:web', \App\Http\Middleware\EnsureUserIsAdmin::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // إدارة الحرفيين
        Route::get('/craftsmen',                       [AdminCraftsmenController::class, 'index'])->name('craftsmen.index');
        Route::get('/craftsmen/{id}',                   [AdminCraftsmenController::class, 'show'])->name('craftsmen.show');
        Route::post('/craftsmen/{id}/approve',          [AdminCraftsmenController::class, 'approve'])->name('craftsmen.approve');
        Route::post('/craftsmen/{id}/reject',           [AdminCraftsmenController::class, 'reject'])->name('craftsmen.reject');
        Route::patch('/craftsmen/{id}/toggle-status',   [AdminCraftsmenController::class, 'toggleStatus'])->name('craftsmen.toggle-status');
        Route::patch('/craftsmen/{id}/toggle-featured', [AdminCraftsmenController::class, 'toggleFeatured'])->name('craftsmen.toggle-featured');

        // إدارة المستخدمين
        Route::get('/users',                      [AdminUsersController::class, 'index'])->name('users.index');
        Route::patch('/users/{id}/toggle-status',  [AdminUsersController::class, 'toggleStatus'])->name('users.toggle-status');

        // إدارة الحجوزات
        Route::get('/bookings', [AdminBookingsController::class, 'index'])->name('bookings.index');

        // إدارة المنشورات
        Route::get('/posts',                          [AdminPostsController::class, 'index'])->name('posts.index');
        Route::patch('/posts/{id}/toggle-visibility', [AdminPostsController::class, 'toggleVisibility'])->name('posts.toggle-visibility');
        Route::delete('/posts/{id}',                  [AdminPostsController::class, 'destroy'])->name('posts.destroy');

        // إدارة المهن
        Route::get('/crafts',         [AdminCraftsController::class, 'index'])->name('crafts.index');
        Route::post('/crafts',        [AdminCraftsController::class, 'store'])->name('crafts.store');
        Route::put('/crafts/{id}',    [AdminCraftsController::class, 'update'])->name('crafts.update');
        Route::delete('/crafts/{id}', [AdminCraftsController::class, 'destroy'])->name('crafts.destroy');

        // إدارة التقييمات
      Route::get('/reviews',                         [AdminReviewsController::class, 'index'])->name('reviews.index');
       Route::patch('/reviews/{id}/toggle-visibility', [AdminReviewsController::class, 'toggleVisibility'])->name('reviews.toggle-visibility');

        // الإعدادات والإحصائيات المتقدمة
        Route::get('/settings',       [AdminSettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings',       [AdminSettingsController::class, 'update'])->name('settings.update');
        Route::get('/settings/stats', [AdminSettingsController::class, 'stats'])->name('settings.stats');
    });
