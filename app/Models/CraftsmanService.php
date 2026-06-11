<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CraftsmanService extends Model
{
    use HasFactory;

    protected $fillable = [
        'craftsman_id',
        'title',
        'description',
        'price_from',
        'price_label',
    ];

    protected $casts = ['price_from' => 'decimal:2'];

    public function craftsman()
    {
        return $this->belongsTo(Craftsman::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'service_id');
    }
}
