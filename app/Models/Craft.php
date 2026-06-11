<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Craft extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'name_en', 'icon', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function craftsmen()
    {
        return $this->belongsToMany(Craftsman::class, 'craftsman_crafts')
                    ->withPivot('is_primary')
                    ->withTimestamps();
    }

    public function servicePosts()
    {
        return $this->hasMany(ServicePost::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
