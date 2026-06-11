<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServicePost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'title',
        'description',
        'craft_id',
        'custom_craft',
        'location',
        'city',
        'budget_from',
        'budget_to',
        'needed_by',
        'urgency',
        'status',
        'is_approved',
        'views_count',
        'responses_count',
    ];

    protected $casts = [
        'needed_by'   => 'date',
        'is_approved' => 'boolean',
        'budget_from' => 'decimal:2',
        'budget_to'   => 'decimal:2',
    ];

    // ========================
    // Relationships
    // ========================

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function craft()
    {
        return $this->belongsTo(Craft::class);
    }

    public function responses()
    {
        return $this->hasMany(PostResponse::class, 'post_id');
    }

    public function images()
    {
        return $this->hasMany(PostImage::class, 'post_id');
    }

    // ========================
    // Scopes
    // ========================

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->where('is_approved', true);
    }

    public function scopeForCraftsmen($query)
    {
        // المنشورات النشطة التي تظهر للحرفيين فقط
        return $query->active()->latest();
    }

    // ========================
    // Helpers
    // ========================

    public function getUrgencyLabelAttribute(): string
    {
        return match($this->urgency) {
            'low'       => 'غير عاجل',
            'medium'    => 'عادي',
            'high'      => 'عاجل',
            'emergency' => 'طارئ',
            default     => $this->urgency,
        };
    }

    public function getUrgencyColorAttribute(): string
    {
        return match($this->urgency) {
            'low'       => 'green',
            'medium'    => 'blue',
            'high'      => 'orange',
            'emergency' => 'red',
            default     => 'gray',
        };
    }

    public function getBudgetRangeAttribute(): ?string
    {
        if ($this->budget_from && $this->budget_to) {
            return "من {$this->budget_from} إلى {$this->budget_to} [جنيه]";
        } elseif ($this->budget_from) {
            return "من {$this->budget_from} جنيه";
        }
        return null;
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }
}
