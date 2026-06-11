<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── OTP CODES ──────────────────────────────────────────────
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('identifier');   // email أو phone
            $table->string('code', 6);
            $table->enum('type', [
                'email_verification',
                'phone_verification',
                'password_reset',
                'login',
                'register',
            ]);
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamps();

            $table->index(['identifier', 'type']);
            $table->index('expires_at');
        });

        // ─── ADMIN SETTINGS ─────────────────────────────────────────
        Schema::create('admin_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string|boolean|integer|json
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // ─── CONVERSATIONS ──────────────────────────────────────────
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_one_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_two_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->unique(['user_one_id', 'user_two_id']); // محادثة واحدة بين كل زوج
        });

        // ─── MESSAGES ───────────────────────────────────────────────
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users')->onDelete('cascade');
            $table->text('body')->nullable();
            $table->enum('type', ['text', 'image', 'file'])->default('text');
            $table->string('file_url')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['conversation_id', 'created_at']);
            $table->index(['receiver_id', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('admin_settings');
        Schema::dropIfExists('otp_codes');
    }
};
