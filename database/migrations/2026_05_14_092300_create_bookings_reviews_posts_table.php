<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // جدول الحجوزات
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique(); // #A1B2C3D4
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('craftsman_id')->constrained('craftsmen')->onDelete('cascade');
            $table->foreignId('service_id')->nullable()->constrained('craftsman_services')->nullOnDelete();
            $table->string('service_title'); // نسخة من اسم الخدمة وقت الحجز
            $table->date('booking_date');
            $table->time('booking_time');
            $table->text('notes')->nullable(); // طلبات خاصة وملاحظات
            $table->string('location')->nullable(); // موقع الخدمة
            $table->decimal('service_price', 10, 2);
            $table->decimal('platform_fee', 10, 2)->default(0);
            $table->decimal('total_price', 10, 2);
            $table->enum('status', [
                'pending',      // قيد الانتظار
                'confirmed',    // مؤكد
                'in_progress',  // قيد التنفيذ
                'completed',    // مكتمل
                'cancelled',    // ملغي
                'rejected',     // مرفوض من الحرفي
            ])->default('pending');
            $table->string('cancellation_reason')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // تقييمات العملاء للحرفيين
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('craftsman_id')->constrained('craftsmen')->onDelete('cascade');
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->text('comment')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->unique(['booking_id', 'client_id']); // تقييم واحد لكل حجز
        });

        // جدول الإشعارات
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // ======================================================
        // جدول المنشورات (Posts) - الميزة الجديدة
        // العملاء يكتبون طلبات لخدمات غير متوفرة على الموقع
        // تظهر للحرفيين فقط ليتواصلوا معهم
        // ======================================================
        Schema::create('service_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->string('title'); // عنوان الطلب
            $table->text('description'); // وصف تفصيلي للخدمة المطلوبة
            $table->foreignId('craft_id')->nullable()->constrained('crafts')->nullOnDelete();
            // المهنة المقترحة (اختياري، قد لا يعرف العميل تصنيف الخدمة)
            $table->string('custom_craft')->nullable(); // اسم المهنة إذا لم تكن في القائمة
            $table->string('location')->nullable(); // موقع الخدمة المطلوبة
            $table->string('city')->nullable();
            $table->decimal('budget_from', 10, 2)->nullable(); // ميزانية من
            $table->decimal('budget_to', 10, 2)->nullable();   // ميزانية إلى
            $table->date('needed_by')->nullable(); // تاريخ الحاجة
            $table->enum('urgency', ['low', 'medium', 'high', 'emergency'])->default('medium');
            // low = غير عاجل، medium = عادي، high = عاجل، emergency = طارئ
            $table->enum('status', ['active', 'closed', 'expired'])->default('active');
            // active = نشط ويظهر للحرفيين
            // closed = أغلقه العميل (وجد حرفي)
            // expired = انتهت صلاحيته
            $table->boolean('is_approved')->default(true); // الأدمن يمكنه إخفاء المنشورات
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('responses_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // ردود الحرفيين على المنشورات
        Schema::create('post_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('service_posts')->onDelete('cascade');
            $table->foreignId('craftsman_id')->constrained('craftsmen')->onDelete('cascade');
            $table->text('message'); // رسالة الحرفي للعميل
            $table->decimal('offered_price', 10, 2)->nullable(); // السعر المقترح
            $table->unsignedInteger('estimated_days')->nullable(); // مدة الإنجاز بالأيام
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();
            $table->unique(['post_id', 'craftsman_id']); // رد واحد لكل حرفي على كل منشور
        });

        // صور المنشورات (اختياري - العميل يرفق صور)
        Schema::create('post_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('service_posts')->onDelete('cascade');
            $table->string('image');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_images');
        Schema::dropIfExists('post_responses');
        Schema::dropIfExists('service_posts');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('bookings');
    }
};
