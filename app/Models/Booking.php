<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_number',
        'client_id',
        'craftsman_id',
        'service_id',
        'service_title',
        'booking_date',
        'booking_time',
        'notes',
        'location',
        'service_price',
        'platform_fee',
        'total_price',
        'status',
        'cancellation_reason',
        'confirmed_at',
        'completed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'booking_date'  => 'date',
        'booking_time'  => 'datetime:H:i',
        'confirmed_at'  => 'datetime',
        'completed_at'  => 'datetime',
        'cancelled_at'  => 'datetime',
        'service_price' => 'decimal:2',
        'platform_fee'  => 'decimal:2',
        'total_price'   => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($booking) {
            if (empty($booking->booking_number)) {
                $booking->booking_number = strtoupper(Str::random(8));
            }
        });
    }

    // ========================
    // Relationships
    // ========================

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function craftsman()
    {
        return $this->belongsTo(Craftsman::class);
    }

    public function service()
    {
        return $this->belongsTo(CraftsmanService::class, 'service_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    // ========================
    // Scopes
    // ========================

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed'])
                     ->where('booking_date', '>=', now()->toDateString());
    }

    public function scopePast($query)
    {
        return $query->whereIn('status', ['completed', 'cancelled', 'rejected'])
                     ->orWhere('booking_date', '<', now()->toDateString());
    }

    // ========================
    // Helpers
    // ========================

    public function isPending(): bool    { return $this->status === 'pending'; }
    public function isConfirmed(): bool  { return $this->status === 'confirmed'; }
    public function isCompleted(): bool  { return $this->status === 'completed'; }
    public function isCancelled(): bool  { return $this->status === 'cancelled'; }

    public function canBeReviewed(): bool
    {
        return $this->isCompleted() && !$this->review()->exists();
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending'     => 'قيد الانتظار',
            'confirmed'   => 'مؤكد',
            'in_progress' => 'قيد التنفيذ',
            'completed'   => 'مكتمل',
            'cancelled'   => 'ملغي',
            'rejected'    => 'مرفوض',
            default       => $this->status,
        };
    }
}
