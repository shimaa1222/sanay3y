<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostImage extends Model
{
    protected $fillable = ['post_id', 'image'];

    public function post()
    {
        return $this->belongsTo(ServicePost::class, 'post_id');
    }

    public function getImageUrlAttribute(): string
    {
        return asset('storage/' . $this->image);
    }
}
