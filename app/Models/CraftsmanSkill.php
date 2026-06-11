<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;  // ← أضف
class CraftsmanSkill extends Model
{
    use HasFactory;  
    protected $fillable = ['craftsman_id', 'skill'];

    public function craftsman()
    {
        return $this->belongsTo(Craftsman::class);
    }
}
