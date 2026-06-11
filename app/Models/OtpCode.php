<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    protected $fillable = [
        'user_id',
        'identifier',
        'code',
        'type',
        'expires_at',
        'used',
        'attempts',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used'       => 'boolean',
    ];

    // ─── Types ────────────────────────────────────────────────
    const TYPE_EMAIL_VERIFICATION = 'email_verification';
    const TYPE_PHONE_VERIFICATION = 'phone_verification';
    const TYPE_PASSWORD_RESET     = 'password_reset';
    const TYPE_LOGIN              = 'login';
    const TYPE_REGISTER           = 'register';

    // ─── Relationships ─────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ─── Helpers ───────────────────────────────────────────────

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return !$this->used && !$this->isExpired() && $this->attempts < 3;
    }

    /**
     * تنظيف الأكواد المنتهية (يُستدعى من Scheduler يومياً)
     */
    public static function cleanup(): int
    {
        return static::where('expires_at', '<', now()->subHour())->delete();
    }
}
