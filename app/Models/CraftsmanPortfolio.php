<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CraftsmanPortfolio extends Model
{
    use HasFactory;
    protected $fillable = ['craftsman_id', 'image', 'title', 'description'];

    public function craftsman()
    {
        return $this->belongsTo(Craftsman::class);
    }

    public function getImageUrlAttribute(): string
    {
        return asset('storage/' . $this->image);
    }
}
