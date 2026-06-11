<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'client_id',
        'craftsman_id',
        'rating',
        'comment',
        'is_visible',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'rating'     => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        // بعد إضافة تقييم جديد، نحدث متوسط تقييم الحرفي
        static::created(function ($review) {
            $review->craftsman->updateRating();
        });
        static::deleted(function ($review) {
            $review->craftsman->updateRating();
        });
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function craftsman()
    {
        return $this->belongsTo(Craftsman::class);
    }
}
